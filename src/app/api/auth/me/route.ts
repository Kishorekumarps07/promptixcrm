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

    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');

    return NextResponse.json({
        user: {
            ...user.toObject(),
            photo: user.photo || '' // Ensure photo is returned
        }
    });
}
