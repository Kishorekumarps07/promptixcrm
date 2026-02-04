import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const payload: any = verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        // Fetch all employees
        // Fetch all employees (case insensitive role check)
        const employees = await User.find({
            role: { $in: ['EMPLOYEE', 'Employee', 'employee'] }
        })
            .select('name email role status createdAt photo')
            .lean();

        console.log(`[DEBUG] Found ${employees.length} employees with lenient search`);

        // Fetch all profiles
        const profiles = await EmployeeProfile.find({ userId: { $in: employees.map(e => e._id) } })
            .lean();

        console.log(`[DEBUG] Found ${profiles.length} profiles`);

        // Merge Data
        const data = employees.map(emp => {
            const profile = profiles.find(p => p.userId.toString() === emp._id.toString());
            return {
                _id: emp._id,
                name: emp.name,
                email: emp.email,
                photo: emp.photo,
                status: emp.status,
                joinedAt: emp.createdAt,
                profile: profile ? {
                    exists: true,
                    completed: profile.profileCompleted,
                    designation: profile.designation,
                    phoneNumber: profile.phoneNumber,
                    department: profile.department
                } : {
                    exists: false,
                    completed: false
                }
            };
        });

        return NextResponse.json({ employees: data });
    } catch (error: any) {
        console.error('Admin Profiles Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
