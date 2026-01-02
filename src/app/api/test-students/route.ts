import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    const students = await User.find({ role: 'STUDENT' }, 'email isOnboardingCompleted');
    return NextResponse.json({ students });
}
