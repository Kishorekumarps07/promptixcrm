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

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
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
        const body = await req.json();

        // 1. Update User Model (Name, Email, Photo)
        const { name, email, photo, ...profileData } = body;
        if (name || email || photo) {
            const userUpdate: any = {};
            if (name) userUpdate.name = name;
            if (email) userUpdate.email = email;
            if (photo) userUpdate.photo = photo;
            await User.findByIdAndUpdate(userId, userUpdate);
        }

        // 2. Update EmployeeProfile Model
        // Extract fields to ensure security/validation mapping matches schema
        const updateData: any = {
            phoneNumber: profileData.phoneNumber,
            currentAddress: profileData.currentAddress,
            permanentAddress: profileData.permanentAddress,
            maritalStatus: profileData.maritalStatus,
            emergencyContact: {
                name: profileData.emergencyContactName,
                phone: profileData.emergencyContactPhone
            },
            designation: profileData.designation,
            dateOfJoining: profileData.dateOfJoining ? new Date(profileData.dateOfJoining) : undefined,
            employmentType: profileData.employmentType,
            department: profileData.department,
            dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
            gender: profileData.gender,
            updatedAt: new Date()
        };

        if (Array.isArray(profileData.education)) {
            updateData.education = profileData.education;
        }

        // Clean undefined values
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedProfile = await EmployeeProfile.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: updatedProfile
        });

    } catch (error: any) {
        console.error('Admin Profile Update Error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
