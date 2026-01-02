import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    await User.updateOne({ email: 'student2@gmail.com' }, { isOnboardingCompleted: false });
    return NextResponse.json({ message: 'student2 reset to NOT onboarded' });
}
