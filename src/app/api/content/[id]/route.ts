import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseContent from '@/models/CourseContent';
import cloudinary from '@/lib/cloudinary';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';

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

// PUT: Update Content (e.g. Move to different lesson)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const { lessonId } = await req.json(); // Expect lessonId (can be null)

        const content = await CourseContent.findByIdAndUpdate(
            id,
            { lessonId: lessonId || null }, // If null/undefined, effectively unassigns
            { new: true }
        );

        if (!content) return NextResponse.json({ message: 'Content not found' }, { status: 404 });

        return NextResponse.json({ message: 'Content updated successfully', content });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// DELETE: Remove Content
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Only Admin/Employee can delete
    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const content = await CourseContent.findById(id);
        if (!content) return NextResponse.json({ message: 'Content not found' }, { status: 404 });

        // Attempt to delete from Cloudinary
        // Extract public_id from URL: .../upload/v12345/folder/filename.ext -> folder/filename
        try {
            const urlParts = content.fileUrl.split('/');
            const versionIndex = urlParts.findIndex((part: string) => part.startsWith('v') && !isNaN(Number(part.substring(1))));
            if (versionIndex !== -1) {
                const publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');
                const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

                // Determine resource type (video or image/raw)
                const resourceType = content.fileType === 'video' ? 'video' : 'image';
                // Note: PDFs/Docs often treated as 'image' or 'raw' in Cloudinary depending on upload. 
                // Defaulting to 'image' usually covers PDFs if auto-converted, or try 'raw'. 
                // For simplicity, we try deleting.

                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            }
        } catch (e) {
            console.error("Cloudinary delete failed (ignoring):", e);
        }

        await CourseContent.findByIdAndDelete(id);

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'COURSE_CONTENT_DELETED',
                entityType: 'CourseContent',
                entityId: id,
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { title: content.title, courseId: content.courseId }
            });
        }

        return NextResponse.json({ message: 'Content deleted successfully' });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
