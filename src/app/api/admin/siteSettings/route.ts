import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AdminSettings from '@/models/AdminSettings';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function verifyAdmin(request?: Request) {
    // Prefer cookie-based token (current request), fall back to Authorization header if present
    const cookieStore = await cookies();
    let token = cookieStore.get('admin_token')?.value;

    if (!token && request) {
        const auth = request.headers.get('authorization') || request.headers.get('Authorization');
        if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1];
    }

    if (!token) return false;

    const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret';
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

// Public GET — used by the homepage server component; no auth needed
export async function GET() {
    try {
        await connectToDatabase();
        // findOne returns null if no settings yet — that's fine, frontend uses defaults
        const settings = await AdminSettings.findOne().lean();
        return NextResponse.json({ settings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Admin PATCH — requires auth
export async function PATCH(request: Request) {
    if (!(await verifyAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();
        const body = await request.json();

        // Use replaceOne with upsert so the entire settings object is replaced
        // This avoids partial-update issues with nested arrays
        const result = await AdminSettings.findOneAndUpdate(
            {}, // match the single settings doc
            { $set: body }, // update only the fields sent
            { new: true, upsert: true, runValidators: false }
        );

        return NextResponse.json({ settings: result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
