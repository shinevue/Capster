"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: Filters) => void;
    data: CarData[];
    currentFilters: Filters; // Add this prop
}

interface Filters {
    trim: string | null;
    mileage: number | null;
    exteriorColor: string | null;
    interiorColor: string | null;
    transmission: string | null;
    drivetrain: string | null;
    period: 'day' | 'week' | 'month';
    periodCount: number;
}

interface CarData {
    source: string;
    date_listed: string | null;
    year: string;
    make: string;
    model: string;
    trim: string | null;
    price: number | null;
    mileage: number;
    interior_color: string | null;
    exterior_color: string | null;
    transmission: string | null;
    drivetrain: string | null;
}

const mainColors = [
    "Black", "White", "Gray", "Silver", "Red", "Blue", "Green", "Yellow", "Orange", "Brown", "Purple", "Pink"
];

export function FilterModal({ isOpen, onClose, onApplyFilters, data, currentFilters }: FilterModalProps) {
    const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);

    // Update local filters when currentFilters change
    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters]);

    const uniqueValues = useMemo(() => {
        const getMainColor = (color: string | null) => {
            if (!color) return null;
            const lowerColor = color.toLowerCase();
            return mainColors.find(mainColor => lowerColor.includes(mainColor.toLowerCase())) || "Other";
        };

        const exteriorColors = new Set(data.map(car => getMainColor(car.exterior_color)));
        const interiorColors = new Set(data.map(car => getMainColor(car.interior_color)));
        const transmissions = new Set(data.map(car => car.transmission?.toLowerCase()));
        const hasManual = transmissions.has('manual');
        const hasAutomatic = transmissions.has('automatic');
        const hasUnknownTransmission = data.some(car => car.transmission === null);

        return {
            trim: Array.from(new Set(data.map(car => car.trim).filter(Boolean))),
            exteriorColor: Array.from(exteriorColors).filter(Boolean) as string[],
            interiorColor: Array.from(interiorColors).filter(Boolean) as string[],
            transmission: [
                ...(hasManual ? ['Manual'] : []),
                ...(hasAutomatic ? ['Automatic'] : []),
                ...(hasUnknownTransmission ? ['Unknown'] : []),
            ],
            drivetrain: Array.from(new Set(data.map(car => car.drivetrain).filter(Boolean))),
        };
    }, [data]);

    const mileageOptions = [
        { label: 'All', value: null },
        { label: 'Under 10k', value: 10000 },
        { label: 'Under 50k', value: 50000 },
        { label: 'Under 100k', value: 100000 },
        { label: 'Over 100k', value: 100001 },
    ];

    if (!isOpen) return null;

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-center p-6 border-b border-gray-800">
                        <Dialog.Title className="text-2xl font-semibold text-white">
                            Filters
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Trim */}
                        <div>
                            <label htmlFor="trim" className="block text-sm font-medium text-gray-300 mb-2">
                                Trim
                            </label>
                            <select
                                id="trim"
                                value={localFilters.trim || ''}
                                onChange={(e) => setLocalFilters({ ...localFilters, trim: e.target.value || null })}
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                <option value="">All Trims</option>
                                {uniqueValues.trim.map((trim) => (
                                    <option key={trim} value={trim}>{trim}</option>
                                ))}
                            </select>
                        </div>

                        {/* Mileage */}
                        <div>
                            <label htmlFor="mileage" className="block text-sm font-medium text-gray-300 mb-2">
                                Mileage
                            </label>
                            <select
                                id="mileage"
                                value={localFilters.mileage === null ? '' : localFilters.mileage}
                                onChange={(e) => setLocalFilters({ ...localFilters, mileage: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                {mileageOptions.map((option) => (
                                    <option key={option.label} value={option.value ?? ''}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Exterior Color */}
                        <div>
                            <label htmlFor="exteriorColor" className="block text-sm font-medium text-gray-300 mb-2">
                                Exterior Color
                            </label>
                            <select
                                id="exteriorColor"
                                value={localFilters.exteriorColor || ''}
                                onChange={(e) => setLocalFilters({ ...localFilters, exteriorColor: e.target.value || null })}
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                <option value="">All Colors</option>
                                {uniqueValues.exteriorColor.map((color) => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>

                        {/* Interior Color */}
                        <div>
                            <label htmlFor="interiorColor" className="block text-sm font-medium text-gray-300 mb-2">
                                Interior Color
                            </label>
                            <select
                                id="interiorColor"
                                value={localFilters.interiorColor || ''}
                                onChange={(e) => setLocalFilters({ ...localFilters, interiorColor: e.target.value || null })}
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                <option value="">All Colors</option>
                                {uniqueValues.interiorColor.map((color) => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>

                        {/* Transmission */}
                        <div>
                            <label htmlFor="transmission" className="block text-sm font-medium text-gray-300 mb-2">
                                Transmission
                            </label>
                            <select
                                id="transmission"
                                value={localFilters.transmission || ''}
                                onChange={(e) => setLocalFilters({ ...localFilters, transmission: e.target.value || null })}
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                <option value="">All Transmissions</option>
                                {uniqueValues.transmission.map((transmission) => (
                                    <option key={transmission} value={transmission}>{transmission}</option>
                                ))}
                            </select>
                        </div>

                        {/* Drivetrain */}
                        <div>
                            <label htmlFor="drivetrain" className="block text-sm font-medium text-gray-300 mb-2">
                                Drivetrain
                            </label>
                            <select
                                id="drivetrain"
                                value={localFilters.drivetrain || ''}
                                onChange={(e) => setLocalFilters({ ...localFilters, drivetrain: e.target.value || null })}
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                <option value="">All Drivetrains</option>
                                {uniqueValues.drivetrain.map((drivetrain) => (
                                    <option key={drivetrain} value={drivetrain}>{drivetrain}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 p-6 border-t border-gray-800">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}