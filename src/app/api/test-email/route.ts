import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await sendEmail({
            to: process.env.ADMIN_EMAIL || 'infopromptix@gmail.com',
            subject: 'Test Email from CRM 🚀',
            html: '<h1>It Works!</h1><p>Your email integration is fully configured and working.</p>'
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Email sent successfully!',
                result
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Email failed to send.',
                error: result.error,
                details: (result as any).details
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Internal server error during email test.',
            error: error.message
        }, { status: 500 });
    }
}
