import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ user: null });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ user: null });
    }

    try {
        await dbConnect();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                ...user.toObject(),
                photo: user.photo || ''
            }
        });
    } catch (e) {
        return NextResponse.json({ user: null });
    }
}

