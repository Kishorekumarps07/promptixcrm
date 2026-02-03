import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();

        // Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const payload: any = verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const userId = params.id;

        const user = await User.findById(userId).select('-password').lean();
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const profile = await EmployeeProfile.findOne({ userId }).lean();

        return NextResponse.json({
            user,
            profile: profile || null
        });

    } catch (error: any) {
        console.error('Admin Profile Detail Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
