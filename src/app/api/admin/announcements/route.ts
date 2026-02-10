import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/models/Announcement';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';
import { EmailTemplates } from '@/lib/email-templates';

export async function POST(req: Request) {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    try {
        const { title, content, type, priority } = await req.json();

        // 1. Create Announcement in DB
        const announcement = await Announcement.create({
            title,
            content,
            target: type || 'All', // Map 'type' from UI to 'target' in Model
            createdBy: payload.userId
        });

        // 2. Fetch All Relevant Users (Employees + Managers)
        // We include both roles as they both count as "staff"
        const employees = await User.find({
            role: { $in: ['EMPLOYEE', 'MANAGER', 'Employee', 'Manager', 'employee', 'manager'] },
            status: 'Active'
        }).select('email name');

        console.log(`[ANNOUNCEMENT] Found ${employees.length} recipients (Employees/Managers) to notify.`);

        // 3. Send Emails (Fire and forget to avoid blocking response)
        // Note: For large numbers, a queue (BullMQ/Redis) is better.
        // For MVP (<500 users), Promise.all is acceptable but risky if SMTP limits hit.
        // We will do it in chunks or just simple loop for now.

        // 3. Send Emails (Using Promise.all to ensure completion)
        const emailPromises = employees.map(async (emp) => {
            if (emp.email) {
                try {
                    console.log(`[ANNOUNCEMENT] Sending email to ${emp.email}`);
                    await sendEmail({
                        to: emp.email,
                        subject: `📢 New Announcement: ${title}`,
                        html: EmailTemplates.announcementEmail(title, content, 'Admin')
                    });
                    return { email: emp.email, status: 'sent' };
                } catch (err) {
                    console.error(`[ANNOUNCEMENT ERROR] Failed to send to ${emp.email}`, err);
                    return { email: emp.email, status: 'failed', error: err };
                }
            }
            return null;
        });

        await Promise.all(emailPromises);
        console.log(`[ANNOUNCEMENT] All emails processed.`);

        return NextResponse.json({ message: 'Announcement created and emails sending...', announcement });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
