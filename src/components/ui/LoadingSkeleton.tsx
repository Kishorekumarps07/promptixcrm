export default function LoadingSkeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
            <div className="flex items-center gap-3">
                <LoadingSkeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <LoadingSkeleton className="h-4 w-1/3" />
                    <LoadingSkeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="space-y-2">
                <LoadingSkeleton className="h-3 w-full" />
                <LoadingSkeleton className="h-3 w-5/6" />
            </div>
            <div className="flex gap-2 pt-2">
                <LoadingSkeleton className="h-8 flex-1 rounded" />
                <LoadingSkeleton className="h-8 flex-1 rounded" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap">
                    <LoadingSkeleton className="h-4 w-24" />
                </td>
            ))}
        </tr>
    );
}
