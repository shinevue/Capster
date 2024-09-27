"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from "@/components/layout/Footer";
import { LineChartComponent } from "@/components/charts/LineChart";
import { ScatterChartComponent } from "@/components/charts/ScatterChart";
import { FilterModal } from "@/components/FilterModal";
import lineChartData from "@/data/lineChartData.json";
import DataTable from "@/components/DataTable";
import KPICards from "@/components/KPICards";
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';

interface Filters {
    trim: string | null;
    mileage: number | null;
    exteriorColor: string | null;
    interiorColor: string | null;
    transmission: string | null;
    drivetrain: string | null;
    period: 'day' | 'week' | 'month' | 'custom';
    periodCount: number;
    startDate: Date | null;
    endDate: Date | null;
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
    mileage: number | null;
    interior_color: string | null;
    exterior_color: string | null;
    transmission: string | null;
    drivetrain: string | null;
    listing_type: string | null;
}

interface KPIData {
    percentageChange: number;
    totalListings: number;
    averageDaysOnMarket: number;
    averagePrice: number;
}

const initialFilters: Filters = {
    trim: null,
    mileage: null,
    exteriorColor: null,
    interiorColor: null,
    transmission: null,
    drivetrain: null,
    period: 'day',
    periodCount: 7, // Changed to 7 for "last week"
    startDate: null,
    endDate: null,
    listing_type: null,
};

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const searchParams = useSearchParams();

    useEffect(() => {
        // Initialize filters from URL params
        const urlFilters = Object.fromEntries(searchParams.entries());
        setFilters(prevFilters => ({
            ...prevFilters,
            ...urlFilters,
            startDate: urlFilters.startDate ? new Date(urlFilters.startDate) : null,
            endDate: urlFilters.endDate ? new Date(urlFilters.endDate) : null,
        }));
    }, [searchParams]);

    const handleTimeFilterChange = (newPeriod: 'day' | 'week' | 'month', newPeriodCount: number) => {
        const endDate = new Date();
        const startDate = new Date();

        switch (newPeriod) {
            case 'day':
                startDate.setDate(endDate.getDate() - newPeriodCount);
                break;
            case 'week':
                startDate.setDate(endDate.getDate() - newPeriodCount * 7);
                break;
            case 'month':
                startDate.setMonth(endDate.getMonth() - newPeriodCount);
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

    const handleChartTimeSelection = (startDate: Date, endDate: Date) => {
        setFilters(prev => ({
            ...prev,
            startDate,
            endDate,
            period: 'custom',
            periodCount: 0,
        }));
    };

    const removeFilter = (key: keyof Filters) => {
        setFilters(prev => ({ ...prev, [key]: null }));
        if (isModalOpen) {
            setIsModalOpen(false);
            setTimeout(() => setIsModalOpen(true), 0);
        }
    };

    const activeFilters = Object.entries(filters).filter(([key, value]) =>
        value !== null && !['period', 'periodCount', 'startDate', 'endDate'].includes(key)
    );

    useEffect(() => {
        if (!filters.startDate || !filters.endDate) {
            if (filters.period !== 'custom') {
                handleTimeFilterChange(filters.period as 'day' | 'week' | 'month', filters.periodCount);
            }
        }
    }, []);

    const calculateKPIs = (data: CarData[]) => {
        const validPriceData = data.filter(car => car.price !== null && car.price > 0);
        const totalListings = validPriceData.length;
        const totalPrice = validPriceData.reduce((sum, car) => sum + (car.price || 0), 0);
        const averagePrice = totalPrice / totalListings;

        const now = new Date();
        const totalDaysOnMarket = validPriceData.reduce((sum, car) => {
            if (car.date_listed) {
                const listedDate = new Date(car.date_listed);
                const daysOnMarket = (now.getTime() - listedDate.getTime()) / (1000 * 3600 * 24);
                return sum + daysOnMarket;
            }
            return sum;
        }, 0);
        const averageDaysOnMarket = totalDaysOnMarket / totalListings;

        // Calculate percentage change using linear regression
        let percentageChange = 0;
        if (validPriceData.length > 1) {
            // Sort the data by date
            const sortedData = validPriceData.sort((a, b) => {
                return new Date(a.date_listed || '').getTime() - new Date(b.date_listed || '').getTime();
            });

            // Prepare data for linear regression
            const xValues = sortedData.map((car, index) => index);
            const yValues = sortedData.map(car => car.price || 0);

            // Calculate linear regression
            const n = xValues.length;
            const sumX = xValues.reduce((a, b) => a + b, 0);
            const sumY = yValues.reduce((a, b) => a + b, 0);
            const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
            const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // Calculate start and end prices based on the regression line
            const startPrice = intercept;
            const endPrice = slope * (n - 1) + intercept;

            // Calculate percentage change
            percentageChange = ((endPrice - startPrice) / startPrice) * 100;
        }

        setKpiData({
            percentageChange,
            totalListings,
            averageDaysOnMarket,
            averagePrice,
        });
    };

    const filteredData = useMemo(() => {
        return lineChartData.filter(car => {
            const carDate = car.date_listed ? new Date(car.date_listed) : null;
            const isInTimeRange = carDate && filters.startDate && filters.endDate
                ? carDate >= filters.startDate && carDate <= filters.endDate
                : true;

            const matchesColor = (carColor: string | null, filterColor: string | null) =>
                !filterColor || (carColor && carColor.toLowerCase().includes(filterColor.toLowerCase()));

            const matchesListingType = !filters.listing_type || car.listing_type === filters.listing_type;

            const matchesTransmission = !filters.transmission ||
                (car.transmission && car.transmission.toLowerCase().includes(filters.transmission.toLowerCase()));

            return (
                (!filters.trim || car.trim === filters.trim) &&
                (!filters.mileage || (car.mileage !== null && car.mileage <= filters.mileage)) &&
                matchesColor(car.exterior_color, filters.exteriorColor) &&
                matchesColor(car.interior_color, filters.interiorColor) &&
                matchesTransmission &&
                (!filters.drivetrain || car.drivetrain === filters.drivetrain) &&
                matchesListingType &&
                isInTimeRange
            );
        });
    }, [filters, lineChartData]);

    useEffect(() => {
        calculateKPIs(filteredData);
    }, [filteredData]);

    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
    };

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

                    <KPICards {...kpiData} />

                    <div className="mb-6 flex flex-wrap gap-2">
                        {activeFilters.map(([key, value]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm shadow-md transition-all duration-300 ease-in-out"
                                onClick={() => removeFilter(key as keyof Filters)}
                            >
                                {key}: {value} ×
                            </motion.button>
                        ))}
                    </div>

                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-blue-500 text-white text-lg rounded-full transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Open Filters
                        </motion.button>

                        <motion.div whileHover={{ scale: 1.05 }} className="relative">
                            <select
                                className="appearance-none bg-white text-gray-800 border border-gray-300 rounded-full px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md"
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
                                    onTimeSelection={handleChartTimeSelection}
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
                                    onTimeSelection={handleChartTimeSelection}
                                    onDataSelection={() => { }}
                                    startDate={filters.startDate}
                                    endDate={filters.endDate}
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
                                    data={(filteredData as CarData[]) ?? []}
                                    startDate={filters.startDate}
                                    endDate={filters.endDate}
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </main>
            <Footer />
            <FilterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApplyFilters={handleApplyFilters}
                data={lineChartData as CarData[]}
                currentFilters={filters}
            />
        </motion.div>
    );
}