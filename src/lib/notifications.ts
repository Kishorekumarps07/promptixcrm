import Notification from '@/models/Notification';
import dbConnect from '@/lib/db';

type NotificationType = 'TASK_ASSIGNED' | 'GOAL_ASSIGNED' | 'GENERAL';

/**
 * Creates a new in-app notification for a user.
 * @param recipientId The ObjectID of the user to notify
 * @param title Short title of the notification
 * @param message Detailed body text
 * @param type Type of notification for categorization
 * @param link Optional relative URL to redirect to when clicked
 */
export async function sendNotification(
    recipientId: string,
    title: string,
    message: string,
    type: NotificationType = 'GENERAL',
    link?: string
) {
    try {
        await dbConnect();

        await Notification.create({
            recipientId,
            title,
            message,
            type,
            link
        });

        console.log(`Notification sent to ${recipientId}: ${title}`);
    } catch (error) {
        console.error('Failed to send notification:', error);
        // We generally don't want to throw here to avoid blocking the main action (like task creation)
        // just because the notification failed.
    }
}
