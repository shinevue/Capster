"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: Filters) => void;
    data: CarData[];
    currentFilters: Filters;
}

interface Filters {
    trim: string | null;
    mileage: number | null;
    exteriorColor: string | null;
    interiorColor: string | null;
    transmission: string | null;
    drivetrain: string | null;
    listing_type: string | null;
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
    listing_type: string | null;
}

const basicColors = [
    "Black", "White", "Gray", "Silver", "Red", "Blue", "Green", "Yellow", "Orange", "Brown", "Purple", "Pink", "Beige", "Gold"
];

const standardTransmissions = [
    "Manual",
    "Automatic",
];

export function FilterModal({ isOpen, onClose, onApplyFilters, data, currentFilters }: FilterModalProps) {
    const [filters, setFilters] = useState<Filters>(currentFilters);

    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    const uniqueOptions = (key: keyof CarData) => {
        return Array.from(new Set(data.map(item => item[key])))
            .filter(Boolean)
            .sort((a, b) => (a && b ? a.toString().localeCompare(b.toString()) : 0));
    };

    const colorOptions = (key: 'exterior_color' | 'interior_color') => {
        const uniqueColors = Array.from(new Set(data.map(item => item[key])))
            .filter(Boolean) as string[];

        return basicColors.filter(color =>
            uniqueColors.some(uniqueColor =>
                uniqueColor.toLowerCase().includes(color.toLowerCase())
            )
        ).sort();
    };

    const mileageRanges = [
        { value: 10000, label: "Up to 10,000" },
        { value: 25000, label: "Up to 25,000" },
        { value: 50000, label: "Up to 50,000" },
        { value: 75000, label: "Up to 75,000" },
        { value: 100000, label: "Up to 100,000" },
        { value: 150000, label: "Up to 150,000" },
        { value: 200000, label: "Up to 200,000" },
        { value: Infinity, label: "Any mileage" },
    ];

    const transmissionOptions = () => {
        return standardTransmissions.filter(transmission =>
            data.some(car => car.transmission && car.transmission.toLowerCase().includes(transmission.toLowerCase()))
        );
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-black mb-4"
                                >
                                    Filter Options
                                </Dialog.Title>
                                <button
                                    onClick={onClose}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                                >
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                                <div className="mt-2 space-y-4">
                                    {/* Trim */}
                                    <div>
                                        <label htmlFor="trim" className="block text-sm font-medium text-black mb-1">
                                            Trim
                                        </label>
                                        <select
                                            id="trim"
                                            name="trim"
                                            value={filters.trim || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black py-2 px-3"
                                        >
                                            <option value="">All Trims</option>
                                            {uniqueOptions('trim').map((trim) => (
                                                <option key={trim} value={trim}>
                                                    {trim}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Mileage */}
                                    <div>
                                        <label htmlFor="mileage" className="block text-sm font-medium text-black mb-1">
                                            Max Mileage
                                        </label>
                                        <select
                                            id="mileage"
                                            name="mileage"
                                            value={filters.mileage || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black py-2 px-3"
                                        >
                                            <option value="">Any mileage</option>
                                            {mileageRanges.map((range) => (
                                                <option key={range.value} value={range.value}>
                                                    {range.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Exterior Color */}
                                    <div>
                                        <label htmlFor="exteriorColor" className="block text-sm font-medium text-black mb-1">
                                            Exterior Color
                                        </label>
                                        <select
                                            id="exteriorColor"
                                            name="exteriorColor"
                                            value={filters.exteriorColor || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black py-2 px-3"
                                        >
                                            <option value="">All Colors</option>
                                            {colorOptions('exterior_color').map((color) => (
                                                <option key={color} value={color}>
                                                    {color}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Interior Color */}
                                    <div>
                                        <label htmlFor="interiorColor" className="block text-sm font-medium text-black mb-1">
                                            Interior Color
                                        </label>
                                        <select
                                            id="interiorColor"
                                            name="interiorColor"
                                            value={filters.interiorColor || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black py-2 px-3"
                                        >
                                            <option value="">All Colors</option>
                                            {colorOptions('interior_color').map((color) => (
                                                <option key={color} value={color}>
                                                    {color}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Transmission */}
                                    <div>
                                        <label htmlFor="transmission" className="block text-sm font-medium text-black mb-1">
                                            Transmission
                                        </label>
                                        <select
                                            id="transmission"
                                            name="transmission"
                                            value={filters.transmission || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black py-2 px-3"
                                        >
                                            <option value="">All Transmissions</option>
                                            {transmissionOptions().map((transmission) => (
                                                <option key={transmission} value={transmission}>
                                                    {transmission}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Drivetrain */}
                                    <div>
                                        <label htmlFor="drivetrain" className="block text-sm font-medium text-black mb-1">
                                            Drivetrain
                                        </label>
                                        <select
                                            id="drivetrain"
                                            name="drivetrain"
                                            value={filters.drivetrain || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black py-2 px-3"
                                        >
                                            <option value="">All Drivetrains</option>
                                            {uniqueOptions('drivetrain').map((drivetrain) => (
                                                <option key={drivetrain} value={drivetrain}>
                                                    {drivetrain}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Listing Type */}
                                    <div>
                                        <label htmlFor="listing_type" className="block text-sm font-medium text-black mb-1">
                                            Listing Type
                                        </label>
                                        <select
                                            id="listing_type"
                                            name="listing_type"
                                            value={filters.listing_type || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black py-2 px-3"
                                        >
                                            <option value="">All Listing Types</option>
                                            {uniqueOptions('listing_type').map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleApply}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    >
                                        Apply Filters
                                    </motion.button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}