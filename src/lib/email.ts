import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
}

export const sendEmail = async ({ to, subject, html, attachments }: EmailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"CRM System" <${process.env.SMTP_USER}>`, // sender address
            to,
            subject,
            html,
            attachments
        });
        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email: ", error);
        return { success: false, error };
    }
};
