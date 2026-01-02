import { NextResponse } from 'next/server';
import { StudentExportService } from '@/lib/student-export-service';
import dbConnect from '@/lib/db';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const format = (searchParams.get('format') as 'csv' | 'xlsx') || 'csv';
        const status = searchParams.get('status') || undefined;
        const courseId = searchParams.get('course') || undefined; // 'course' param from UI filter

        // Generate buffer
        const buffer = await StudentExportService.generateExport(format, {
            status,
            courseId
        });

        // Set headers
        const filename = `students_export_${new Date().toISOString().split('T')[0]}.${format}`;
        const contentType = format === 'csv'
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (err: any) {
        console.error('[EXPORT_ERROR]', err);
        return NextResponse.json({ message: err.message || 'Export failed' }, { status: 500 });
    }
}
