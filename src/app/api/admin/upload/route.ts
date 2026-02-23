import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

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

export async function POST(request: Request) {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { filename, dataUrl } = body as { filename: string; dataUrl: string };
        if (!filename || !dataUrl) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return NextResponse.json({ error: 'Invalid data URL' }, { status: 400 });

        const mime = matches[1];
        const base64 = matches[2];

        // Server-side validation
        const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'image/gif'];
        if (!ALLOWED.includes(mime)) return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });

        const buffer = Buffer.from(base64, 'base64');
        const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 20 * 1024 * 1024); // 20MB default
        if (buffer.length > MAX_BYTES) return NextResponse.json({ error: 'File too large' }, { status: 400 });

        // Use GridFS to store file in MongoDB so we don't rely on writable filesystem
        await connectToDatabase();
        const db = mongoose.connection.db as any;
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

        const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
        const uploadStream = bucket.openUploadStream(safeName, {
            metadata: { mime },
            contentType: mime,
        });

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
