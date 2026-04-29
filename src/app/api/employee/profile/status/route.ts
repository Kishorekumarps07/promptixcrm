import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import EmployeeProfile from '@/models/EmployeeProfile';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload: any = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const profile = await EmployeeProfile.findOne({ userId: payload.userId });
        const userData = await User.findById(payload.userId).select('name email photo');

        if (!userData) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            exists: !!profile,
            completed: profile ? profile.profileCompleted : false,
            profile: profile ? { ...profile.toObject(), name: userData.name, email: userData.email } : null,
            user: userData
        });

    } catch (error: any) {
        console.error('Profile Check API Error:', error.message);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
