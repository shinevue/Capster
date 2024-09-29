import React, { useMemo } from 'react';
import { CarData, Filters } from '@/types/CarData';

interface FilterComponentProps {
    filters: Filters;
    onApplyFilters: (newFilters: Filters) => void;
    data: CarData[];
}

export const FilterComponent: React.FC<FilterComponentProps> = ({ filters, onApplyFilters, data }) => {
    const uniqueValues = useMemo(() => {
        return {
            make: Array.from(new Set(data.map(item => item.make))).sort(),
            model: Array.from(new Set(data.map(item => item.model))).sort(),
            year: Array.from(new Set(data.map(item => Number(item.year)))).sort((a, b) => b - a),
            trim: Array.from(new Set(data.map(item => item.trim))).sort(),
            exteriorColor: Array.from(new Set(data.map(item => item.exterior_color))).sort(),
            interiorColor: Array.from(new Set(data.map(item => item.interior_color))).sort(),
            transmission: Array.from(new Set(data.map(item => item.transmission))).sort(),
            listingType: Array.from(new Set(data.map(item => item.listingType))).sort(),
        };
    }, [data]);

    const handleFilterChange = (key: keyof Filters, value: string | number | null) => {
        onApplyFilters({ ...filters, [key]: value });
    };

    return (
        <div className="mb-8 p-4 bg-white rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Make */}
                <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700">Make</label>
                    <select
                        id="make"
                        value={filters.make || ''}
                        onChange={(e) => handleFilterChange('make', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">All</option>
                        {uniqueValues.make.map(make => (
                            <option key={make} value={make}>{make}</option>
                        ))}
                    </select>
                </div>

                {/* Model */}
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                    <select
                        id="model"
                        value={filters.model || ''}
                        onChange={(e) => handleFilterChange('model', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">All</option>
                        {uniqueValues.model.map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>
                </div>

                {/* Year
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                    <select
                        id="year"
                        value={filters.year || ''}
                        onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">All</option>
                        {uniqueValues.year.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div> */}

                {/* Trim */}
                <div>
                    <label htmlFor="trim" className="block text-sm font-medium text-gray-700">Trim</label>
                    <select
                        id="trim"
                        value={filters.trim || ''}
                        onChange={(e) => handleFilterChange('trim', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">All</option>
                        {uniqueValues.trim.map(trim => (
                            <option key={trim} value={trim || ''}>{trim}</option>
                        ))}
                    </select>
                </div>

                {/* Exterior Color */}
                <div>
                    <label htmlFor="exteriorColor" className="block text-sm font-medium text-gray-700">Exterior Color</label>
                    <select
                        id="exteriorColor"
                        value={filters.exteriorColor || ''}
                        onChange={(e) => handleFilterChange('exteriorColor', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">All</option>
                        {uniqueValues.exteriorColor.map(color => (
                            <option key={color} value={color || ''}>{color}</option>
                        ))}
                    </select>
                </div>

                {/* Interior Color */}
                <div>
                    <label htmlFor="interior_color" className="block text-sm font-medium text-gray-700">Interior Color</label>
                    <select
                        id="interior_color"
                        value={filters.interiorColor || ''}
                        onChange={(e) => handleFilterChange('interiorColor', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">All</option>
                        {uniqueValues.interiorColor.map(color => (
                            <option key={color} value={color || ''}>{color}</option>
                        ))}
                    </select>
                </div>

                {/* Transmission */}
                <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">Transmission</label>
                    <select
                        id="transmission"
                        value={filters.transmission || ''}
                        onChange={(e) => handleFilterChange('transmission', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">All</option>
                        {uniqueValues.transmission.map(transmission => (
                            <option key={transmission} value={transmission || ''}>{transmission}</option>
                        ))}
                    </select>
                </div>

                {/* Listing Type */}
                <div>
                    <label htmlFor="listingType" className="block text-sm font-medium text-gray-700">Listing Type</label>
                    <select
                        id="listingType"
                        value={filters.listingType || ''}
                        onChange={(e) => handleFilterChange('listingType', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">All</option>
                        {uniqueValues.listingType.map(type => (
                            <option key={type} value={type || ''}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};