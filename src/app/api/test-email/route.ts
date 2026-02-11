import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await sendEmail({
            to: process.env.ADMIN_EMAIL || 'infopromptix@gmail.com',
            subject: 'Test Email from CRM 🚀',
            html: '<h1>It Works!</h1><p>Your email integration is fully configured and working.</p>'
        });

        // Debug: List all environment keys starting with SMTP
        const envKeys = Object.keys(process.env).filter(k => k.startsWith('SMTP') || k === 'ADMIN_EMAIL');

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Email sent successfully!',
                result,
                envKeys
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Email failed to send.',
                error: result.error,
                details: (result as any).details,
                envKeys
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Internal server error during email test.',
            error: error.message,
            envKeys: Object.keys(process.env).filter(k => k.startsWith('SMTP') || k === 'ADMIN_EMAIL')
        }, { status: 500 });
    }
}
