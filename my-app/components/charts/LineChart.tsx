"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMemo } from "react";

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

export const LineChartComponent = ({ data, onDataSelection, onTimeSelection, startDate, endDate }: LineChartComponentProps) => {
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

        return {
            chartData,
            entriesInTimeRange: data.length,
            totalEntries: data.length
        };
    }, [data]);

    // Check if the data is suitable for graphing
    const isDataSuitable = chartData.length > 1 && chartData.some(entry => entry.averagePrice !== null);

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
                    <p className="value text-gray-900">{`Average Price: ${formatPrice(data.averagePrice)}`}</p>
                    <p className="count text-gray-600">{`Listings: ${data.count}`}</p>
                    <p className="min-price text-gray-600">{`Min Price: ${formatPrice(data.minPrice)}`}</p>
                    <p className="max-price text-gray-600">{`Max Price: ${formatPrice(data.maxPrice)}`}</p>
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
            <div className="absolute top-0 right-0 bg-white bg-opacity-75 p-2 rounded text-lg text-black">
                {entriesInTimeRange} / {totalEntries} entries
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
                    <Line
                        type="monotone"
                        dataKey="averagePrice"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 5, strokeWidth: 2 }}
                        activeDot={{ r: 9, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};