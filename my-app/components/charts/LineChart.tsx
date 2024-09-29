"use client";

import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useMemo, useState } from "react";
import { Switch } from '@headlessui/react';
import { CarData } from '@/types/CarData';

interface LineChartComponentProps {
    data: CarData[];
    onDataSelection: (data: CarData[]) => void;
    onTimeSelection: (startDate: Date, endDate: Date) => void;
    startDate: Date | null;
    endDate: Date | null;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const parseDate = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    const [month, day, year] = dateString.split('-').map(Number);
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        console.warn(`Invalid date format: ${dateString}`);
        return null;
    }
    const fullYear = year < 100 ? 2000 + year : year;
    // Create the date using UTC to avoid timezone issues
    return new Date(Date.UTC(fullYear, month - 1, day));
};

const formatPrice = (value: number | null | undefined): string =>
    value == null ? 'N/A' : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const LineChartComponent: React.FC<LineChartComponentProps> = ({ data, onDataSelection, onTimeSelection, startDate, endDate }) => {
    const [showMainLine, setShowMainLine] = useState(true);
    const [show7DayMA, setShow7DayMA] = useState(false);
    const [show30DayMA, setShow30DayMA] = useState(false);

    const { chartData, entriesInTimeRange, totalEntries } = useMemo(() => {
        const counts: Record<string, { count: number; totalPrice: number; minPrice: number; maxPrice: number; listings: CarData[]; }> = {};

        data.forEach(car => {
            const date = parseDate(car.date_listed);
            if (!date) return;

            // Use toISOString and split to get YYYY-MM-DD format
            const key = date.toISOString().split('T')[0];

            if (!counts[key]) {
                counts[key] = { count: 0, totalPrice: 0, minPrice: Infinity, maxPrice: -Infinity, listings: [] };
            }
            counts[key].count += 1;
            if (car.price !== null) {
                counts[key].totalPrice += car.price;
                counts[key].minPrice = Math.min(counts[key].minPrice, car.price);
                counts[key].maxPrice = Math.max(counts[key].maxPrice, car.price);
            }
            counts[key].listings.push(car);
        });

        const chartData = Object.entries(counts)
            .map(([date, data]) => ({
                date,
                count: data.count,
                averagePrice: data.count > 0 ? data.totalPrice / data.count : null,
                minPrice: data.minPrice !== Infinity ? data.minPrice : null,
                maxPrice: data.maxPrice !== -Infinity ? data.maxPrice : null,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate moving averages
        const calculateMA = (data: any[], days: number) => {
            return data.map((entry, index, array) => {
                const start = Math.max(0, index - days + 1);
                const end = index + 1;
                const slice = array.slice(start, end);
                const sum = slice.reduce((acc, curr) => acc + (curr.averagePrice || 0), 0);
                return {
                    ...entry,
                    [`ma${days}`]: slice.length > 0 ? sum / slice.length : null
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
        const validDataPoints = chartData.filter(entry => entry.averagePrice !== null);
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
            return (
                <div className="custom-tooltip bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="label text-gray-700 font-bold mb-2">{`Date: ${label}`}</p>
                    {showMainLine && (
                        <p className="value text-gray-900">{`Average Price: ${formatPrice(data.averagePrice)}`}</p>
                    )}
                    <p className="count text-gray-600">{`Listings: ${data.count}`}</p>
                    <p className="min-price text-gray-600">{`Min Price: ${formatPrice(data.minPrice)}`}</p>
                    <p className="max-price text-gray-600">{`Max Price: ${formatPrice(data.maxPrice)}`}</p>
                    {show7DayMA && data.ma7 !== null && (
                        <p className="ma7 text-gray-600">{`7-Day MA: ${formatPrice(data.ma7)}`}</p>
                    )}
                    {show30DayMA && data.ma30 !== null && (
                        <p className="ma30 text-gray-600">{`30-Day MA: ${formatPrice(data.ma30)}`}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (!isDataSuitable) {
        return (
            <div className="flex items-center justify-center h-[200px] bg-gray-100 rounded-lg">
                <p className="text-gray-300 text-4xl">
                    Not enough data to display the chart. Please adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="mb-4 flex space-x-4">
                <Switch.Group>
                    <div className="flex items-center">
                        <Switch.Label className="mr-2">Main Line</Switch.Label>
                        <Switch
                            checked={showMainLine}
                            onChange={setShowMainLine}
                            className={`${showMainLine ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                            <span className={`${showMainLine ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </Switch>
                    </div>
                </Switch.Group>
                <Switch.Group>
                    <div className="flex items-center">
                        <Switch.Label className="mr-2">7-Day MA</Switch.Label>
                        <Switch
                            checked={show7DayMA}
                            onChange={setShow7DayMA}
                            className={`${show7DayMA ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                            <span className={`${show7DayMA ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </Switch>
                    </div>
                </Switch.Group>
                <Switch.Group>
                    <div className="flex items-center">
                        <Switch.Label className="mr-2">30-Day MA</Switch.Label>
                        <Switch
                            checked={show30DayMA}
                            onChange={setShow30DayMA}
                            className={`${show30DayMA ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                            <span className={`${show30DayMA ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </Switch>
                    </div>
                </Switch.Group>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                    <XAxis
                        dataKey="date"
                        stroke="#555555"
                        fontSize={14}
                        tickLine={false}
                        axisLine={false}
                        padding={{ left: 30, right: 30 }}
                        tickFormatter={formatXAxis}
                        interval="preserveStartEnd"
                        minTickGap={50}
                    />
                    <YAxis
                        stroke="#555555"
                        fontSize={14}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Average Price', angle: -90, position: 'insideLeft', fill: '#555555', fontSize: 16 }}
                        padding={{ top: 20, bottom: 20 }}
                        tickFormatter={formatYAxis}
                        tick={{ textAnchor: 'end' }}
                        width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {showMainLine && (
                        <Line
                            type="monotone"
                            dataKey="averagePrice"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 5, strokeWidth: 2 }}
                            activeDot={{ r: 9, strokeWidth: 0 }}
                            name="Average Price"
                        />
                    )}
                    {show7DayMA && (
                        <Line
                            type="monotone"
                            dataKey="ma7"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            name="7-Day MA"
                        />
                    )}
                    {show30DayMA && (
                        <Line
                            type="monotone"
                            dataKey="ma30"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            name="30-Day MA"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};