"use client";

import { useState, useEffect } from 'react';
import Footer from "@/components/layout/Footer";
import { LineChartComponent } from "@/components/charts/LineChart";
import { FilterModal } from "@/components/FilterModal";
import lineChartData from "@/data/lineChartData.json";
import DataTable from "@/components/DataTable";

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

    return (
        <div className="min-h-screen w-screen flex flex-col bg-black text-white overflow-hidden">
            <main className="flex-grow flex flex-col p-4 md:p-8 overflow-hidden">
                <div className="bg-gray-900 rounded-xl shadow-2xl p-4 md:p-8 w-full h-full border border-gray-800 flex flex-col overflow-hidden">
                    <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center text-white">
                        Porsche 911 GT3 Sales
                    </h1>

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
                                data={lineChartData}
                                filters={filters}
                                onTimeFilterChange={handleTimeFilterChange}
                                chartType={chartType}
                                onDataSelection={handleDataSelection}
                                onTimeSelection={handleChartTimeSelection}
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                            />
                        </div>

                        <div className="bg-gray-950 rounded-lg p-4 shadow-inner flex-grow overflow-auto">
                            <DataTable data={selectedData.length > 0 ? selectedData : lineChartData} />
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
                currentFilters={filters} // Pass current filters to the modal
            />
        </div>
    );
}