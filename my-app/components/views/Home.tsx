"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from "@/components/layout/Footer";
import { LineChartComponent } from "@/components/charts/LineChart";
import { ScatterChartComponent } from "@/components/charts/ScatterChart";
import { FilterGrid } from "@/components/FilterGrid";
import lineChartData from "@/data/lineChartData.json";
import DataTable from "@/components/DataTable";
import KPICards from "@/components/KPICards";
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import { CarData, Filters, KPIData } from '@/types/CarData';
import { initialFilters, updateFilter, removeFilter, getActiveFilters, applyFiltersToData } from '@/utils/filterModule';
import { calculateKPIs } from '@/utils/chartTransformers';
import { preloadImages } from '@/utils/imageLoader';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
// import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRangePicker } from "@/components/ui/test/date-range-picker";

export default function Home() {
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [kpiData, setKpiData] = useState<KPIData>({
        percentageChange: 0,
        totalListings: 0,
        averageDaysOnMarket: 0,
        averagePrice: 0,
    });
    const [showLineChart, setShowLineChart] = useState(true);
    const [showScatterChart, setShowScatterChart] = useState(true);
    const [showDataTable, setShowDataTable] = useState(true);
    const [preloadedImages, setPreloadedImages] = useState<{ [key: string]: string; }>({});
    const [dateRange, setDateRange] = useState<{ range: DateRange; }>({
        range: {
            from: addDays(new Date(), -7),
            to: new Date(),
        }
    });

    const searchParams = useSearchParams();

    useEffect(() => {
        // Initialize filters from URL params or use dateRange
        const urlFilters = Object.fromEntries(searchParams.entries());
        setFilters(prevFilters => ({
            ...prevFilters,
            ...urlFilters,
            startDate: urlFilters.startDate ? new Date(urlFilters.startDate) : dateRange.range.from,
            endDate: urlFilters.endDate ? new Date(urlFilters.endDate) : dateRange.range.to,
            onlyWithPricing: urlFilters.onlyWithPricing === 'true',
        }));
    }, [searchParams, dateRange]);

    const handleDateRangeChange = (values: { range: DateRange; rangeCompare?: DateRange; }) => {
        setDateRange(values);

        if (values.range.from && values.range.to) {
            setFilters(prev => ({
                ...prev,
                startDate: values.range.from,
                endDate: values.range.to,
                period: 'custom',
                periodCount: 0,
            }));
        }
    };

    const handleRemoveFilter = (key: keyof Filters) => {
        setFilters(prev => removeFilter(prev, key));
    };

    const activeFilters = getActiveFilters(filters);

    useEffect(() => {
        if (!filters.startDate || !filters.endDate) {
            if (filters.period !== 'custom') {
                handleDateRangeChange(dateRange);
            }
        }
    }, []);

    const filteredData = useMemo(() => {
        const filtered = applyFiltersToData(lineChartData as CarData[], filters);
        return filtered;
    }, [filters, lineChartData]);

    useEffect(() => {
        const filteredData = applyFiltersToData(lineChartData as CarData[], filters);
        setKpiData(calculateKPIs(filteredData));

        // Preload images for the filtered data
        preloadImages(filteredData).then(setPreloadedImages);
    }, [filters, lineChartData]);

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

    return (
        <Theme>
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

                        <KPICards {...kpiData} />

                        <FilterGrid
                            data={lineChartData as CarData[]}
                            currentFilters={filters}
                            onApplyFilters={handleApplyFilters}
                        />

                        <div className="mb-8 flex justify-end">
                            <DateRangePicker
                                initialDateFrom={dateRange.range.from}
                                initialDateTo={dateRange.range.to}
                                onUpdate={handleDateRangeChange}
                            />
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
                                            handleDateRangeChange({ range: { from: startDate, to: endDate } });
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
                                            handleDateRangeChange({ range: { from: startDate, to: endDate } });
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
        </Theme>
    );
}