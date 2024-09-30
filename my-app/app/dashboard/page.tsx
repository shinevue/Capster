"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FilterSection } from "@/components/dashboard/FilterSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { DataTableSection } from "@/components/dashboard/DataTableSection";
import defaultData from "@/data/data.json";
import KPICards from "@/components/KPICards";
import { CarData, Filters } from '@/types/CarData';
import { initialFilters, applyFiltersToData } from '@/lib/filterModule';
import { calculateKPIs, calculateKPIComparison, KPIComparison } from '@/lib/chartTransformers';
import { preloadImages } from '@/lib/imageLoader';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            // router.push("/login");
        }
    }, [user, isLoading, router]);

    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [kpiComparison, setKpiComparison] = useState<KPIComparison | null>(null);
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

    // Create a memoized image loader function
    const imageLoader = useCallback((src: string) => preloadedImages[src] || src, [preloadedImages]);

    return (
        <DashboardLayout>
            <FilterSection
                filteredData={filteredData}
                filters={filters}
                handleApplyFilters={handleApplyFilters}
                handleTimeFilterChange={handleTimeFilterChange}
            />

            <div className="mt-5 mb-10">
                {kpiComparison && <KPICards kpiComparison={kpiComparison} />}
            </div>

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
}