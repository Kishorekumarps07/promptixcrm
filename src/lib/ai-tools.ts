import dbConnect from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import Task from '@/models/Task';
import Goal from '@/models/Goal';
import Holiday from '@/models/Holiday';
import WorkSettings from '@/models/WorkSettings';
import mongoose from 'mongoose';

/**
 * Fetches the leave balance and status for a specific user.
 */
export async function getLeaveStatus(userId: string) {
    await dbConnect();
    const leaves = await LeaveRequest.find({ userId }).sort({ fromDate: -1 }).limit(5);

    // Simplified summary for AI
    return leaves.map(l => ({
        type: l.leaveType,
        from: new Date(l.fromDate).toLocaleDateString(),
        to: new Date(l.toDate).toLocaleDateString(),
        status: l.status,
        reason: l.reason
    }));
}

/**
 * Fetches pending and active tasks for a specific user.
 */
export async function getMyTasks(userId: string) {
    await dbConnect();
    const tasks = await Task.find({
        assignedTo: new mongoose.Types.ObjectId(userId),
        status: { $ne: 'Completed' }
    }).sort({ dueDate: 1 });

    return tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No deadline'
    }));
}

/**
 * Fetches company holidays.
 */
export async function getUpcomingHolidays() {
    await dbConnect();
    const today = new Date();
    const holidays = await Holiday.find({
        date: { $gte: today }
    }).sort({ date: 1 }).limit(10);

    return holidays.map(h => ({
        name: h.name,
        date: new Date(h.date).toLocaleDateString(),
        type: h.type
    }));
}

/**
 * Fetches company policies and work settings.
 */
export async function getCompanyPolicies() {
    await dbConnect();
    const settings = await WorkSettings.findOne();
    if (!settings) return "No specific policies found.";

    return {
        shiftStart: settings.shiftStartTime,
        gracePeriod: `${settings.gracePeriodMinutes} minutes`,
        weeklyOffs: settings.weeklyOffs.map((day: number) =>
            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
        ).join(', ')
    };
}
