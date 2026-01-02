import { ReactNode } from 'react';

interface Column<T> {
    header: string;
    accessor?: keyof T | ((item: T) => ReactNode); // Key or render function
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField?: string; // unique key property name, default '_id'
}

export default function Table<T extends Record<string, any>>({ columns, data, keyField = '_id' }: TableProps<T>) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                            <td key={colIdx} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
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
    );
}
