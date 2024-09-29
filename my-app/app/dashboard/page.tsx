"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChartComponent } from "@/components/charts/LineChart";
import { ScatterChartComponent } from "@/components/charts/ScatterChart";
import { FilterGrid } from "@/components/FilterGrid";
import defaultData from "@/data/data.json";
import DataTable from "@/components/DataTable";
import KPICards from "@/components/KPICards";
import { motion, AnimatePresence } from 'framer-motion';
import { CarData, Filters } from '@/types/CarData';
import { initialFilters, applyFiltersToData } from '@/utils/filterModule';
import { calculateKPIs, calculateKPIComparison, KPIComparison } from '@/utils/chartTransformers';
import { preloadImages } from '@/utils/imageLoader';
import { useMediaQuery } from 'react-responsive';
import { FaChartLine, FaChartBar, FaTable, FaFilter, FaCog } from 'react-icons/fa';
import { ChartToggleButton } from '@/components/ui/chartToggleButton';
import * as Dialog from '@radix-ui/react-dialog';

export default function Dashboard() {
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [kpiComparison, setKpiComparison] = useState<KPIComparison | null>(null);
    const [showLineChart, setShowLineChart] = useState(true);
    const [showScatterChart, setShowScatterChart] = useState(true);
    const [showDataTable, setShowDataTable] = useState(true);
    const [preloadedImages, setPreloadedImages] = useState<{ [key: string]: string; }>({});
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isChartSettingsOpen, setIsChartSettingsOpen] = useState(false);

    const handleTimeFilterChange = (newPeriod: 'day' | 'week' | 'month' | null, newPeriodCount: number | null) => {
        const endDate = new Date();
        const startDate = new Date();

        switch (newPeriod) {
            case 'day':
                startDate.setDate(endDate.getDate() - (newPeriodCount || 0));
                break;
            case 'week':
                startDate.setDate(endDate.getDate() - (newPeriodCount || 0) * 7);
                break;
            case 'month':
                startDate.setMonth(endDate.getMonth() - (newPeriodCount || 0));
                break;
        }

        setFilters(prev => ({
            ...prev,
            period: newPeriod,
            periodCount: newPeriodCount,
            startDate,
            endDate,
        }));
    };

    useEffect(() => {
        // Initialize with the default option (Last week)
        handleTimeFilterChange(filters?.period, filters?.periodCount);
    }, []);

    const filteredData = useMemo(() => {
        const filtered = applyFiltersToData(defaultData as unknown as CarData[], filters);
        return filtered;
    }, [filters, defaultData]);

    useEffect(() => {
        const currentKPIs = calculateKPIs(filteredData);

        if (filters.startDate && filters.endDate) {
            const previousPeriodStart = new Date(filters.startDate.getTime() - (filters.endDate.getTime() - filters.startDate.getTime()));
            const previousPeriodEnd = new Date(filters.startDate);
            const previousPeriodData = applyFiltersToData(defaultData as unknown as CarData[], { ...filters, startDate: previousPeriodStart, endDate: previousPeriodEnd });
            const previousKPIs = calculateKPIs(previousPeriodData);

            const comparison = calculateKPIComparison(currentKPIs, previousKPIs);
            setKpiComparison(comparison);
        } else {
            setKpiComparison(null);
        }

        // Preload images for the filtered data
        preloadImages(filteredData).then(setPreloadedImages);
    }, [filters, filteredData]);

    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
    };

    // Define the columns you want to display
    const tableColumns: (keyof CarData)[] = [
        'image',
        'url',
        "listingType",
        'price',
        'year',
        'make',
        'model',
        'trim',
        'exterior_color',
        'interior_color',
        'transmission',
        'date_listed',
    ];

    const sortableColumns: (keyof CarData)[] = [
        'price',
        'year',
        'make',
        'model',
        "date_listed"
    ];

    // Create a memoized image loader function
    const imageLoader = useCallback((src: string) => preloadedImages[src] || src, [preloadedImages]);

    const topFilters: (keyof Filters)[] = ['make', 'model', 'trim', 'year'];
    const otherFilters: (keyof Filters)[] = ['exteriorColor', 'interiorColor', 'mileage', 'transmission', 'drivetrain', 'onlyWithPricing'];

    const isMobile = useMediaQuery({ maxWidth: 767 });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full flex flex-col text-gray-800 overflow-hidden mt-10 md:mt-20"
        >
            <main className="flex-grow flex flex-col overflow-hidden relative">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white p-2 md:p-10 w-full h-full flex flex-col overflow-hidden md:w-[90%] md:mx-auto"
                >
                    {/* Top FilterGrid for make, model, variant, trim */}
                    <FilterGrid
                        data={filteredData as CarData[]}
                        currentFilters={filters}
                        onApplyFilters={handleApplyFilters}
                        includedFilters={topFilters}
                    />

                    {/* KPI Cards */}
                    <div className="mt-5 mb-10">
                        {kpiComparison && <KPICards kpiComparison={kpiComparison} />}
                    </div>

                    {/* Other FilterGrid for remaining filters */}
                    {isMobile ? (
                        <Dialog.Root open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                            <Dialog.Trigger asChild>
                                <button
                                    className="fixed right-4 top-20 z-50 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
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
                                        <Dialog.Content
                                            asChild
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, x: "100%" }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, x: "100%" }}
                                                transition={{ duration: 0.2 }}
                                                className="fixed top-0 right-0 h-full w-full max-w-sm bg-white p-6 shadow-xl overflow-y-auto"
                                            >
                                                <Dialog.Title className="text-xl font-bold mb-4">Filters</Dialog.Title>
                                                <FilterGrid
                                                    data={filteredData as CarData[]}
                                                    currentFilters={filters}
                                                    onApplyFilters={(newFilters) => {
                                                        handleApplyFilters(newFilters);
                                                        setIsFilterModalOpen(false);
                                                    }}
                                                    includedFilters={otherFilters.filter(filter => filter !== 'onlyWithPricing')}
                                                />
                                                <Dialog.Close asChild>
                                                    <button className="mt-4 p-2 px-6 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200">Close</button>
                                                </Dialog.Close>
                                            </motion.div>
                                        </Dialog.Content>
                                    </Dialog.Portal>
                                )}
                            </AnimatePresence>
                        </Dialog.Root>
                    ) : (
                        <FilterGrid
                            data={filteredData as CarData[]}
                            currentFilters={filters}
                            onApplyFilters={handleApplyFilters}
                            includedFilters={otherFilters}
                        />
                    )}

                    <div className="mb-8 flex justify-end">
                        <motion.div whileHover={{ scale: 1.05 }} className="relative">
                            <select
                                className="appearance-none bg-white text-gray-800 border border-gray-300 rounded-full px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md"
                                value={`${filters.period}-${filters.periodCount}`}
                                onChange={(e) => {
                                    const [period, count] = e.target.value.split('-');
                                    handleTimeFilterChange(period as 'day' | 'week' | 'month', parseInt(count));
                                }}
                            >
                                <option value="day-7" >Last week</option>
                                <option value="day-30">Last 30 days</option>
                                <option value="month-3">Last 3 months</option>
                                <option value="month-6">Last 6 months</option>
                                <option value="month-12">Last 12 months</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </motion.div>
                    </div>

                    {isMobile ? (
                        <Dialog.Root open={isChartSettingsOpen} onOpenChange={setIsChartSettingsOpen}>
                            <Dialog.Trigger asChild>
                                <button
                                    className="fixed right-4 top-36 z-50 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                                    aria-label="Chart settings"
                                >
                                    <FaCog size={20} />
                                </button>
                            </Dialog.Trigger>
                            <AnimatePresence>
                                {isChartSettingsOpen && (
                                    <Dialog.Portal forceMount>
                                        <Dialog.Overlay asChild>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 bg-black bg-opacity-50"
                                            />
                                        </Dialog.Overlay>
                                        <Dialog.Content
                                            asChild
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, x: "100%" }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, x: "100%" }}
                                                transition={{ duration: 0.2 }}
                                                className="fixed top-0 right-0 h-full w-full max-w-sm bg-white p-6 shadow-xl overflow-y-auto"
                                            >
                                                <Dialog.Title className="text-xl font-bold mb-4">Chart Settings</Dialog.Title>
                                                <div className="flex flex-col space-y-4">
                                                    <ChartToggleButton
                                                        icon={<FaChartLine />}
                                                        label="Line Chart"
                                                        isActive={showLineChart}
                                                        onClick={() => setShowLineChart(!showLineChart)}
                                                        color="bg-blue-500"
                                                    />
                                                    <ChartToggleButton
                                                        icon={<FaChartBar />}
                                                        label="Scatter Chart"
                                                        isActive={showScatterChart}
                                                        onClick={() => setShowScatterChart(!showScatterChart)}
                                                        color="bg-blue-500"
                                                    />
                                                    <ChartToggleButton
                                                        icon={<FaTable />}
                                                        label="Data Table"
                                                        isActive={showDataTable}
                                                        onClick={() => setShowDataTable(!showDataTable)}
                                                        color="bg-blue-500"
                                                    />
                                                </div>
                                                <Dialog.Close asChild>
                                                    <button className="mt-4 p-2 px-6 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200">Close</button>
                                                </Dialog.Close>
                                            </motion.div>
                                        </Dialog.Content>
                                    </Dialog.Portal>
                                )}
                            </AnimatePresence>
                        </Dialog.Root>
                    ) : (
                        <div className="mb-8 flex flex-wrap gap-4 justify-center">
                            <ChartToggleButton
                                icon={<FaChartLine />}
                                label="Line Chart"
                                isActive={showLineChart}
                                onClick={() => setShowLineChart(!showLineChart)}
                                color="bg-blue-500"
                            />
                            <ChartToggleButton
                                icon={<FaChartBar />}
                                label="Scatter Chart"
                                isActive={showScatterChart}
                                onClick={() => setShowScatterChart(!showScatterChart)}
                                color="bg-blue-500"
                            />
                            <ChartToggleButton
                                icon={<FaTable />}
                                label="Data Table"
                                isActive={showDataTable}
                                onClick={() => setShowDataTable(!showDataTable)}
                                color="bg-blue-500"
                            />
                        </div>
                    )}

                    <div className="flex flex-col space-y-20 overflow-hidden">
                        {showLineChart && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className={`bg-white rounded-sm shadow-md ${isMobile ? "w-full" : "p-6"}`}
                            >
                                <LineChartComponent
                                    data={filteredData}
                                    onTimeSelection={() => { }}
                                    onDataSelection={() => { }}
                                    startDate={filters.startDate}
                                    endDate={filters.endDate}
                                />
                            </motion.div>
                        )}
                        {showScatterChart && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className={`bg-white rounded-sm shadow-md ${isMobile ? "w-full" : "p-6"}`}
                            >
                                <ScatterChartComponent
                                    data={filteredData}
                                    onTimeSelection={() => { }}
                                    onDataSelection={() => { }}
                                    startDate={filters.startDate}
                                    endDate={filters.endDate}
                                    imageLoader={imageLoader}  // Pass the imageLoader function
                                />
                            </motion.div>
                        )}
                        {showDataTable && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="bg-white rounded-xl md:p-6 shadow-lg flex-grow overflow-auto"
                            >
                                <DataTable
                                    data={filteredData}
                                    columns={tableColumns}
                                    sortableColumns={sortableColumns}
                                    imageLoader={imageLoader}
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </main>
        </motion.div>
    );
}