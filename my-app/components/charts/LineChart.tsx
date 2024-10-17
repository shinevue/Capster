"use client";

import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useMemo, useState } from "react";
import { CarData } from '@/types/CarData';
import { useMediaQuery } from 'react-responsive'; // Add this import
import { motion } from 'framer-motion';
import { ChartToggleButton } from '@/components/chartToggleButton';
import { FaChartLine, FaListUl, FaShoppingCart } from 'react-icons/fa'; // Updated import

interface LineChartComponentProps {
    data: CarData[];
    startDate: Date | null;
    endDate: Date | null;
}

const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        console.warn(`Invalid date format: ${dateString}`);
        return null;
    }
    const fullYear = year < 100 ? 2000 + year : year;
    // Create the date using UTC to avoid timezone issues
    return new Date(Date.UTC(fullYear, month - 1, day));
};

const formatPrice = (value: number | null | undefined): string =>
    value == null ? 'N/A' : `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const ToggleButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; color: string; }> = ({ label, isActive, onClick, color }) => (
    <motion.button
        onClick={onClick}
        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? `bg-${color}-500 text-white` : 'bg-gray-200 text-gray-700'
            }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        {label}
    </motion.button>
);

export const LineChartComponent: React.FC<LineChartComponentProps> = ({ data, startDate, endDate }) => {
    const [showListedLine, setShowListedLine] = useState(true);
    const [showSoldLine, setShowSoldLine] = useState(true);
    const [show7DayMA, setShow7DayMA] = useState(false);
    const [show30DayMA, setShow30DayMA] = useState(false);

    const { chartData } = useMemo(() => {
        const counts: Record<string, {
            listedCount: number;
            listedTotalPrice: number;
            soldCount: number;
            soldTotalPrice: number;
            minPrice: number;
            maxPrice: number;
            listings: CarData[];
        }> = {};

        data.forEach(car => {
            const listedDate = parseDate(car.date_listed);
            const soldDate = parseDate(car.date_sold);

            if (listedDate) {
                const listedKey = listedDate.toISOString().split('T')[0];
                if (!counts[listedKey]) {
                    counts[listedKey] = { listedCount: 0, listedTotalPrice: 0, soldCount: 0, soldTotalPrice: 0, minPrice: Infinity, maxPrice: -Infinity, listings: [] };
                }
                counts[listedKey].listedCount += 1;
                if (car.price !== null) {
                    counts[listedKey].listedTotalPrice += car.price;
                    counts[listedKey].minPrice = Math.min(counts[listedKey].minPrice, car.price);
                    counts[listedKey].maxPrice = Math.max(counts[listedKey].maxPrice, car.price);
                }
                counts[listedKey].listings.push(car);
            }

            if (soldDate) {
                const soldKey = soldDate.toISOString().split('T')[0];
                if (!counts[soldKey]) {
                    counts[soldKey] = { listedCount: 0, listedTotalPrice: 0, soldCount: 0, soldTotalPrice: 0, minPrice: Infinity, maxPrice: -Infinity, listings: [] };
                }
                counts[soldKey].soldCount += 1;
                if (car.price !== null) {
                    counts[soldKey].soldTotalPrice += car.price;
                }
            }
        });

        const chartData = Object.entries(counts)
            .map(([date, data]) => ({
                date,
                listedCount: data.listedCount,
                soldCount: data.soldCount,
                averageListedPrice: data.listedCount > 0 ? data.listedTotalPrice / data.listedCount : null,
                averageSoldPrice: data.soldCount > 0 ? data.soldTotalPrice / data.soldCount : null,
                minPrice: data.minPrice !== Infinity ? data.minPrice : null,
                maxPrice: data.maxPrice !== -Infinity ? data.maxPrice : null,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate moving averages (update this to include both listed and sold prices)
        const calculateMA = (data: any[], days: number) => {
            return data.map((entry, index, array) => {
                const start = Math.max(0, index - days + 1);
                const end = index + 1;
                const slice = array.slice(start, end);
                const listedSum = slice.reduce((acc, curr) => acc + (curr.averageListedPrice || 0), 0);
                const soldSum = slice.reduce((acc, curr) => acc + (curr.averageSoldPrice || 0), 0);
                return {
                    ...entry,
                    [`listedMa${days}`]: slice.length > 0 ? listedSum / slice.length : null,
                    [`soldMa${days}`]: slice.length > 0 ? soldSum / slice.length : null
                };
            });
        };

        const dataWithMA = calculateMA(calculateMA(chartData, 7), 30);

        return {
            chartData: dataWithMA,
            entriesInTimeRange: data.length,
            totalEntries: data.length
        };
    }, [data]);

    const isDataSuitable = useMemo(() => {
        const validDataPoints = chartData.filter(entry => entry.averageListedPrice !== null || entry.averageSoldPrice !== null);
        return validDataPoints.length > 0;
    }, [chartData]);

    const formatXAxis = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatYAxis = (value: number) => formatPrice(value);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isMobile = useMediaQuery({ maxWidth: 767 });

            if (isMobile) {
                return (
                    <div className="custom-tooltip bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-xs dark:text-black">
                        <p className="label font-bold">{formatXAxis(label)}</p>
                        {showListedLine && (
                            <p>{`Listed Avg: ${formatPrice(data.averageListedPrice)}`}</p>
                        )}
                        {showSoldLine && (
                            <p>{`Sold Avg: ${formatPrice(data.averageSoldPrice)}`}</p>
                        )}
                        <p>{`Listed: ${data.listedCount}, Sold: ${data.soldCount}`}</p>
                        {show7DayMA && (
                            <>
                                <p>{`Listed 7D MA: ${formatPrice(data.listedMa7)}`}</p>
                                <p>{`Sold 7D MA: ${formatPrice(data.soldMa7)}`}</p>
                            </>
                        )}
                        {show30DayMA && (
                            <>
                                <p>{`Listed 30D MA: ${formatPrice(data.listedMa30)}`}</p>
                                <p>{`Sold 30D MA: ${formatPrice(data.soldMa30)}`}</p>
                            </>
                        )}
                    </div>
                );
            }

            return (
                <div className="custom-tooltip bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="label text-gray-700 font-bold mb-2">{`Date: ${label}`}</p>
                    {showListedLine && (
                        <p className="value text-gray-900">{`Average Listed Price: ${formatPrice(data.averageListedPrice)}`}</p>
                    )}
                    {showSoldLine && (
                        <p className="value text-gray-900">{`Average Sold Price: ${formatPrice(data.averageSoldPrice)}`}</p>
                    )}
                    <p className="count text-gray-600">{`Listed: ${data.listedCount}, Sold: ${data.soldCount}`}</p>
                    <p className="min-price text-gray-600">{`Min Price: ${formatPrice(data.minPrice)}`}</p>
                    <p className="max-price text-gray-600">{`Max Price: ${formatPrice(data.maxPrice)}`}</p>
                    {show7DayMA && (
                        <>
                            <p className="ma7 text-gray-600">{`Listed 7-Day MA: ${formatPrice(data.listedMa7)}`}</p>
                            <p className="ma7 text-gray-600">{`Sold 7-Day MA: ${formatPrice(data.soldMa7)}`}</p>
                        </>
                    )}
                    {show30DayMA && (
                        <>
                            <p className="ma30 text-gray-600">{`Listed 30-Day MA: ${formatPrice(data.listedMa30)}`}</p>
                            <p className="ma30 text-gray-600">{`Sold 30-Day MA: ${formatPrice(data.soldMa30)}`}</p>
                        </>
                    )}
                </div>
            );
        }
        return null;
    };

    const isMobile = useMediaQuery({ maxWidth: 767 });

    if (!isDataSuitable) {
        return (
            <div className="flex items-center justify-center h-[200px] bg-gray-100 rounded-lg">
                <p className="text-gray-300 text-2xl">
                    Not enough data to display the chart. Please adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            <div className="mb-4 flex flex-wrap gap-1 md:gap-2">
                <ChartToggleButton
                    icon={<FaListUl />}
                    label="Listed"
                    isActive={showListedLine}
                    onClick={() => setShowListedLine(!showListedLine)}
                    color="bg-blue-500"
                />
                <ChartToggleButton
                    icon={<FaShoppingCart />}
                    label="Sold"
                    isActive={showSoldLine}
                    onClick={() => setShowSoldLine(!showSoldLine)}
                    color="bg-red-500"
                />
                <ChartToggleButton
                    icon={<FaChartLine />}
                    label="7-Day MA"
                    isActive={show7DayMA}
                    onClick={() => setShow7DayMA(!show7DayMA)}
                    color="bg-green-500"
                />
                <ChartToggleButton
                    icon={<FaChartLine />}
                    label="30-Day MA"
                    isActive={show30DayMA}
                    onClick={() => setShow30DayMA(!show30DayMA)}
                    color="bg-yellow-500"
                />
            </div>
            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={isMobile ? { top: 20, right: 10, left: 0, bottom: 20 } : { top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                        <XAxis
                            dataKey="date"
                            stroke="#555555"
                            fontSize={isMobile ? 10 : 14}
                            tickLine={false}
                            axisLine={false}
                            padding={{ left: isMobile ? 0 : 30, right: isMobile ? 0 : 30 }}
                            tickFormatter={formatXAxis}
                            interval="preserveStartEnd"
                            minTickGap={isMobile ? 30 : 50}
                        />
                        <YAxis
                            stroke="#555555"
                            fontSize={isMobile ? 10 : 14}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: `${isMobile ? "" : "Average Price"}`, angle: -90, position: 'insideLeft', fill: '#555555', fontSize: 16 }}
                            padding={{ top: 20, bottom: 20 }}
                            tickFormatter={formatYAxis}
                            tick={{
                                textAnchor: 'end',
                                angle: -45,
                                dx: -10,
                            } as any}
                            width={isMobile ? 50 : 100}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {showListedLine && (
                            <Line
                                type="monotone"
                                dataKey="averageListedPrice"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 5, strokeWidth: 2 }}
                                activeDot={{ r: 9, strokeWidth: 0 }}
                                name="Average Listed Price"
                            />
                        )}
                        {showSoldLine && (
                            <Line
                                type="monotone"
                                dataKey="averageSoldPrice"
                                stroke="#ef4444"
                                strokeWidth={3}
                                dot={{ r: 5, strokeWidth: 2 }}
                                activeDot={{ r: 9, strokeWidth: 0 }}
                                name="Average Sold Price"
                            />
                        )}
                        {show7DayMA && (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="listedMa7"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Listed 7-Day MA"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="soldMa7"
                                    stroke="#14b8a6"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Sold 7-Day MA"
                                />
                            </>
                        )}
                        {show30DayMA && (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="listedMa30"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Listed 30-Day MA"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="soldMa30"
                                    stroke="#d97706"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Sold 30-Day MA"
                                />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};