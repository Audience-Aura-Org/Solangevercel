import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development_only';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return NextResponse.json({
            authenticated: true,
            user: {
                userId: decoded.userId,
                name: decoded.name,
                role: decoded.role,
                email: decoded.email,
            }
        }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
