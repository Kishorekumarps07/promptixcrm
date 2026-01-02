import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
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

// POST: Generate Signature for Client-Side Upload
export async function POST(req: Request) {
    const userInfo = await getUserInfo();

    // Only Admin and Employees can upload
    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { folder } = await req.json();

        const timestamp = Math.round((new Date).getTime() / 1000);

        // Generate signature
        // We can enforce validation here (e.g. max file size in params if needed, but usually done in preset or global settings)
        // For signed uploads, we sign the parameters.
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder || 'crm-courses',
        }, process.env.CLOUDINARY_API_SECRET!);

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error: any) {
        console.error('Cloudinary Sign Error:', error);
        return NextResponse.json({ message: 'Failed to sign request' }, { status: 500 });
    }
}
