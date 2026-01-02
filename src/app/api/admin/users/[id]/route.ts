import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

// UPDATE User Details
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await req.json();
        const { name, email, role, password, phone, photo } = body;
        console.log(`[DEBUG] PUT User ${id}. Body:`, body); // Debug log

        const updateData: any = { name, email, role, phone, photo };
        if (password && password.trim() !== '') {
            updateData.password = await hashPassword(password);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// DELETE User
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const { id } = await params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
