import Attendance from '@/models/Attendance';
import LeaveRequest from '@/models/LeaveRequest';
import Holiday from '@/models/Holiday';
import WorkSettings from '@/models/WorkSettings';
import { getWorkingDaysInMonth } from './salary-utils';
import mongoose from 'mongoose';

export interface SalaryBreakdown {
    workingDays: number;
    fullDayCount: number;
    halfDayCount: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    payableDays: number;
    perDayRate: number;
    calculatedSalary: number;
}

/**
 * Calculate detailed salary breakdown for an employee for a specific month
 * This is the core calculation logic used by:
 * - Batch salary generation
 * - Individual salary generation
 * - Salary preview (without saving)
 */
export async function calculateEmployeeSalary(
    employeeId: string,
    monthlySalary: number,
    month: number,
    year: number
): Promise<SalaryBreakdown> {
    console.log('✅✅✅ SALARY CALCULATION FUNCTION STARTED ✅✅✅', { employeeId, month, year });

    // CRITICAL FIX: Convert employeeId string to ObjectId for MongoDB queries
    // Attendance model uses 'userId' field which is ObjectId type
    const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

    // 1. Get working days from calendar settings
    const workingDays = await getWorkingDaysInMonth(month, year);
    const perDayRate = Number((monthlySalary / workingDays).toFixed(2));

    // Date range for this month
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // 2. Count FULL DAY Attendance (Approved, not half-day)
    // FIX: Handle records where isHalfDay is undefined/null (defaults to false logically)
    const fullDayCount = await Attendance.countDocuments({
        userId: employeeObjectId,
        status: 'Approved',
        type: { $in: ['Present', 'WFH'] },
        $or: [
            { isHalfDay: false },
            { isHalfDay: { $exists: false } }, // Handle legacy records
            { isHalfDay: null }
        ],
        date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    });

    // 3. Count HALF DAY Attendance (support both legacy flag and new type)
    const halfDayCount = await Attendance.countDocuments({
        userId: employeeObjectId,  // Let Mongoose auto-convert
        status: 'Approved',
        $or: [
            { type: 'Half Day' },  // New explicit type
            { isHalfDay: true }     // Legacy flag for backward compatibility
        ],
        date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    });

    // 4. Fetch PAID Leaves (using isPaid field)
    const paidLeaves = await LeaveRequest.find({
        userId: employeeObjectId,  // Let Mongoose auto-convert
        status: 'Approved',
        isPaid: true,
        $or: [
            { fromDate: { $lte: endOfMonth }, toDate: { $gte: startOfMonth } }
        ]
    });

    // 5. Count Business Days in Paid Leaves (exclude weekends & holidays)
    let paidLeaveDays = 0;

    const settings = await WorkSettings.findOne().lean();
    const weeklyOffs = settings?.weeklyOffs || [0];

    const holidays = await Holiday.find({
        date: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();
    const holidayDates = new Set(holidays.map(h => new Date(h.date).toDateString()));

    for (const leave of paidLeaves) {
        const start = leave.fromDate < startOfMonth ? startOfMonth : leave.fromDate;
        const end = leave.toDate > endOfMonth ? endOfMonth : leave.toDate;

        let d = new Date(start);
        d.setHours(0, 0, 0, 0);
        const e = new Date(end);
        e.setHours(0, 0, 0, 0);

        while (d <= e) {
            const dayOfWeek = d.getDay();
            const dateString = d.toDateString();

            // Only count if it's a working day
            if (!weeklyOffs.includes(dayOfWeek) && !holidayDates.has(dateString)) {
                paidLeaveDays++;
            }
            d.setDate(d.getDate() + 1);
        }
    }

    // 6. Calculate Payable Days using formula: Full + (Half × 0.5) + Paid Leave
    const payableDays = fullDayCount + (halfDayCount * 0.5) + paidLeaveDays;
    const calculatedSalary = Number((perDayRate * payableDays).toFixed(2));

    // 7. Calculate Unpaid Absences
    const coveredDays = fullDayCount + halfDayCount + paidLeaveDays;
    const unpaidLeaveDays = Math.max(0, workingDays - coveredDays);

    return {
        workingDays,
        fullDayCount,
        halfDayCount,
        paidLeaveDays,
        unpaidLeaveDays,
        payableDays,
        perDayRate,
        calculatedSalary
    };
}
