import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId, GridFSBucket } from 'mongodb';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        await connectToDatabase();
        const db = mongoose.connection.db as any;
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

        const _id = new ObjectId(id);
        const filesColl = db.collection('uploads.files');
        const fileDoc = await filesColl.findOne({ _id });
        if (!fileDoc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const downloadStream = bucket.openDownloadStream(_id);

        const headers = new Headers();
        headers.set('Content-Type', fileDoc.contentType || fileDoc.metadata?.mime || 'application/octet-stream');
        headers.set('Content-Length', String(fileDoc.length || ''));
        headers.set('Cache-Control', 'public, max-age=31536000');

        // Convert Node Readable stream into a Buffer before returning (compatible with Next.js Response)
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            downloadStream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
            downloadStream.on('end', () => resolve());
            downloadStream.on('error', (err: any) => reject(err));
        });

        const body = Buffer.concat(chunks);
        return new Response(body, { headers });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
