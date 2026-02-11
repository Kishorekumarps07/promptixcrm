import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Debug: Direct checks instead of iteration
        const directChecks = {
            SMTP_USER_LENGTH: process.env.SMTP_USER?.length || 0,
            SMTP_PASS_LENGTH: process.env.SMTP_PASS?.length || 0,
            MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
            ADMIN_EMAIL: process.env.ADMIN_EMAIL,
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL
        };

        const result = await sendEmail({
            to: process.env.ADMIN_EMAIL || 'infopromptix@gmail.com',
            subject: 'Test Email from CRM 🚀',
            html: '<h1>It Works!</h1><p>Your email integration is fully configured and working.</p>'
        });

        // Debug: List all environment keys starting with SMTP or other critical ones
        const envKeys = Object.keys(process.env).filter(k =>
            k.startsWith('SMTP') ||
            k === 'ADMIN_EMAIL' ||
            k === 'MONGODB_URI' ||
            k === 'JWT_SECRET'
        );

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Email sent successfully!',
                result,
                envKeys,
                directChecks
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Email failed to send.',
                error: result.error,
                details: (result as any).details,
                envKeys,
                directChecks
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Internal server error during email test.',
            error: error.message,
            envKeys: Object.keys(process.env).filter(k => k.startsWith('SMTP') || k === 'ADMIN_EMAIL'),
            directChecks: {
                errorAt: 'GET_CATCH',
                SMTP_USER_EXISTS: !!process.env.SMTP_USER
            }
        }, { status: 500 });
    }
}
