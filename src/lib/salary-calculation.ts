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
    dailyBreakdown: Array<{
        date: Date;
        status: string;
        type: string;
        remarks: string;
    }>;
}

export async function calculateEmployeeSalary(
    employeeId: string,
    monthlySalary: number,
    month: number,
    year: number
): Promise<SalaryBreakdown> {
    console.log('✅✅✅ STRICT SALARY CALCULATION STARTED ✅✅✅', { employeeId, month, year });

    const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

    // 1. Get Settings & Calendar Basics
    const workingDaysCount = await getWorkingDaysInMonth(month, year);
    const perDayRate = Number((monthlySalary / workingDaysCount).toFixed(2));

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    // 2. Fetch all raw data for the month
    const attendanceRecords = await Attendance.find({
        userId: employeeObjectId,
        date: { $gte: startDate, $lte: endDate }
    }).lean();

    const leaveRecords = await LeaveRequest.find({
        userId: employeeObjectId,
        status: 'Approved',
        $or: [
            { fromDate: { $lte: endDate }, toDate: { $gte: startDate } }
        ]
    }).lean();

    const settings = await WorkSettings.findOne().lean();
    const weeklyOffs = settings?.weeklyOffs || [0];

    const holidays = await Holiday.find({
        date: { $gte: startDate, $lte: endDate }
    }).lean();
    const holidayDates = new Set(holidays.map(h => new Date(h.date).toDateString()));

    // 3. Process Daily Breakdown
    const dailyBreakdown = [];
    let fullDayCount = 0;
    let halfDayCount = 0;
    let paidLeaveDays = 0;
    let workingDays = 0;

    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        const dateStr = current.toDateString();
        const dayOfWeek = current.getDay();
        const isWeeklyOff = weeklyOffs.includes(dayOfWeek);
        const isHoliday = holidayDates.has(dateStr);
        const isWorkDay = !isWeeklyOff && !isHoliday;

        if (isWorkDay) workingDays++;

        // Find attendance for this day
        const att = attendanceRecords.find(a => new Date(a.date).toDateString() === dateStr);
        
        // Find if on leave for this day
        const leave = leaveRecords.find(l => {
            const lStart = new Date(l.fromDate);
            const lEnd = new Date(l.toDate);
            lStart.setHours(0,0,0,0);
            lEnd.setHours(23,59,59,999);
            return current >= lStart && current <= lEnd;
        });

        let status = 'Absent';
        let type = 'Unpaid';
        let remarks = att?.remarks || '';

        // PRIORITY LOGIC
        if (att && att.status === 'Approved') {
            if (att.type === 'Half Day' || att.isHalfDay) {
                status = 'Present';
                type = 'Half Day';
                halfDayCount++;
            } else {
                status = 'Present';
                type = 'Full Day';
                fullDayCount++;
            }
        } else if (leave) {
            status = 'Leave';
            type = leave.isPaid ? 'Paid' : 'Unpaid';
            if (leave.isPaid && isWorkDay) {
                paidLeaveDays++;
            }
        } else if (isHoliday) {
            status = 'Holiday';
            type = 'Off';
        } else if (isWeeklyOff) {
            status = 'Weekly Off';
            type = 'Off';
        }

        dailyBreakdown.push({
            date: new Date(current),
            status,
            type,
            remarks
        });

        current.setDate(current.getDate() + 1);
    }

    // 4. Final Totals
    const payableDays = fullDayCount + (halfDayCount * 0.5) + paidLeaveDays;
    const calculatedSalary = Number((perDayRate * payableDays).toFixed(2));
    const unpaidLeaveDays = Math.max(0, workingDaysCount - (fullDayCount + halfDayCount + paidLeaveDays));

    return {
        workingDays: workingDaysCount,
        fullDayCount,
        halfDayCount,
        paidLeaveDays,
        unpaidLeaveDays,
        payableDays,
        perDayRate,
        calculatedSalary,
        dailyBreakdown
    };
}
