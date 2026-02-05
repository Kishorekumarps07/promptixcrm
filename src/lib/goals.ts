import Goal from '@/models/Goal';
import Task from '@/models/Task';
import dbConnect from '@/lib/db';

/**
 * Recalculates the progress of a Goal based on its linked Tasks.
 * This is the centralized source of truth for Goal progress.
 */
export async function recalculateGoalProgress(goalId: string | null | undefined) {
    if (!goalId) return null;

    await dbConnect();

    try {
        // Fetch the goal and its tasks
        const goal = await Goal.findById(goalId).populate('tasks');

        if (!goal) {
            console.error(`Goal with ID ${goalId} not found for progress recalculation.`);
            return null;
        }

        // If no tasks exist, progress is 0
        if (!goal.tasks || goal.tasks.length === 0) {
            goal.progressPercentage = 0;
            // Update status based on progress if necessary
            if (goal.status === 'Completed') goal.status = 'In Progress';
        } else {
            // Calculate average progress from tasks
            const totalProgress = goal.tasks.reduce((acc: number, task: any) => {
                return acc + (task.progressPercentage || 0);
            }, 0);

            const averageProgress = Math.round(totalProgress / goal.tasks.length);
            goal.progressPercentage = averageProgress;

            // Optional: Auto-update status based on progress
            if (averageProgress === 100) {
                goal.status = 'Completed';
            } else if (averageProgress > 0 && goal.status === 'Not Started') {
                goal.status = 'In Progress';
            }
        }

        await goal.save();
        return goal.progressPercentage;
    } catch (error) {
        console.error(`Error recalculating progress for goal ${goalId}:`, error);
        throw error;
    }
}
