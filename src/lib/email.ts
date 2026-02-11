import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
}

export const sendEmail = async ({ to, subject, html, attachments }: EmailOptions) => {
    // Read environment variables directly inside the function to ensure 
    // runtime evaluation on Vercel, avoiding build-time captures.
    const SMTP_HOST = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const SMTP_PORT = parseInt((process.env.SMTP_PORT || '587').trim());
    const SMTP_USER = (process.env.SMTP_USER || '').trim();
    const SMTP_PASS = (process.env.SMTP_PASS || '').trim();

    try {
        if (!SMTP_USER || !SMTP_PASS) {
            console.error("[EMAIL ERROR] Configuration missing in runtime environment:", {
                userLength: SMTP_USER.length,
                passLength: SMTP_PASS.length
            });
            throw new Error("Email configuration missing: SMTP_USER or SMTP_PASS is empty.");
        }

        const transporter = nodemailer.createTransport({
            // Use service: 'gmail' shortcut if using gmail for better reliability
            ...(SMTP_USER.includes('gmail.com') ? { service: 'gmail' } : {
                host: SMTP_HOST,
                port: SMTP_PORT,
                secure: SMTP_PORT === 465,
            }),
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"CRM System" <${SMTP_USER}>`, // sender address
            to,
            subject,
            html,
            attachments
        });

        console.log("[EMAIL SUCCESS] Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("[EMAIL ERROR] Detailed failure: ", {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            smtp_user: SMTP_USER ? "provided" : "MISSING"
        });
        return {
            success: false,
            error: error.message || "Unknown email error",
            details: error.code || "No error code"
        };
    }
};
