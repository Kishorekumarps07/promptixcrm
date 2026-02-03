'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, Download } from 'lucide-react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    sortable?: boolean;
    className?: string; // Additional classes for the cell
}

interface AdvancedTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchResult?: string; // Optional external search string if needed
    onSelectionChange?: (selectedIds: string[]) => void; // If provided, shows checkboxes
    actions?: React.ReactNode; // Actions to show when items are selected
    keyField: keyof T; // Unique ID field (usually '_id')
    isLoading?: boolean;
    title?: string; // Optional title above table
    searchPlaceholder?: string;
}

export default function AdvancedTable<T extends Record<string, any>>({
    data,
    columns,
    onSelectionChange,
    actions,
    keyField,
    isLoading = false,
    title,
    searchPlaceholder = "Search..."
}: AdvancedTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
        key: null,
        direction: 'asc'
    });
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // 1. Filter Data
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        return data.filter(item => {
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [data, searchTerm]);

    // 2. Sort Data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key as string];
            const bVal = b[sortConfig.key as string];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // 3. Paginate Data
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    // Handlers
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = paginatedData.map(item => String(item[keyField]));
            setSelectedItems(new Set(allIds));
            if (onSelectionChange) onSelectionChange(allIds);
        } else {
            setSelectedItems(new Set());
            if (onSelectionChange) onSelectionChange([]);
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
        if (onSelectionChange) onSelectionChange(Array.from(newSelected));
    };

    const renderCell = (item: T, column: Column<T>) => {
        if (typeof column.accessor === 'function') {
            return column.accessor(item);
        }
        return item[column.accessor];
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Table Header: Search & Actions */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Left: Title or Search */}
                <div className="flex items-center gap-4 flex-1">
                    {title && <h3 className="font-bold text-navy-900 hidden md:block">{title}</h3>}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Show bulk actions if selection active */}
                    {selectedItems.size > 0 && actions && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 mr-4">
                            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                {selectedItems.size} Selected
                            </span>
                            {actions}
                        </div>
                    )}

                    {/* View/Export Toggles could go here */}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            {/* Checkbox Column */}
                            {onSelectionChange && (
                                <th className="px-6 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        checked={paginatedData.length > 0 && paginatedData.every(item => selectedItems.has(String(item[keyField])))}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}

                            {/* Data Columns */}
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-3 ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                    onClick={() => col.sortable && typeof col.accessor === 'string' && handleSort(col.accessor as string)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {sortConfig.key === col.accessor && (
                                            <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.length > 0 ? paginatedData.map((item, rowIdx) => (
                            <tr key={rowIdx} className={`hover:bg-gray-50/50 transition-colors ${selectedItems.has(String(item[keyField])) ? 'bg-orange-50/10' : ''}`}>
                                {onSelectionChange && (
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                            checked={selectedItems.has(String(item[keyField]))}
                                            onChange={() => handleSelectRow(String(item[keyField]))}
                                        />
                                    </td>
                                )}
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className={`px-6 py-4 ${col.className || ''}`}>
                                        {renderCell(item, col)}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="px-6 py-12 text-center text-gray-400">
                                    No records found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span>Show</span>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-orange-500"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span>per page</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="mr-2">
                        {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
