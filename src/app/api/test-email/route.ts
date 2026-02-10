import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
    try {
        const result = await sendEmail({
            to: process.env.ADMIN_EMAIL || 'infopromptix@gmail.com',
            subject: 'Test Email from CRM 🚀',
            html: '<h1>It Works!</h1><p>Your email integration is fully configured and working.</p>'
        });

        if (result.success) {
            return NextResponse.json({ message: 'Email sent successfully!', result });
        } else {
            return NextResponse.json({ message: 'Email failed to send.', error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
