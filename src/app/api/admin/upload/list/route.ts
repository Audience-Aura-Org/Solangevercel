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

export async function GET() {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        // List files stored in GridFS 'uploads' bucket
        await connectToDatabase();
        const db = mongoose.connection.db as any;
        const filesColl = db.collection('uploads.files');
        const files = await filesColl.find().sort({ uploadDate: -1 }).toArray();
        const items = files.map((f: any) => ({
            _id: f._id.toString(),
            name: f.filename,
            url: `/api/uploads/${f._id.toString()}`,
            size: f.length,
            mime: f.contentType || f.metadata?.mime,
            uploadDate: f.uploadDate
        }));
        return NextResponse.json({ files: items });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
