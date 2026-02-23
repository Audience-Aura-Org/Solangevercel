const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');

function loadEnvVar(name) {
  if (process.env[name]) return process.env[name];
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return undefined;
  const content = fs.readFileSync(envPath, 'utf8');
  const re = new RegExp(`^${name}=(.*)$`, 'm');
  const m = content.match(re);
  if (m) return m[1].trim();
  return undefined;
}

const MONGODB_URI = loadEnvVar('MONGODB_URI') || process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment or .env.local');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found at', uploadsDir);
    await client.close();
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  if (files.length === 0) {
    console.log('No files found in public/uploads');
    await client.close();
    return;
  }

  for (const fname of files) {
    const filePath = path.join(uploadsDir, fname);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    // Skip if already uploaded (filename match)
    const existing = await db.collection('uploads.files').findOne({ filename: fname });
    if (existing) {
      console.log(`Skipping ${fname} (already uploaded as ${existing._id})`);
      continue;
    }

    console.log('Uploading', fname);
    const stream = fs.createReadStream(filePath);
    const uploadStream = bucket.openUploadStream(fname, {});

    await new Promise((resolve, reject) => {
      stream.pipe(uploadStream)
        .on('error', (err) => reject(err))
        .on('finish', () => {
          console.log(`Uploaded ${fname} -> id=${uploadStream.id.toString()} url=/api/uploads/${uploadStream.id.toString()}`);
          resolve();
        });
    });
  }

  await client.close();
  console.log('Migration complete');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
