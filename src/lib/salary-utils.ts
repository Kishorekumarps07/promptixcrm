import Holiday from '@/models/Holiday';
import WorkSettings from '@/models/WorkSettings';
import dbConnect from './db';

export async function getWorkingDaysInMonth(month: number, year: number): Promise<number> {
    await dbConnect();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last date of month

    // 1. Get Settings (or defaults)
    const settings = await WorkSettings.findOne().lean();
    const weeklyOffs = settings?.weeklyOffs || [0]; // Default Sunday (0)

    // 2. Get Holidays for this month
    const holidays = await Holiday.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).lean();

    // Map holidays to avoid double counting (e.g. holiday on a Sunday)
    const holidayDates = new Set(holidays.map(h => new Date(h.date).toDateString()));

    let workingDays = 0;
    const currentDate = new Date(startDate);

    // Reset time for accurate date comparison
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dateString = currentDate.toDateString();

        // Check if it's a Weekly Off
        const isWeeklyOff = weeklyOffs.includes(dayOfWeek);

        // Check if it's a Holiday
        const isHoliday = holidayDates.has(dateString);

        // If it's NEITHER an Off nor a Holiday, it's a working day
        if (!isWeeklyOff && !isHoliday) {
            workingDays++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
}
