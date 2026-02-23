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

        return new Response(downloadStream, { headers });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
