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
import { fetchCarDataByFilters, fetchFilteredUniqueValues, fetchUniqueFilterValues } from '@/lib/carData';

export default function DashboardClient() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthLoading && !user) {
            // router.push("/login");
        }
    }, [user, isAuthLoading, router]);

    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [kpiComparison, setKpiComparison] = useState<KPIComparison | null>(null);
    const [preloadedImages, setPreloadedImages] = useState<{ [key: string]: string; }>({});
    const [carData, setCarData] = useState<CarData[]>([]);
    const [searchParams, setSearchParams] = useState({
        make: '',
        model: '',
        trim: '',
        year: '',
    });
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

    useEffect(() => {
        // Initialize with the default option (Last week)
        handleTimeFilterChange(filters?.period, filters?.periodCount);
    }, []);


    useEffect(() => {
        async function loadInitialUniqueFilterValues() {
            try {
                const values = await fetchUniqueFilterValues();
                setUniqueFilterValues(values);
            } catch (error) {
                console.error('Error loading initial unique filter values:', error);
            }
        }

        loadInitialUniqueFilterValues();
    }, []);

    const handleSearch = async (newFilters: Filters) => {
        setIsLoading(true);
        try {
            const { make, model, trim, year } = newFilters;
            const data = await fetchCarDataByFilters(
                make || '',
                model || '',
                trim || '',
                year ? parseInt(year.toString()) : null
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
                make: currentFilters.make || null,
                model: currentFilters.model || null,
                trim: currentFilters.trim || null,
                year: currentFilters.year ? parseInt(currentFilters.year.toString()) : null,
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
            setKpiComparison(null);
        }

        // Preload images for the filtered data
        preloadImages(filteredData).then(setPreloadedImages);
    }, [filters, filteredData, carData]);

    const imageLoader = useCallback((src: string) => preloadedImages[src] || src, [preloadedImages]);

    const topFilters: (keyof Filters)[] = ['make', 'model', 'trim', 'year'];

    const handleSubmit = () => {
        handleSearch(filters);
    };

    const handleApplyFilters = (newFilters: Filters) => {
        handleFilterChange(newFilters);
        handleSearch(newFilters);
    };

    return (
        <DashboardLayout>
            <FilterGrid
                data={filteredData}
                currentFilters={filters}
                handleFilterChange={handleFilterChange}
                handleSubmit={handleSubmit}
                includedFilters={topFilters}
                isLoading={isLoading}
                uniqueFilterValues={uniqueFilterValues}
            />

            <div className="mt-5 mb-10">
                {kpiComparison && <KPICards kpiComparison={kpiComparison} hasMore={false} />}
            </div>

            <FilterSection
                filteredData={filteredData}
                filters={filters}
                handleApplyFilters={handleApplyFilters}
                handleTimeFilterChange={handleTimeFilterChange}
            />

            <ChartSection
                filteredData={filteredData}
                filters={filters}
                imageLoader={imageLoader}
            />

            <DataTableSection
                filteredData={filteredData}
                imageLoader={imageLoader}
                showDataTable={true}
            />
        </DashboardLayout>
    );
};
