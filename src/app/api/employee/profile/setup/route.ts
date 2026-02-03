import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmployeeProfile from '@/models/EmployeeProfile';
import { verifyToken } from '@/lib/auth'; // Or however you verify tokens
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        await dbConnect();

        // 1. Verify Authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload: any = verifyToken(token);
        if (!payload || payload.role !== 'EMPLOYEE') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const userId = payload.userId;

        // 2. Check if profile already completed
        const existingProfile = await EmployeeProfile.findOne({ userId, profileCompleted: true });
        if (existingProfile) {
            return NextResponse.json({ message: 'Profile already completed' }, { status: 400 });
        }

        // 3. Parse and Validate Body
        const body = await req.json();
        const {
            phoneNumber,
            designation,
            dateOfJoining,
            employmentType,
            userId: bodyUserId, // We ignore this and use token userId for security
            // New Fields
            dateOfBirth,
            gender,
            maritalStatus,
            currentAddress,
            permanentAddress,
            education
        } = body;

        // Simple Validation
        if (!phoneNumber || !designation || !dateOfJoining || !employmentType) {
            return NextResponse.json({ message: 'Missing mandatory fields' }, { status: 400 });
        }

        // 4. Create or Update Profile
        // We use findOneAndUpdate with upsert to handle cases where a profile might exist but be incomplete
        const profile = await EmployeeProfile.findOneAndUpdate(
            { userId },
            {
                userId,
                phoneNumber,
                designation,
                dateOfJoining: new Date(dateOfJoining),
                employmentType,
                emergencyContact: body.emergencyContact || {},
                department: body.department || '',

                // New Fields
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                gender,
                maritalStatus,
                currentAddress,
                permanentAddress,
                education: Array.isArray(education) ? education : [],

                profileCompleted: true, // Mark as completed
                updatedAt: new Date()
            },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );

        return NextResponse.json({
            message: 'Profile setup successful',
            profile
        });

    } catch (error: any) {
        console.error('Profile Setup Error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
