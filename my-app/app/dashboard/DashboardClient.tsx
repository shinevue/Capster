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
import { fetchAdditionalCarData } from '@/lib/carData';

interface DashboardClientProps {
    initialCarData: CarData[];
}

export default function DashboardClient({ initialCarData }: DashboardClientProps) {
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
    const [carData, setCarData] = useState<CarData[]>(initialCarData);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);

    const fetchMoreData = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const newData = await fetchAdditionalCarData(page);
            if (newData.length > 0) {
                setCarData(prevData => [...prevData, ...newData]);
                setPage(prevPage => prevPage + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching additional data:', error);
            setHasMore(false);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore]);

    useEffect(() => {
        if (hasMore && !isLoadingMore) {
            fetchMoreData();
        }
    }, [fetchMoreData, hasMore, isLoadingMore]);

    useEffect(() => {
        // Fetch more data when initial data is loaded
        if (carData.length === initialCarData.length) {
            fetchMoreData();
        }
    }, [carData.length, initialCarData.length, fetchMoreData]);

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

            console.log("Updated KPI Comparison", comparison);
            setKpiComparison(comparison);
        } else {
            setKpiComparison(null);
        }

        // Preload images for the filtered data
        preloadImages(filteredData).then(setPreloadedImages);
    }, [filters, filteredData, carData]);

    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
    };

    // Create a memoized image loader function
    const imageLoader = useCallback((src: string) => preloadedImages[src] || src, [preloadedImages]);

    const topFilters: (keyof Filters)[] = ['make', 'model', 'trim', 'year'];

    return (
        <DashboardLayout>
            <FilterGrid
                data={filteredData}
                currentFilters={filters}
                onApplyFilters={handleApplyFilters}
                includedFilters={topFilters}
            />

            <div className="mt-5 mb-10">
                {kpiComparison && <KPICards kpiComparison={kpiComparison} />}
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

            {hasMore && <div ref={loaderRef} style={{ height: '20px' }}></div>}
        </DashboardLayout>
    );
}
