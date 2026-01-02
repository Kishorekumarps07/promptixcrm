import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    // Force wait for connection?
    try {
        const users = await User.find({}, 'name email photo');
        return NextResponse.json({
            schema: User.schema.paths['photo'] ? 'exists' : 'missing',
            users
        });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
