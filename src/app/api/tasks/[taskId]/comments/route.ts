import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { verifyJwt } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(
    req: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        await connectToDatabase();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token || !await verifyJwt(token)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const comments = await Comment.find({ taskId: params.taskId })
            .populate('userId', 'name email')
            .sort({ createdAt: 1 }); // Oldest first

        return NextResponse.json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        await connectToDatabase();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        const payload = token ? await verifyJwt(token) : null;
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const comment = await Comment.create({
            taskId: params.taskId,
            userId: payload.id,
            content
        });

        const populatedComment = await Comment.findById(comment._id).populate('userId', 'name email');

        return NextResponse.json({ comment: populatedComment });

    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
