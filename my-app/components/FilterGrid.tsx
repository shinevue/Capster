"use client";

import React, { useState } from 'react';
import { CarData, Filters } from '@/types/CarData';
import { Select, SelectItem } from "@nextui-org/react";

import { capitalizeWords } from '@/lib/utils';
import { motion } from 'framer-motion';
import "@/styles/FilterGrid.css";

interface FilterGridProps {
    data?: CarData[];
    currentFilters?: Filters;
    handleFilterChange?: (filters: Filters) => void;
    handleSubmit?: () => void;
    handleResetFilters?: () => void;
    includedFilters?: (keyof Filters)[];
    isLoading?: boolean;
    uniqueFilterValues?: {
        make: string[],
        model: string[],
        trim: string[],
        year: number[];
    };
}

const colorOptions = ['Black', 'White', 'Gray', 'Silver', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Brown', 'Purple', 'Pink', 'Beige', 'Gold'];
const transmissionOptions = ['Manual', 'Automatic'];

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

export function FilterGrid({ data, currentFilters, handleFilterChange, handleResetFilters, handleSubmit, includedFilters, isLoading, uniqueFilterValues }: FilterGridProps) {
    const [tempSelectedValues, setTempSelectedValues] = useState<Partial<Filters>>({});

    const uniqueOptions = (key: keyof CarData) => {
        return Array.from(new Set(data?.map(item => item[key])))
            .filter(Boolean)
            .sort((a, b) => (a && b ? a.toString().localeCompare(b.toString()) : 0));
    };

    const handleFilterChangeLocal = (key: keyof Filters, value: any) => {
        if (key === 'mileage') {
            const mileageValue = value !== null ? parseInt(value) : null;
            handleFilterChange?.({ ...currentFilters, [key]: mileageValue || null } as Filters);
        } else {
            handleFilterChange?.({ ...currentFilters, [key]: value.length === 0 ? null : value } as Filters);
        }
    };

    const handleSelectionChange = (key: keyof Filters, keys: any) => {
        let newValue;
        if (key === 'mileage') {
            // Cast the first element to string before parsing
            newValue = keys.size > 0 ? parseInt(Array.from(keys)[0] as string) : null;
        } else {
            newValue = Array.from(keys);
        }
        setTempSelectedValues(prev => ({ ...prev, [key]: newValue }));

        // Immediately apply the change for mileage
        if (key === 'mileage') {
            handleFilterChangeLocal(key, newValue);
        }
    };

    const handleClose = (key: keyof Filters) => {
        if (tempSelectedValues[key] !== undefined) {
            if (key !== 'mileage') {
                handleFilterChangeLocal(key, tempSelectedValues[key]);
            }
        }
    };

    const filterConfig: Record<keyof Filters, { label: string; options: any[]; }> = {
        year: { label: 'Year', options: uniqueFilterValues?.year || [] },
        make: { label: 'Make', options: uniqueFilterValues?.make || [] },
        model: { label: 'Model', options: uniqueFilterValues?.model || [] },
        trim: { label: 'Trim', options: uniqueFilterValues?.trim || [] },
        mileage: { label: 'Mileage', options: mileageRanges },
        exteriorColor: { label: 'Exterior Color', options: colorOptions },
        interiorColor: { label: 'Interior Color', options: colorOptions },
        transmission: { label: 'Transmission', options: transmissionOptions },
        drivetrain: { label: 'Drivetrain', options: uniqueOptions('drivetrain') },
        listingType: { label: 'Listing Type', options: uniqueOptions('listing_type') },
        startDate: { label: 'Start Date', options: [] }, // Handled separately
        endDate: { label: 'End Date', options: [] }, // Handled separately
        period: { label: 'Period', options: [] }, // Handled separately
        periodCount: { label: 'Period Count', options: [] }, // Handled separately
        onlyWithPricing: { label: 'Only With Pricing', options: [] }, // Handled separately
    };

    return (
        <div className='w-full'>
            <div className="w-full flex flex-col sm5:flex-row gap-6 items-center">
                <div className='flex w-full gap-3'>
                    {Object.entries(filterConfig).map(([key, config]) => {
                        if (!includedFilters?.includes(key as keyof Filters)) return null;

                        if (key === 'onlyWithPricing') return null;

                        return (
                            <div key={key} className="w-full">
                                <Select
                                    variant={"bordered"}
                                    label={config.label}
                                    selectionMode={key === 'mileage' ? "single" : "multiple"}
                                    selectedKeys={key === 'mileage'
                                        ? (tempSelectedValues[key as keyof Filters] !== undefined
                                            ? [tempSelectedValues[key as keyof Filters]?.toString() as string]
                                            : undefined)
                                        : tempSelectedValues[key as keyof Filters] as Iterable<any> | undefined
                                    }
                                    onSelectionChange={(keys: any) => handleSelectionChange(key as keyof Filters, keys)}
                                    onClose={() => handleClose(key as keyof Filters)}
                                    className="w-full font-thin text-medium"
                                    popoverProps={{
                                        classNames: {
                                            content: "font-extrabold"
                                        }
                                    }}
                                >
                                    {config.options.map((option) => (
                                        <SelectItem key={key === 'mileage' ? option.value.toString() : option.toString()} value={key === 'mileage' ? option.value.toString() : option.toString()} className="py-2">
                                            {key === 'mileage' ? option.label : capitalizeWords(option.toString())}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        );
                    })}
                </div>
                {(handleSubmit || handleResetFilters) && (
                    <div className='flex w-1/4 gap-3'>
                        <div className='w-full'>
                            <motion.button
                                className="w-full bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Filtering...' : 'Apply'}
                            </motion.button>
                        </div>
                        <div className='w-full'>
                            <motion.button
                                className="w-full reset-button bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleResetFilters}
                            >
                                Reset
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}