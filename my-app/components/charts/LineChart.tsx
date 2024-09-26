"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";

interface CarData {
    source: string;
    date_listed: string | null;
    year: string;
    make: string;
    model: string;
    trim: string | null;
    price: number | null;
    mileage: number;
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

// Add this function at the top of your file
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Add this function at the top of your file, outside the component
function parseDate(dateString: string): Date | null {
    const [month, day, year] = dateString.split('-').map(Number);
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        console.warn(`Invalid date format: ${dateString}`);
        return null;
    }
    // Assume 21st century if year is two digits
    const fullYear = year < 100 ? 2000 + year : year;
    return new Date(fullYear, month - 1, day);
}

// Add this helper function at the top of your file
function formatPrice(value: number): string {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function LineChartComponent({ data, onDataSelection, onTimeSelection, startDate, endDate }: LineChartComponentProps) {
    const { chartData, entriesInTimeRange, totalEntries } = useMemo(() => {
        const counts: { [key: string]: { count: number; totalPrice: number; listings: CarData[]; }; } = {};

        data.forEach(car => {
            const date = parseDate(car.date_listed);
            if (!date) return; // Skip if date is invalid

            let key = formatDate(date);

            if (!counts[key]) {
                counts[key] = { count: 0, totalPrice: 0, listings: [] };
            }
            counts[key].count += 1;
            if (car.price !== null) {
                counts[key].totalPrice += car.price;
            }
            counts[key].listings.push(car);
        });

        const chartData = Object.entries(counts)
            .map(([date, data]) => ({
                date,
                count: data.count,
                averagePrice: data.count > 0 ? data.totalPrice / data.count : 0,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            chartData,
            entriesInTimeRange: data.length,
            totalEntries: data.length
        };
    }, [data]);

    const formatYAxis = (value: number) => {
        return formatPrice(value);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
                    <p className="label text-gray-300">{`Date: ${label}`}</p>
                    <p className="value text-white">{`Average Price: ${formatPrice(payload[0].value)}`}</p>
                    <p className="count text-gray-400">{`Listings: ${payload[0].payload.count}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative">
            <div className="absolute top-0 right-0 bg-white bg-opacity-75 p-2 rounded text-md text-black">
                {entriesInTimeRange} / {totalEntries} entries
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        padding={{ left: 30, right: 30 }}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Average Price', angle: -90, position: 'insideLeft', fill: '#888888', fontSize: 14 }}
                        padding={{ top: 20, bottom: 20 }}
                        tickFormatter={formatYAxis}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="averagePrice"
                        stroke="#8884d8"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}