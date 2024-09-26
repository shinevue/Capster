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
    filters: {
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
    };
    onTimeFilterChange: (period: 'day' | 'week' | 'month', periodCount: number) => void;
    chartType: '$ Change' | 'Total Listings' | 'Average days on market' | 'Average price';
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

export function LineChartComponent({ data, filters, onTimeFilterChange, chartType, onDataSelection, onTimeSelection, startDate, endDate }: LineChartComponentProps) {
    const [localPeriod, setLocalPeriod] = useState(filters.period);
    const [localPeriodCount, setLocalPeriodCount] = useState(filters.periodCount);

    const { filteredData, chartData, entriesInTimeRange, totalEntries } = useMemo(() => {
        const filteredData = data.filter(car => {
            const matchesColor = (carColor: string | null, filterColor: string | null) => {
                if (!filterColor || !carColor) return true;
                return carColor.toLowerCase().includes(filterColor.toLowerCase());
            };

            const carDate = car.date_listed ? new Date(car.date_listed) : null;
            const isInTimeRange = carDate && startDate && endDate
                ? carDate >= startDate && carDate <= endDate
                : true;

            return (
                (!filters.trim || car.trim === filters.trim) &&
                (!filters.mileage || car.mileage <= filters.mileage) &&
                matchesColor(car.exterior_color, filters.exteriorColor) &&
                matchesColor(car.interior_color, filters.interiorColor) &&
                (!filters.transmission || car.transmission === filters.transmission) &&
                (!filters.drivetrain || car.drivetrain === filters.drivetrain) &&
                isInTimeRange
            );
        });

        const counts: { [key: string]: { count: number; totalPrice: number; priceCount: number; totalDaysOnMarket: number; listings: CarData[]; }; } = {};

        filteredData.forEach(car => {
            if (car.date_listed) {
                const date = parseDate(car.date_listed);
                if (!date) return; // Skip if date is invalid

                let key = formatDate(date);

                if (!counts[key]) {
                    counts[key] = { count: 0, totalPrice: 0, priceCount: 0, totalDaysOnMarket: 0, listings: [] };
                }
                counts[key].count += 1;
                if (car.price !== null) {
                    counts[key].totalPrice += car.price;
                    counts[key].priceCount += 1;
                }
                counts[key].totalDaysOnMarket += (endDate ? endDate.getTime() : new Date().getTime() - date.getTime()) / (1000 * 3600 * 24);
                counts[key].listings.push(car);
            }
        });

        // Focus on 2024-09-18
        const focusDate = '2024-09-17';
        if (counts[focusDate]) {
            console.log(`Listings on ${focusDate}:`, counts[focusDate].listings);
            console.log(`Total listings on ${focusDate}:`, counts[focusDate].count);
            console.log(`Listings with price on ${focusDate}:`, counts[focusDate].priceCount);
            console.log(`Total price on ${focusDate}:`, counts[focusDate].totalPrice);
            console.log(`Average price on ${focusDate}:`, counts[focusDate].totalPrice / counts[focusDate].priceCount);
        } else {
            console.log(`No listings found on ${focusDate}`);
        }

        const chartData = Object.entries(counts)
            .map(([date, data]) => ({
                date,
                count: data.count,
                averagePrice: data.priceCount > 0 ? data.totalPrice / data.priceCount : 0,
                averageDaysOnMarket: data.totalDaysOnMarket / data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            filteredData,
            chartData,
            entriesInTimeRange: filteredData.length,
            totalEntries: data.length
        };
    }, [data, filters, startDate, endDate]);


    const getYAxisData = () => {
        switch (chartType) {
            case '$ Change':
                return chartData.map((item, index, array) => ({
                    ...item,
                    value: index > 0 ? item.averagePrice - array[index - 1].averagePrice : 0
                }));
            case 'Total Listings':
                return chartData.map(item => ({ ...item, value: item.count }));
            case 'Average days on market':
                return chartData.map(item => ({ ...item, value: item.averageDaysOnMarket }));
            case 'Average price':
                return chartData.map(item => ({ ...item, value: item.averagePrice }));
        }
    };

    const yAxisData = getYAxisData();

    const formatYAxis = (value: number) => {
        if (chartType === '$ Change' || chartType === 'Average price') {
            return formatPrice(value);
        }
        return value.toLocaleString();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            let formattedValue: string;

            switch (chartType) {
                case '$ Change':
                case 'Average price':
                    formattedValue = formatPrice(payload[0].value);
                    break;
                case 'Average days on market':
                    formattedValue = payload[0].value.toFixed(1) + ' days';
                    break;
                case 'Total Listings':
                    formattedValue = payload[0].value.toString();
                    break;
                default:
                    formattedValue = payload[0].value.toFixed(2);
            }

            return (
                <div className="custom-tooltip bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
                    <p className="label text-gray-300">{`Date: ${label}`}</p>
                    <p className="value text-white">{`${chartType}: ${formattedValue}`}</p>
                    {chartType !== 'Total Listings' && (
                        <p className="count text-gray-400">{`Listings: ${payload[0].payload.count}`}</p>
                    )}
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
                <LineChart data={yAxisData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                        label={{ value: chartType, angle: -90, position: 'insideLeft', fill: '#888888', fontSize: 14 }}
                        padding={{ top: 20, bottom: 20 }}
                        tickFormatter={formatYAxis}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="mt-6 flex justify-center items-center space-x-4">
                <select
                    className="p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={localPeriod}
                    onChange={(e) => {
                        const newPeriod = e.target.value as 'day' | 'week' | 'month';
                        setLocalPeriod(newPeriod);
                        onTimeFilterChange(newPeriod, localPeriodCount);
                    }}
                >
                    <option value="day">Days</option>
                    <option value="week">Weeks</option>
                    <option value="month">Months</option>
                </select>
                <input
                    type="number"
                    className="p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={localPeriodCount}
                    onChange={(e) => {
                        const newCount = Math.max(1, parseInt(e.target.value) || 1);
                        setLocalPeriodCount(newCount);
                        onTimeFilterChange(localPeriod, newCount);
                    }}
                    min="1"
                />
            </div>
        </div>
    );
}