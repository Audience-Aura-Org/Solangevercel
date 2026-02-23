import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@solange.salon';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'password123';

export async function GET() {
    try {
        await connectToDatabase();

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            return NextResponse.json({ message: `Admin user already exists. Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}` });
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const adminUser = await User.create({
            name: 'Super Admin',
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
        });

        return NextResponse.json({
            message: 'Admin user created successfully!',
            credentials: {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: adminUser.role,
            },
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
