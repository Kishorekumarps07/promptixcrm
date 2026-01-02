import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PasswordChangeRequest from '@/models/PasswordChangeRequest';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import Notification from '@/models/Notification';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { requestId, action, newPassword } = await req.json(); // action: 'RESET' | 'REJECT'

        if (!requestId || !action) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const request = await PasswordChangeRequest.findById(requestId).populate('userId');
        if (!request) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        if (request.status !== 'Pending') {
            return NextResponse.json({ message: 'Request is already handled' }, { status: 400 });
        }

        if (action === 'RESET') {
            if (!newPassword || newPassword.length < 6) {
                return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
            }

            // 1. Update User Password and Force Change
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.findByIdAndUpdate(request.userId._id, {
                password: hashedPassword,
                forcePasswordChange: true
            });

            // 2. Update Request Status
            request.status = 'Completed';
            request.handledBy = userInfo.userId;
            request.handledAt = new Date();
            await request.save();

            // 3. Notification
            await Notification.create({
                recipientId: request.userId._id,
                recipientRole: request.userId.role,
                title: 'Password Reset Successful',
                message: `Your password request has been processed. Your new password has been set by the admin.`,
                type: 'success'
            });

            // 4. Audit Log
            await AuditLog.create({
                action: 'PASSWORD_RESET',
                performedBy: userInfo.userId,
                details: {
                    targetUser: request.userId.email,
                    requestId: request._id
                }
            });

            return NextResponse.json({ message: 'Password reset successfully' });

        } else if (action === 'REJECT') {

            // 1. Update Request Status
            request.status = 'Rejected';
            request.handledBy = userInfo.userId;
            request.handledAt = new Date();
            await request.save();

            // 2. Notification
            await Notification.create({
                recipientId: request.userId._id,
                recipientRole: request.userId.role,
                title: 'Password Change Rejected',
                message: `Your password change request was rejected by the admin. Contact support for details.`,
                type: 'error'
            });

            // 3. Audit Log
            await AuditLog.create({
                action: 'PASSWORD_REQUEST_REJECT',
                performedBy: userInfo.userId,
                details: {
                    targetUser: request.userId.email,
                    requestId: request._id
                }
            });

            return NextResponse.json({ message: 'Request rejected' });
        } else {
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
