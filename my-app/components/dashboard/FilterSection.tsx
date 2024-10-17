import React from 'react';
import { FilterGrid } from "@/components/FilterGrid";
import { CarData, Filters } from '@/types/CarData';
import { useMediaQuery } from 'react-responsive';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { FaFilter } from 'react-icons/fa';

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
interface FilterSectionProps {
    filteredData: CarData[];
    filters: Filters;
    handleFilterChange: (newFilters: Filters) => void;
    handleApplyFilters: (newFilters: Filters) => void;
    handleTimeFilterChange: (newPeriod: 'day' | 'week' | 'month' | null, newPeriodCount: number | null) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
    filteredData,
    filters,
    handleFilterChange,
    handleApplyFilters,
    handleTimeFilterChange
}) => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

    const topFilters: (keyof Filters)[] = ['make', 'model', 'trim', 'year'];
    const otherFilters: (keyof Filters)[] = ['exteriorColor', 'interiorColor', 'mileage', 'transmission', 'drivetrain', 'listingType', 'onlyWithPricing'];

    return (
        <>
            {isMobile ? (
                <Dialog.Root open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                    <Dialog.Trigger asChild>
                        <button
                            className="fixed right-4 top-20 z-50 p-3 bg-blue-500 dark:bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-blue-700  duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                            aria-label="Open filters"
                        >
                            <FaFilter size={20} />
                        </button>
                    </Dialog.Trigger>
                    <AnimatePresence>
                        {isFilterModalOpen && (
                            <Dialog.Portal forceMount>
                                <Dialog.Overlay asChild>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black bg-opacity-50"
                                    />
                                </Dialog.Overlay>
                                <Dialog.Content asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, x: "100%" }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, x: "100%" }}
                                        transition={{ duration: 0.2 }}
                                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 p-6 shadow-xl overflow-y-auto"
                                    >
                                        <Dialog.Title className="flex justify-between my-4 items-center">
                                            <div className='text-2xl font-bold dark:text-gray-200'>Filters</div>
                                            <div className='text-sm flex justify-end items-center gap-8'>
                                                <div>
                                                    <motion.div whileHover={{ scale: 1.05 }} className="relative">
                                                        <select
                                                            className="appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-md"
                                                            value={`${filters.period}-${filters.periodCount}`}
                                                            onChange={(e) => {
                                                                const [period, count] = e.target.value.split('-');
                                                                handleTimeFilterChange(period as 'day' | 'week' | 'month', parseInt(count));
                                                            }}
                                                        >
                                                            <option value="day-7">Last week</option>
                                                            <option value="day-30">Last 30 days</option>
                                                            <option value="month-3">Last 3 months</option>
                                                            <option value="month-6">Last 6 months</option>
                                                            <option value="month-12">Last 12 months</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                            </svg>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </Dialog.Title>
                                        <FilterGrid
                                            data={filteredData}
                                            currentFilters={filters}
                                            handleFilterChange={(newFilters) => {
                                                handleApplyFilters(newFilters);
                                                setIsFilterModalOpen(false);
                                            }}
                                            includedFilters={otherFilters.filter(filter => filter !== 'onlyWithPricing')}
                                        />
                                        <Dialog.Close asChild>
                                            <button className="mt-4 p-2 px-6 w-full bg-red-500 text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">Close</button>
                                        </Dialog.Close>
                                    </motion.div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        )}
                    </AnimatePresence>
                </Dialog.Root>
            ) : (
                <div className='flex items-center gap-6'>
                    <FilterGrid
                        data={filteredData}
                        currentFilters={filters}
                        handleFilterChange={handleApplyFilters}
                        includedFilters={otherFilters}
                    />
                    <div className='flex justify-end items-center gap-8'>
                        <div>
                            <motion.div whileHover={{ scale: 1.05 }} className="relative">
                                <select
                                    className="appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-md"
                                    value={`${filters.period}-${filters.periodCount}`}
                                    onChange={(e) => {
                                        const [period, count] = e.target.value.split('-');
                                        handleTimeFilterChange(period as 'day' | 'week' | 'month', parseInt(count));
                                    }}
                                >
                                    <option value="day-7">Last week</option>
                                    <option value="day-30">Last 30 days</option>
                                    <option value="month-3">Last 3 months</option>
                                    <option value="month-6">Last 6 months</option>
                                    <option value="month-12">Last 12 months</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};