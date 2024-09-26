"use client";

import { useState, useEffect, useMemo } from 'react';
import Footer from "@/components/layout/Footer";
import { LineChartComponent } from "@/components/charts/LineChart";
import { FilterModal } from "@/components/FilterModal";
import lineChartData from "@/data/lineChartData.json";
import DataTable from "@/components/DataTable";
import KPICards from "@/components/KPICards";

interface Filters {
    trim: string | null;
    mileage: number | null;
    exteriorColor: string | null;
    interiorColor: string | null;
    transmission: string | null;
    drivetrain: string | null;
    period: 'day' | 'week' | 'month';
    periodCount: number;
    startDate: Date | null;
    endDate: Date | null;
}

type ChartType = '$ Change' | 'Total Listings' | 'Average days on market' | 'Average price';

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
}

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        trim: null,
        mileage: null,
        exteriorColor: null,
        interiorColor: null,
        transmission: null,
        drivetrain: null,
        period: 'day',
        periodCount: 30,
        startDate: null,
        endDate: null,
    });
    const [chartType, setChartType] = useState<ChartType>('$ Change');
    const [selectedData, setSelectedData] = useState<CarData[]>([]);
    const [kpiData, setKpiData] = useState({
        dollarChange: 0,
        totalListings: 0,
        averageDaysOnMarket: 0,
        averagePrice: 0,
    });

    const handleTimeFilterChange = (newPeriod: 'day' | 'week' | 'month', newPeriodCount: number) => {
        const endDate = new Date();
        let startDate = new Date();

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

    const handleDataSelection = (data: CarData[]) => {
        setSelectedData(data);
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
        // Force the modal to update its internal state
        if (isModalOpen) {
            setIsModalOpen(false);
            setTimeout(() => setIsModalOpen(true), 0);
        }
    };

    const activeFilters = Object.entries(filters).filter(([key, value]) =>
        value !== null && key !== 'period' && key !== 'periodCount' && key !== 'startDate' && key !== 'endDate'
    );

    // Initialize time range if not set
    useEffect(() => {
        if (!filters.startDate || !filters.endDate) {
            handleTimeFilterChange(filters.period, filters.periodCount);
        }
    }, []);

    // Function to calculate KPIs based on filtered data
    const calculateKPIs = (data: CarData[]) => {
        console.log('Calculating KPIs for filtered data:', data);

        const totalListings = data.length;
        console.log('Total Listings:', totalListings);

        const totalPrice = data.reduce((sum, car) => sum + (car.price || 0), 0);
        const averagePrice = totalPrice / totalListings;
        console.log('Total Price:', totalPrice);
        console.log('Average Price:', averagePrice);

        // Calculate average days on market
        const now = new Date();
        const totalDaysOnMarket = data.reduce((sum, car) => {
            if (car.date_listed) {
                const listedDate = new Date(car.date_listed);
                const daysOnMarket = (now.getTime() - listedDate.getTime()) / (1000 * 3600 * 24);
                console.log(`Car listed on ${car.date_listed} has been on market for ${daysOnMarket.toFixed(2)} days`);
                return sum + daysOnMarket;
            }
            return sum;
        }, 0);
        const averageDaysOnMarket = totalDaysOnMarket / totalListings;
        console.log('Total Days on Market:', totalDaysOnMarket);
        console.log('Average Days on Market:', averageDaysOnMarket);

        // Calculate dollar change (assuming the first and last entries represent the change)
        let dollarChange = 0;
        if (data.length > 1) {
            const firstPrice = data[0].price || 0;
            const lastPrice = data[data.length - 1].price || 0;
            dollarChange = lastPrice - firstPrice;
            console.log('First Price:', firstPrice);
            console.log('Last Price:', lastPrice);
            console.log('Dollar Change:', dollarChange);
        } else {
            console.log('Not enough data to calculate dollar change');
        }

        setKpiData({
            dollarChange,
            totalListings,
            averageDaysOnMarket,
            averagePrice,
        });

        console.log('Final KPI Data:', {
            dollarChange,
            totalListings,
            averageDaysOnMarket,
            averagePrice,
        });
    };

    // New memoized filtered data
    const filteredData = useMemo(() => {
        return lineChartData.filter(car => {
            const carDate = car.date_listed ? new Date(car.date_listed) : null;
            const isInTimeRange = carDate && filters.startDate && filters.endDate
                ? carDate >= filters.startDate && carDate <= filters.endDate
                : true;

            const matchesColor = (carColor: string | null, filterColor: string | null) => {
                if (!filterColor || !carColor) return true;
                return carColor.toLowerCase().includes(filterColor.toLowerCase());
            };

            return (
                (!filters.trim || car.trim === filters.trim) &&
                (!filters.mileage || (car.mileage !== null && car.mileage <= filters.mileage)) &&
                matchesColor(car.exterior_color, filters.exteriorColor) &&
                matchesColor(car.interior_color, filters.interiorColor) &&
                (!filters.transmission || car.transmission === filters.transmission) &&
                (!filters.drivetrain || car.drivetrain === filters.drivetrain) &&
                isInTimeRange
            );
        });
    }, [filters]);

    // Update KPIs when filtered data changes
    useEffect(() => {
        calculateKPIs(filteredData);
    }, [filteredData]);

    return (
        <div className="min-h-screen w-screen flex flex-col bg-black text-white overflow-hidden">
            <main className="flex-grow flex flex-col p-4 md:p-8 overflow-hidden">
                <div className="bg-gray-900 rounded-xl shadow-2xl p-4 md:p-8 w-full h-full border border-gray-800 flex flex-col overflow-hidden">
                    <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center text-white">
                        Porsche 911 GT3 Sales
                    </h1>

                    <KPICards
                        dollarChange={kpiData.dollarChange}
                        totalListings={kpiData.totalListings}
                        averageDaysOnMarket={kpiData.averageDaysOnMarket}
                        averagePrice={kpiData.averagePrice}
                    />

                    <div className="mb-4 flex flex-wrap gap-2">
                        {activeFilters.map(([key, value]) => (
                            <button
                                key={key}
                                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                                onClick={() => removeFilter(key as keyof Filters)}
                            >
                                {key}: {value} ×
                            </button>
                        ))}
                    </div>

                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            className="px-6 py-3 bg-white text-black text-base md:text-lg rounded-full transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Open Filters
                        </button>

                        <div className="flex items-center space-x-2">
                            <select
                                className="bg-gray-800 text-white rounded-md px-3 py-2"
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
                                {/* Add more options as needed */}
                            </select>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {(['$ Change', 'Total Listings', 'Average days on market', 'Average price'] as const).map((type) => (
                                <button
                                    key={type}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out ${chartType === type
                                        ? 'bg-white text-black'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    onClick={() => setChartType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6 overflow-hidden">
                        <div className="bg-gray-950 rounded-lg p-4 shadow-inner">
                            <LineChartComponent
                                data={filteredData}
                                chartType={chartType}
                                onDataSelection={handleDataSelection}
                                onTimeSelection={handleChartTimeSelection}
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                            />
                        </div>

                        <div className="bg-gray-950 rounded-lg p-4 shadow-inner flex-grow overflow-auto">
                            <DataTable
                                data={selectedData.length > 0 ? selectedData : filteredData}
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                            />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <FilterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApplyFilters={setFilters}
                data={lineChartData}
                currentFilters={filters}
            />
        </div>
    );
}