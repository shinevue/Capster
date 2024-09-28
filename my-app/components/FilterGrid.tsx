"use client";

import React from 'react';
import { CarData, Filters } from '@/types/CarData';
import { Select, Switch, Text } from '@radix-ui/themes';

interface FilterGridProps {
    data: CarData[];
    currentFilters: Filters;
    onApplyFilters: (filters: Filters) => void;
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

export const FilterGrid: React.FC<FilterGridProps> = ({ data, currentFilters, onApplyFilters }) => {
    const uniqueOptions = (key: keyof CarData) => {
        return Array.from(new Set(data.map(item => item[key])))
            .filter(Boolean)
            .sort((a, b) => (a && b ? a.toString().localeCompare(b.toString()) : 0));
    };

    const handleFilterChange = (key: keyof Filters, value: any) => {
        onApplyFilters({ ...currentFilters, [key]: value === 'all' ? null : value });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
                <Text as="label" size="2" weight="bold" className="block mb-1 text-gray-700">
                    Trim
                </Text>
                <Select.Root
                    value={currentFilters.trim || 'all'}
                    onValueChange={(value) => handleFilterChange('trim', value)}
                >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                        <Select.Item value="all">All Trims</Select.Item>
                        {uniqueOptions('trim').map((trim) => (
                            <Select.Item key={trim} value={trim ?? ""}>
                                {trim}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="space-y-2">
                <Text as="label" size="2" weight="bold" className="block mb-1 text-gray-700">
                    Max Mileage
                </Text>
                <Select.Root
                    value={currentFilters.mileage?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('mileage', value === 'all' ? null : parseInt(value))}
                >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                        <Select.Item value="all">Any mileage</Select.Item>
                        {mileageRanges.map((range) => (
                            <Select.Item key={range.value} value={range.value.toString()}>
                                {range.label}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="space-y-2">
                <Text as="label" size="2" weight="bold" className="block mb-1 text-gray-700">
                    Exterior Color
                </Text>
                <Select.Root
                    value={currentFilters.exteriorColor || 'all'}
                    onValueChange={(value) => handleFilterChange('exteriorColor', value)}
                >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                        <Select.Item value="all">All Colors</Select.Item>
                        {colorOptions.map((color) => (
                            <Select.Item key={color} value={color}>
                                {color}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="space-y-2">
                <Text as="label" size="2" weight="bold" className="block mb-1 text-gray-700">
                    Interior Color
                </Text>
                <Select.Root
                    value={currentFilters.interiorColor || 'all'}
                    onValueChange={(value) => handleFilterChange('interiorColor', value)}
                >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                        <Select.Item value="all">All Colors</Select.Item>
                        {colorOptions.map((color) => (
                            <Select.Item key={color} value={color}>
                                {color}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="space-y-2">
                <Text as="label" size="2" weight="bold" className="block mb-1 text-gray-700">
                    Transmission
                </Text>
                <Select.Root
                    value={currentFilters.transmission || 'all'}
                    onValueChange={(value) => handleFilterChange('transmission', value)}
                >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                        <Select.Item value="all">All Transmissions</Select.Item>
                        {transmissionOptions.map((transmission) => (
                            <Select.Item key={transmission} value={transmission}>
                                {transmission}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="space-y-2">
                <Text as="label" size="2" weight="bold" className="block mb-1 text-gray-700">
                    Drivetrain
                </Text>
                <Select.Root
                    value={currentFilters.drivetrain || 'all'}
                    onValueChange={(value) => handleFilterChange('drivetrain', value)}
                >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                        <Select.Item value="all">All Drivetrains</Select.Item>
                        {uniqueOptions('drivetrain').map((drivetrain) => (
                            <Select.Item key={drivetrain} value={drivetrain ?? ""}>
                                {drivetrain}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="space-y-2">
                <Text as="label" size="2" weight="bold" className="block mb-1 text-gray-700">
                    Listing Type
                </Text>
                <Select.Root
                    value={currentFilters.listing_type || 'all'}
                    onValueChange={(value) => handleFilterChange('listing_type', value)}
                >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                        <Select.Item value="all">All Listing Types</Select.Item>
                        {uniqueOptions('listing_type').map((type) => (
                            <Select.Item key={type} value={type ?? ""}>
                                {type}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    checked={currentFilters.onlyWithPricing}
                    onCheckedChange={(checked) => handleFilterChange('onlyWithPricing', checked)}
                />
                <Text as="label" size="2" weight="bold" className="text-gray-700">
                    Only With Pricing
                </Text>
            </div>
        </div>
    );
};