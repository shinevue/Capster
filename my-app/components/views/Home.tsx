"use client";

import { useState, useEffect, useMemo, useCallback, use } from 'react';
import Footer from "@/components/layout/Footer";
import { LineChartComponent } from "@/components/charts/LineChart";
import { ScatterChartComponent } from "@/components/charts/ScatterChart";
import { FilterGrid } from "@/components/FilterGrid";
import defaultData from "@/data/data.json";
import DataTable from "@/components/DataTable";
import KPICards from "@/components/KPICards";
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import { CarData, Filters } from '@/types/CarData';
import { initialFilters, applyFiltersToData } from '@/utils/filterModule';
import { calculateKPIs, calculateKPIComparison, KPIComparison } from '@/utils/chartTransformers';
import { preloadImages } from '@/utils/imageLoader';

export default function Home() {
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [kpiComparison, setKpiComparison] = useState<KPIComparison | null>(null);
    const [showLineChart, setShowLineChart] = useState(true);
    const [showScatterChart, setShowScatterChart] = useState(true);
    const [showDataTable, setShowDataTable] = useState(true);
    const [preloadedImages, setPreloadedImages] = useState<{ [key: string]: string; }>({});

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
        const filtered = applyFiltersToData(defaultData as CarData[], filters);
        return filtered;
    }, [filters]);

    useEffect(() => {
        const currentKPIs = calculateKPIs(filteredData);

        if (filters.startDate && filters.endDate) {
            const previousPeriodStart = new Date(filters.startDate.getTime() - (filters.endDate.getTime() - filters.startDate.getTime()));
            const previousPeriodEnd = new Date(filters.startDate);
            const previousPeriodData = applyFiltersToData(defaultData as CarData[], { ...filters, startDate: previousPeriodStart, endDate: previousPeriodEnd });
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
        "listing_type",
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

    const topFilters: (keyof Filters)[] = ['make', 'model', 'trim'];
    const otherFilters: (keyof Filters)[] = ['exteriorColor', 'interiorColor', 'mileage', 'transmission', 'drivetrain', 'onlyWithPricing'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 overflow-hidden"
        >
            <main className="flex-grow flex flex-col p-4 md:p-8 overflow-hidden">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 w-full h-full border border-gray-200 flex flex-col overflow-hidden"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                        Porsche 911 GT3 Sales
                    </h1>

                    {/* Top FilterGrid for make, model, variant, trim */}
                    <FilterGrid
                        data={filteredData as CarData[]}
                        currentFilters={filters}
                        onApplyFilters={handleApplyFilters}
                        includedFilters={topFilters}
                    />

                    {kpiComparison && <KPICards kpiComparison={kpiComparison} />}

                    {/* Other FilterGrid for remaining filters */}
                    <FilterGrid
                        data={filteredData as CarData[]}
                        currentFilters={filters}
                        onApplyFilters={handleApplyFilters}
                        includedFilters={otherFilters}
                    />

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

                    <div className="mb-8 flex flex-wrap gap-4">
                        <Switch.Group>
                            <div className="flex items-center">
                                <Switch.Label className="mr-4">Line Chart</Switch.Label>
                                <Switch
                                    checked={showLineChart}
                                    onChange={setShowLineChart}
                                    className={`${showLineChart ? 'bg-blue-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${showLineChart ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>
                        </Switch.Group>
                        <Switch.Group>
                            <div className="flex items-center">
                                <Switch.Label className="mr-4">Scatter Chart</Switch.Label>
                                <Switch
                                    checked={showScatterChart}
                                    onChange={setShowScatterChart}
                                    className={`${showScatterChart ? 'bg-blue-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${showScatterChart ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>
                        </Switch.Group>
                        <Switch.Group>
                            <div className="flex items-center">
                                <Switch.Label className="mr-4">Data Table</Switch.Label>
                                <Switch
                                    checked={showDataTable}
                                    onChange={setShowDataTable}
                                    className={`${showDataTable ? 'bg-blue-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${showDataTable ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>
                        </Switch.Group>
                    </div>

                    <div className="flex flex-col space-y-8 overflow-hidden">
                        {showLineChart && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="bg-white rounded-xl p-6 shadow-lg"
                            >
                                <LineChartComponent
                                    data={filteredData}
                                    onTimeSelection={(startDate, endDate) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            period: 'custom',
                                            periodCount: 0,
                                            startDate,
                                            endDate,
                                        }));
                                    }}
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
                                className="bg-white rounded-xl p-6 shadow-lg"
                            >
                                <ScatterChartComponent
                                    data={filteredData}
                                    onTimeSelection={(startDate, endDate) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            period: 'custom',
                                            periodCount: 0,
                                            startDate,
                                            endDate,
                                        }));
                                    }}
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
                                className="bg-white rounded-xl p-6 shadow-lg flex-grow overflow-auto"
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
            <Footer />
        </motion.div>
    );
}