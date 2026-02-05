import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmployeeProfile from '@/models/EmployeeProfile';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
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

        const body = await req.json();
        console.log('[DEBUG] Update Profile Body:', body);

        const {
            // User Details
            name,
            email,
            photo,

            phoneNumber,
            emergencyContactName,
            emergencyContactPhone,
            currentAddress,
            permanentAddress,
            maritalStatus,
            education,
            // Official Details
            designation,
            dateOfJoining,
            employmentType,
            department,
            dateOfBirth,
            gender
        } = body;

        // Update User Model (Name, Email, Photo)
        if (name || email || photo) {
            console.log('[DEBUG] Updating User:', { name, email, photo });
            const userUpdate: any = {};
            if (name) userUpdate.name = name;
            if (email) userUpdate.email = email;
            if (photo) userUpdate.photo = photo;

            await User.findByIdAndUpdate(payload.userId, userUpdate);
        }

        // Only validate phoneNumber if updating profile data (not just photo)
        if (!photo && !phoneNumber) {
            return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
        }

        // If only updating photo, skip EmployeeProfile update
        if (photo && !phoneNumber && !name && !email) {
            return NextResponse.json({
                message: 'Photo updated successfully',
                user: await User.findById(payload.userId).select('-password')
            });
        }



        const updateData: any = {
            phoneNumber,
            currentAddress: currentAddress || '',
            permanentAddress: permanentAddress || '',
            maritalStatus: maritalStatus || undefined,
            emergencyContact: {
                name: emergencyContactName || '',
                phone: emergencyContactPhone || ''
            },
            designation,
            dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
            employmentType,
            department,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender: gender || undefined,
            updatedAt: new Date()
        };

        if (Array.isArray(education)) {
            console.log('[DEBUG] Setting Education Array:', JSON.stringify(education));
            updateData.education = education;
        }

        const updatedProfile = await EmployeeProfile.findOneAndUpdate(
            { userId: payload.userId },
            { $set: updateData },
            { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
        );

        console.log('[DEBUG] Updated Profile:', updatedProfile ? 'Success' : 'Failed');

        if (!updatedProfile) {
            return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: updatedProfile
        });

    } catch (error: any) {
        console.error('Profile Update Error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
            return NextResponse.json({ message: `Validation Failed: ${messages}` }, { status: 400 });
        }

        if (error.code === 11000) {
            return NextResponse.json({ message: 'Duplicate field value entered' }, { status: 400 });
        }

        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
