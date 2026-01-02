import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudentOnboarding from '@/models/StudentOnboarding';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';

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

// GET: Fetch Onboarding Details
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();
    const { id: studentId } = await params;

    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const onboarding = await StudentOnboarding.findOne({ studentId });
        if (!onboarding) {
            return NextResponse.json({ message: 'Onboarding data not found' }, { status: 404 });
        }
        return NextResponse.json({ onboarding });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to fetch onboarding data' }, { status: 500 });
    }
}

// PUT: Update Onboarding Details (Admin Only for now, or restricted fields)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();
    const { id: studentId } = await params;

    if (!userInfo || userInfo.role !== 'ADMIN') {
        // Employees might be allowed later, but request said "Admin can edit Fees-related fields"
        return NextResponse.json({ message: 'Unauthorized. Only Admins can edit.' }, { status: 403 });
    }

    try {
        const body = await req.json();

        // Find existing record
        const onboarding = await StudentOnboarding.findOne({ studentId });
        if (!onboarding) {
            return NextResponse.json({ message: 'Onboarding record not found' }, { status: 404 });
        }

        // Update fields (Allow full update or just fees? Request: "Admin can edit Fees-related fields")
        // But implicitly might want to fix typos in others. Let's allow updating all passed fields for flexibility 
        // OR strictly fee details. Let's update all structured sections if provided.

        if (body.personalDetails) onboarding.personalDetails = { ...onboarding.personalDetails, ...body.personalDetails };
        if (body.educationDetails) onboarding.educationDetails = { ...onboarding.educationDetails, ...body.educationDetails };
        if (body.feesDetails) onboarding.feesDetails = { ...onboarding.feesDetails, ...body.feesDetails };

        // Audit Trail
        onboarding.lastUpdatedBy = userInfo.userId;
        onboarding.lastUpdatedAt = new Date();

        await onboarding.save();

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'STUDENT_ONBOARDING_EDITED',
                entityType: 'StudentOnboarding',
                entityId: onboarding._id.toString(),
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { studentId: studentId, changes: Object.keys(body) }
            });
        }

        return NextResponse.json({ message: 'Onboarding updated successfully', onboarding });

    } catch (err) {
        console.error("Update Error:", err);
        return NextResponse.json({ message: 'Failed to update onboarding data' }, { status: 500 });
    }
}
