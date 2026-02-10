import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/models/Announcement';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sendEmail } from '@/lib/email';
import { EmailTemplates } from '@/lib/email-templates';

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

export async function GET() {
    await dbConnect();
    const userInfo = await getUserInfo();
    if (!userInfo) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        // Determine visibility based on role
        // Admins see all. Employees see All + Employees.
        let filter = {};
        if (userInfo.role === 'ADMIN') {
            filter = {}; // See all
        } else if (userInfo.role === 'EMPLOYEE') {
            filter = { target: { $in: ['All', 'Employees'] } };
        }

        const announcements = await Announcement.find(filter).sort({ date: -1 });
        return NextResponse.json({ announcements });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, content, target } = body;

        // 1. Create Announcement
        const announcement = await Announcement.create({
            title,
            content,
            target: target || 'All',
            createdBy: userInfo.userId
        });

        // 2. Fetch Recipients (Employees + Managers)
        const allUsers = await User.find({}).select('role status email');
        console.log(`[DEBUG] Total users in DB: ${allUsers.length}`);
        console.log(`[DEBUG] Roles found:`, allUsers.map(u => u.role));

        const recipients = await User.find({
            role: { $in: ['EMPLOYEE', 'MANAGER', 'Employee', 'Manager', 'employee', 'manager'] },
            status: 'Active'
        }).select('email name');

        console.log(`[ANNOUNCEMENT] Found ${recipients.length} recipients to notify.`);

        // 3. Send Emails (Awaited with Promise.all)
        const emailPromises = recipients.map(async (emp) => {
            if (emp.email) {
                try {
                    console.log(`[ANNOUNCEMENT] Sending email to ${emp.email}`);
                    await sendEmail({
                        to: emp.email,
                        subject: `📢 New Announcement: ${title}`,
                        html: EmailTemplates.announcementEmail(title, content, 'Admin')
                    });
                } catch (err) {
                    console.error(`[ANNOUNCEMENT ERROR] Failed for ${emp.email}`, err);
                }
            }
        });

        // We use Promise.all to ensure the connection doesn't drop before emails are sent
        await Promise.all(emailPromises);
        console.log(`[ANNOUNCEMENT] Email broadcasting complete.`);

        return NextResponse.json({ announcement });
    } catch (err: any) {
        console.error('[ANNOUNCEMENT POST ERROR]:', err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
