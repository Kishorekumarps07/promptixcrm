import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudentOnboarding from '@/models/StudentOnboarding';
import Course from '@/models/Course';
import CourseEnrollment from '@/models/CourseEnrollment';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { signToken } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { serialize } from 'cookie';
import { notifyAdmins } from '@/lib/notification';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return { userId: payload.userId, role: payload.role };
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'STUDENT') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();

        // 1. Get User to check if already onboarded
        const user = await User.findById(userInfo.userId);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
        if (user.isOnboardingCompleted) {
            return NextResponse.json({ message: 'Onboarding already completed' }, { status: 400 });
        }

        // 2. Validate Body
        if (!body.personalDetails?.phone || !body.feesDetails?.totalFees || !body.courseId) {
            return NextResponse.json({ message: 'Missing required fields (including Course Selection)' }, { status: 400 });
        }

        // Verify Course exists and is Active
        const course = await Course.findById(body.courseId);
        if (!course || course.status !== 'Active') {
            return NextResponse.json({ message: 'Invalid or inactive course selected' }, { status: 400 });
        }

        // 3. Save Onboarding Data
        const onboarding = await StudentOnboarding.create({
            studentId: userInfo.userId,
            personalDetails: body.personalDetails,
            educationDetails: body.educationDetails,
            feesDetails: body.feesDetails,
            submittedAt: new Date()
        });

        // 3.5 Create Course Enrollment (Enforces Single Active Course via DB index)
        // We catch strict duplicates in the catch block if needed, but since this is first time onboarding, likely fine.
        const enrollment = await CourseEnrollment.create({
            studentId: userInfo.userId,
            courseId: body.courseId,
            status: 'Ongoing',
            enrolledAt: new Date()
        });

        // 4. Update User Profile
        user.isOnboardingCompleted = true;
        user.onboardingCompletedAt = new Date();

        // Update specific user fields from onboarding if needed? 
        // For now, keeping them separate as requested, but maybe sync phone?
        if (body.personalDetails.phone) user.phone = body.personalDetails.phone;

        await user.save();

        // 5. Refresh Token to update isOnboardingCompleted flag
        const token = signToken({
            userId: user._id,
            role: user.role,
            isOnboardingCompleted: true
        });

        const cookie = serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
            sameSite: 'strict',
        });

        const response = NextResponse.json({
            message: 'Onboarding completed successfully',
            success: true
        });

        response.headers.set('Set-Cookie', cookie);

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'STUDENT_ONBOARDING_COMPLETED',
                entityType: 'StudentOnboarding',
                entityId: onboarding._id.toString(),
                performedBy: userInfo.userId as string,
                role: 'STUDENT',
                metadata: { phone: body.personalDetails?.phone }
            });

            // Notify Admins
            console.log(`[AUDIT] Notifying Admins of Onboarding: ${onboarding._id}`);
            await notifyAdmins({
                title: 'Onboarding Submitted',
                message: 'A new student has completed onboarding.',
                type: 'ONBOARDING_SUBMITTED',
                entityType: 'StudentOnboarding',
                entityId: onboarding._id.toString()
            });
        }

        return response;

    } catch (err: any) {
        console.error('Onboarding Error:', err);
        if (err.code === 11000) {
            return NextResponse.json({ message: 'Onboarding data already exists' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Failed to submit onboarding' }, { status: 500 });
    }
}
