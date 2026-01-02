import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

interface LogActionParams {
    action: string;
    entityType: string;
    entityId: string;
    performedBy: string;
    role: string;
    metadata?: any;
}

/**
 * Logs a critical system action to the database.
 * Designed to be non-blocking in a loose sense (we await it usually to ensure robust logging, 
 * but wrap in try-catch so it doesn't fail the main request).
 */
export async function logAction({ action, entityType, entityId, performedBy, role, metadata }: LogActionParams) {
    try {
        await dbConnect(); // Ensure connection
        await AuditLog.create({
            actionType: action,
            entityType,
            entityId,
            performedBy,
            performerRole: role,
            metadata
        });
        console.log(`[AUDIT] ${action} on ${entityType} by ${performedBy}`);
    } catch (error) {
        console.error("FAILED TO LOG AUDIT ACTION:", error);
        // We do NOT throw here, to prevent breaking the user flow.
    }
}
