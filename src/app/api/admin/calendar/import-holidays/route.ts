import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Holiday from '@/models/Holiday';
import { INDIAN_HOLIDAYS_2026 } from '@/lib/holiday-data';
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

// POST - Import government holidays
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Only admins can import holidays
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { year, regions } = body;

        // Default to 2026 and all regions
        const targetYear = year || 2026;
        const targetRegions = regions || ['All India', 'Tamil Nadu'];

        // Filter holidays based on year and regions
        let holidaysToImport = INDIAN_HOLIDAYS_2026;

        // Filter by regions if specified
        if (targetRegions && targetRegions.length > 0) {
            holidaysToImport = holidaysToImport.filter(h =>
                targetRegions.includes(h.region) || h.region === 'All India'
            );
        }

        // Check for existing holidays to prevent duplicates
        const existingHolidays = await Holiday.find({
            date: {
                $in: holidaysToImport.map(h => new Date(h.date))
            }
        });

        const existingDates = new Set(
            existingHolidays.map(h => h.date.toISOString().split('T')[0])
        );

        // Filter out duplicates
        const newHolidays = holidaysToImport.filter(
            h => !existingDates.has(h.date)
        );

        // Insert new holidays
        let insertedCount = 0;
        if (newHolidays.length > 0) {
            const result = await Holiday.insertMany(
                newHolidays.map(h => ({
                    ...h,
                    date: new Date(h.date)
                }))
            );
            insertedCount = result.length;
        }

        return NextResponse.json({
            message: 'Holidays imported successfully',
            imported: insertedCount,
            skipped: holidaysToImport.length - insertedCount,
            total: holidaysToImport.length
        });

    } catch (error: any) {
        console.error('❌ Error importing holidays:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Check if it's a MongoDB duplicate key error
        if (error.code === 11000) {
            return NextResponse.json({
                message: 'Some holidays already exist. Try deleting duplicates first.',
                error: 'Duplicate key error'
            }, { status: 409 });
        }

        return NextResponse.json({
            message: error.message || 'Unknown error occurred',
            errorName: error.name,
            errorCode: error.code
        }, { status: 500 });
    }
}

// GET - Preview holidays to be imported
export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Only admins can preview
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const regions = searchParams.get('regions')?.split(',') || ['All India', 'Tamil Nadu'];

        // Filter holidays by regions
        let holidays = INDIAN_HOLIDAYS_2026;
        if (regions.length > 0) {
            holidays = holidays.filter(h =>
                regions.includes(h.region) || h.region === 'All India'
            );
        }

        // Check which ones already exist
        const existingHolidays = await Holiday.find({
            date: {
                $in: holidays.map(h => new Date(h.date))
            }
        });

        const existingDates = new Set(
            existingHolidays.map(h => h.date.toISOString().split('T')[0])
        );

        // Mark which ones are new vs existing
        const preview = holidays.map(h => ({
            ...h,
            exists: existingDates.has(h.date)
        }));

        const newCount = preview.filter(h => !h.exists).length;
        const existingCount = preview.filter(h => h.exists).length;

        return NextResponse.json({
            holidays: preview,
            summary: {
                total: preview.length,
                new: newCount,
                existing: existingCount
            }
        });

    } catch (error: any) {
        console.error('Error previewing holidays:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
