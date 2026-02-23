import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

// ─── Route Segment Config ─────────────────────────────────────────────────────
// Raises the body-size limit for this route so large video uploads don't get
// rejected with a plain-text "Request Entity Too Large" before reaching our code.
export const maxDuration = 60;       // allow up to 60 s for large file transfers
export const dynamic = 'force-dynamic';

// Pages-router style config — still respected by some Next.js versions for body parsing
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb',
        },
        responseLimit: false,
    },
};

// ─── Auth helper ──────────────────────────────────────────────────────────────
async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return false;
    const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret';
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

// ─── POST /api/admin/upload ───────────────────────────────────────────────────
export async function POST(request: Request) {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Read as raw text first so that a size-limit truncation can be caught
        // and returned as a clean JSON error instead of a JSON parse crash.
        const rawText = await request.text();

        let body: { filename: string; dataUrl: string };
        try {
            body = JSON.parse(rawText);
        } catch {
            return NextResponse.json(
                { error: `Upload body could not be parsed. It may be too large for the server. Received: ${rawText.slice(0, 120)}` },
                { status: 413 }
            );
        }

        const { filename, dataUrl } = body;
        if (!filename || !dataUrl) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return NextResponse.json({ error: 'Invalid data URL' }, { status: 400 });

        const mime = matches[1];
        const base64 = matches[2];

        const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'image/gif'];
        if (!ALLOWED.includes(mime)) return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });

        const buffer = Buffer.from(base64, 'base64');
        const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 100 * 1024 * 1024); // 100 MB
        if (buffer.length > MAX_BYTES) {
            return NextResponse.json({
                error: `File too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_BYTES / 1024 / 1024} MB.`,
            }, { status: 413 });
        }

        // Store in MongoDB GridFS — no reliance on a writable filesystem
        await connectToDatabase();
        const db = mongoose.connection.db as any;
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

        const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
        const uploadStream = bucket.openUploadStream(safeName, { metadata: { mime } });

        uploadStream.end(buffer);

        await new Promise<void>((resolve, reject) => {
            uploadStream.on('finish', () => resolve());
            uploadStream.on('error', (err) => reject(err));
        });

        const fileId = uploadStream.id as unknown as { toString(): string };
        const url = `/api/uploads/${fileId.toString()}`;
        return NextResponse.json({ url, size: buffer.length, mime, id: fileId.toString() });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
