import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import { serialize } from 'cookie';

export async function POST(req: Request) {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
        userId: user._id,
        role: user.role,
        isOnboardingCompleted: user.isOnboardingCompleted || false
    });

    const cookie = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'strict',
    });

    const response = NextResponse.json({
        message: 'Login successful',
        user: { name: user.name, email: user.email, role: user.role }
    });

    response.headers.set('Set-Cookie', cookie);

    return response;
}
