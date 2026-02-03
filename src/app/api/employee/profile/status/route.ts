import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmployeeProfile from '@/models/EmployeeProfile';
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
        if (!payload || payload.role !== 'EMPLOYEE') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const profile = await EmployeeProfile.findOne({ userId: payload.userId });
        const user = await (await import('@/models/User')).default.findById(payload.userId).select('name email');

        return NextResponse.json({
            exists: !!profile,
            completed: profile ? profile.profileCompleted : false,
            // Merge profile with user details if needed, or return separate
            profile: profile ? { ...profile.toObject(), name: user?.name, email: user?.email } : null,
            user: user // Also returning explicitly
        });

    } catch (error: any) {
        console.error('Profile Check Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
