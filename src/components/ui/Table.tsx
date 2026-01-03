import { ReactNode } from 'react';
import { TableRowSkeleton, CardSkeleton } from './LoadingSkeleton';

interface Column<T> {
    header: string;
    accessor?: keyof T | ((item: T) => ReactNode); // Key or render function
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField?: string; // unique key property name, default '_id'
    loading?: boolean;
}

export default function Table<T extends Record<string, any>>({ columns, data, keyField = '_id', mobileCard: RenderMobileCard, loading = false }: TableProps<T> & { mobileCard?: (item: T) => ReactNode }) {
    if (loading) {
        return (
            <>
                {/* Desktop Skeleton */}
                <div className={`${RenderMobileCard ? 'hidden md:block' : ''} bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {columns.map((col, idx) => (
                                        <th key={idx} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRowSkeleton key={i} cols={columns.length} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Skeleton */}
                {RenderMobileCard && (
                    <div className="md:hidden space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className={`${RenderMobileCard ? 'hidden md:block' : ''} bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {columns.map((col, idx) => (
                                    <th key={idx} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.length > 0 ? (
                                data.map((item, rowIdx) => (
                                    <tr key={item[keyField] || rowIdx} className="hover:bg-gray-50/50 transition-colors">
                                        {columns.map((col, colIdx) => {
                                            let cellContent: ReactNode;
                                            if (typeof col.accessor === 'function') {
                                                cellContent = col.accessor(item);
                                            } else if (typeof col.accessor === 'string') {
                                                cellContent = item[col.accessor];
                                            } else {
                                                cellContent = null;
                                            }

                                            return (
                                                <td key={colIdx} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap break-words max-w-xs">
                                                    {cellContent}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 italic">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            {RenderMobileCard && (
                <div className="md:hidden space-y-4">
                    {data.length > 0 ? (
                        data.map((item, idx) => (
                            <div key={item[keyField] || idx}>
                                {RenderMobileCard(item)}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 italic p-8 bg-white rounded-lg border border-gray-200">
                            No records found
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
