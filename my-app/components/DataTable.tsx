import React, { useState, useMemo } from 'react';

interface CarData {
    source: string;
    date_listed: string | null;
    year: string;
    make: string;
    model: string;
    trim: string | null;
    price: number | null;
    mileage: number | null;
    interior_color: string | null;
    exterior_color: string | null;
    transmission: string | null;
    drivetrain: string | null;
}

interface DataTableProps {
    data: CarData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const [sortColumn, setSortColumn] = useState<keyof CarData | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const sortedData = useMemo(() => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            if (a[sortColumn] === b[sortColumn]) return 0;
            if (a[sortColumn] === null) return 1;
            if (b[sortColumn] === null) return -1;

            if (typeof a[sortColumn] === 'string' && typeof b[sortColumn] === 'string') {
                return sortDirection === 'asc'
                    ? a[sortColumn].localeCompare(b[sortColumn])
                    : b[sortColumn].localeCompare(a[sortColumn]);
            }

            return sortDirection === 'asc'
                ? (a[sortColumn] as any) - (b[sortColumn] as any)
                : (b[sortColumn] as any) - (a[sortColumn] as any);
        });
    }, [data, sortColumn, sortDirection]);

    const handleSort = (column: keyof CarData) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return (
        <div className="overflow-x-auto w-full">
            <table className="min-w-full bg-gray-900 text-white table-fixed">
                <thead>
                    <tr className="bg-gray-800">
                        {Object.keys(data[0] || {}).map((key) => (
                            <th
                                key={key}
                                className="px-4 py-2 text-left whitespace-normal cursor-pointer hover:bg-gray-700"
                                onClick={() => handleSort(key as keyof CarData)}
                            >
                                {key}
                                {sortColumn === key && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'}>
                            {Object.values(item).map((value, valueIndex) => (
                                <td key={valueIndex} className="px-4 py-2 whitespace-normal break-words">
                                    {value !== null ? String(value) : 'N/A'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;