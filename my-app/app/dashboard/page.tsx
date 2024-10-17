"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FilterSection } from "@/components/dashboard/FilterSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { DataTableSection } from "@/components/dashboard/DataTableSection";
import KPICards from "@/components/KPICards";
import { CarData, Filters } from '@/types/CarData';
import { initialFilters, applyFiltersToData } from '@/lib/filterModule';
import { calculateKPIs, calculateKPIComparison, KPIComparison } from '@/lib/chartTransformers';
import { preloadImages } from '@/lib/imageLoader';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from "next/navigation";
import { FilterGrid } from '@/components/FilterGrid';
import { LineChartComponent } from "@/components/charts/LineChart";
import { ScatterChartComponent } from "@/components/charts/ScatterChart";
import { fetchCarDataByFilters, fetchFilteredUniqueValues, fetchUniqueFilterValues } from '@/lib/carData';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

export default function Dashboard() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const isMobile = useMediaQuery({ maxWidth: 767 });

    useEffect(() => {
        if (!isAuthLoading && !user) {
            // router.push("/login");
        }
    }, [user, isAuthLoading, router]);

    const default_kpiComparison = {
        "current": {
            "percentageChange": 0,
            "totalListings": 0,
            "averageDaysOnMarket": 0,
            "averagePrice": 0
        },
        "previous": {
            "percentageChange": 0,
            "totalListings": 0,
            "averageDaysOnMarket": 0,
            "averagePrice": 0
        },
        "changes": {
            "percentageChange": 0,
            "totalListings": 0,
            "averageDaysOnMarket": 0,
            "averagePrice": 0
        }
    };

    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [kpiComparison, setKpiComparison] = useState<KPIComparison | null>(default_kpiComparison);
    const [preloadedImages, setPreloadedImages] = useState<{ [key: string]: string; }>({});
    const [carData, setCarData] = useState<CarData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uniqueFilterValues, setUniqueFilterValues] = useState<{ make: string[], model: string[], trim: string[], year: number[]; }>({
        make: [],
        model: [],
        trim: [],
        year: [],
    });

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

    async function loadInitialUniqueFilterValues() {
        try {
            const values = await fetchUniqueFilterValues();
            setUniqueFilterValues(values);
        } catch (error) {
            console.error('Error loading initial unique filter values:', error);
        }
    }

    useEffect(() => {
        // Initialize with the default option (Last week)
        handleTimeFilterChange(filters?.period, filters?.periodCount);
    }, []);

    useEffect(() => {
        loadInitialUniqueFilterValues();
    }, []);

    const handleSearch = async (newFilters: Filters) => {
        setIsLoading(true);
        try {
            const { make, model, trim, year } = newFilters;

            const data = await fetchCarDataByFilters(
                make ? make : null,
                model ? model : null,
                trim ? trim : null,
                year ? year.map(y => parseInt(y.toString())) : null
            );
            setCarData(data);
            setFilters(newFilters);
        } catch (error) {
            console.error('Error fetching car data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUniqueFilterValues = async (currentFilters: Filters) => {
        try {
            const values = await fetchFilteredUniqueValues({
                make: currentFilters.make || [],
                model: currentFilters.model || [],
                trim: currentFilters.trim || [],
                year: currentFilters?.year ? currentFilters.year.map(y => parseInt(y.toString())) : [],
            });
            setUniqueFilterValues(values);
        } catch (error) {
            console.error('Error updating unique filter values:', error);
        }
    };

    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters);
        updateUniqueFilterValues(newFilters);
    };

    const filteredData = useMemo(() => {
        const filtered = applyFiltersToData(carData, filters);
        return filtered;
    }, [filters, carData]);

    useEffect(() => {
        const currentKPIs = calculateKPIs(filteredData);

        if (filters.startDate && filters.endDate) {
            const previousPeriodStart = new Date(filters.startDate.getTime() - (filters.endDate.getTime() - filters.startDate.getTime()));
            const previousPeriodEnd = new Date(filters.startDate);
            const previousPeriodData = applyFiltersToData(carData, { ...filters, startDate: previousPeriodStart, endDate: previousPeriodEnd });
            const previousKPIs = calculateKPIs(previousPeriodData);
            const comparison = calculateKPIComparison(currentKPIs, previousKPIs);
            setKpiComparison(comparison);
        } else {
            setKpiComparison(default_kpiComparison);
        }

        // Preload images for the filtered data
        preloadImages(filteredData).then(setPreloadedImages);
    }, [filters, filteredData, carData]);

    const imageLoader = useCallback((src: string) => preloadedImages[src] || src, [preloadedImages]);

    const topFilters: (keyof Filters)[] = ['year', 'make', 'model', 'trim'];

    const handleSubmit = () => {
        handleSearch(filters);
    };

    const handleApplyFilters = (newFilters: Filters) => {
        handleFilterChange(newFilters);
        handleSearch(newFilters);
    };

    const handleResetFilters = useCallback(() => {
        loadInitialUniqueFilterValues();

        setFilters(initialFilters);
        setCarData([]);
        // updateUniqueFilterValues(initialFilters);
    }, []);

    return (
        <DashboardLayout>
            <div className="flex md:flex-row flex-col justify-between align-center items-center mb-4 bg-white p-6 rounded-md">
                <FilterGrid
                    data={filteredData}
                    currentFilters={filters}
                    handleFilterChange={handleFilterChange}
                    handleSubmit={handleSubmit}
                    handleResetFilters={handleResetFilters}
                    includedFilters={topFilters}
                    isLoading={isLoading}
                    uniqueFilterValues={uniqueFilterValues}
                />
            </div>

            <div className='mb-10 bg-white p-6 rounded-md'>
                <FilterSection
                    filteredData={filteredData}
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    handleApplyFilters={handleApplyFilters}
                    handleTimeFilterChange={handleTimeFilterChange}
                />
            </div>

            <div className="mb-4">
                {kpiComparison && <KPICards kpiComparison={kpiComparison} hasMore={false} kpiTitle={{title1: "% Change",title2: "Average Sale",title3: "Lowest Sale",title4: "Highest Sale",}}/>}
            </div>

            <div className="mb-16"  >
                <div className="flex flex-col space-y-20  px-1 md:px-0">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className={`bg-white dark:bg-gray-800 rounded-sm shadow-md ${isMobile ? "w-full" : "p-6"}`}
                    >
                        <LineChartComponent
                            data={filteredData}
                            onTimeSelection={() => { }}
                            onDataSelection={() => { }}
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                        />
                    </motion.div>
                </div>
            </div>

            <div className="mb-4">
                {kpiComparison && <KPICards kpiComparison={kpiComparison} hasMore={false} kpiTitle={{title1: "% Change",title2: "Avg Price",title3: "Total Listings",title4: "Avg Days on Market",}} />}
            </div>

            <div className="mb-16"  >
                <div className="flex flex-col gap-4 px-1 md:px-0">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className={`bg-white dark:bg-gray-800 rounded-sm shadow-md ${isMobile ? "w-full" : "p-6"}`}
                    >
                        <LineChartComponent
                            data={filteredData}
                            onTimeSelection={() => { }}
                            onDataSelection={() => { }}
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className={`bg-white dark:bg-gray-800 rounded-sm shadow-md ${isMobile ? "w-full" : "p-6"}`}
                    >
                        <ScatterChartComponent
                            data={filteredData}
                            onTimeSelection={() => { }}
                            onDataSelection={() => { }}
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            imageLoader={imageLoader}
                        />
                    </motion.div>
                </div>

            </div>

            <DataTableSection
                filteredData={filteredData}
                imageLoader={imageLoader}
                showDataTable={true}
            />
        </DashboardLayout>
    );
};
