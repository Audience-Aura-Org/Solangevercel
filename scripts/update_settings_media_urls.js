const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

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

  // Build filename -> id map from GridFS uploads.files
  const filesColl = db.collection('uploads.files');
  const files = await filesColl.find({}).toArray();
  const nameToId = new Map();
  for (const f of files) {
    nameToId.set(f.filename, f._id.toString());
  }

  // Update AdminSettings (collection name may be 'adminsettings' or similar)
  // Attempt common names
  const possibleCollections = ['adminsettings', 'admin_settings', 'adminSettings', 'siteSettings', 'sitesettings'];
  let settingsCollName = null;
  for (const name of possibleCollections) {
    const exists = await db.listCollections({ name }).hasNext();
    if (exists) { settingsCollName = name; break; }
  }

  if (!settingsCollName) {
    // fallback to find any one doc in collections that has a 'media' array
    const collections = await db.listCollections().toArray();
    for (const c of collections) {
      const coll = db.collection(c.name);
      const doc = await coll.findOne({ media: { $exists: true } });
      if (doc) { settingsCollName = c.name; break; }
    }
  }

  if (!settingsCollName) {
    console.error('Could not find settings collection containing media array.');
    await client.close();
    return;
  }

  const settingsColl = db.collection(settingsCollName);
  const settingsDoc = await settingsColl.findOne({});
  if (!settingsDoc) {
    console.error('No settings document found in', settingsCollName);
    await client.close();
    return;
  }

  const media = settingsDoc.media || [];
  let changed = false;
  const updatedMedia = media.map(item => {
    if (!item || !item.url) return item;
    // extract filename if url contains public/uploads or just filename
    const u = item.url;
    const filenameMatch = u.match(/([^\/]+\.(mp4|webm|jpg|jpeg|png|gif|webp))$/i);
    if (filenameMatch) {
      const fname = filenameMatch[1];
      if (nameToId.has(fname)) {
        const newUrl = `/api/uploads/${nameToId.get(fname)}`;
        if (newUrl !== u) { changed = true; return { ...item, url: newUrl }; }
      }
    }
    return item;
  });

  if (changed) {
    // Update the settings doc
    await settingsColl.updateOne({ _id: settingsDoc._id }, { $set: { media: updatedMedia } });
    console.log('Updated settings media URLs in collection', settingsCollName);
  } else {
    console.log('No media URLs needed updating');
  }

  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
