import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const query: any = {};

        if (role) query.role = role;
        if (status) query.status = status;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Use Aggregation to join CourseEnrollment and Course
        const users = await User.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'courseenrollments', // checks 'courseenrollments' collection
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$studentId', '$$userId'] },
                                status: 'Ongoing'
                            }
                        },
                        { $limit: 1 },
                        {
                            $lookup: {
                                from: 'courses',
                                localField: 'courseId',
                                foreignField: '_id',
                                as: 'course'
                            }
                        },
                        { $unwind: '$course' },
                        { $project: { title: '$course.title' } }
                    ],
                    as: 'activeCourseData'
                }
            },
            {
                $addFields: {
                    activeCourse: { $arrayElemAt: ['$activeCourseData.title', 0] }
                }
            },
            {
                $project: {
                    password: 0, // Exclude password
                    activeCourseData: 0, // Clean up temporary lookup
                    __v: 0
                }
            }
        ]);
        return NextResponse.json({ users });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { name, email, password, role, status, mentorId, phone, photo } = body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            mentorId,
            phone,
            photo,
        });

        console.info(`[AUDIT] User Created: ${user.email} (${user.role}) by Admin`);

        return NextResponse.json({ message: 'User created', user });
    } catch (err: any) {
        console.error(`[ERROR] Create User Failed: ${err.message}`);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
