"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useMemo, useEffect } from 'react';
import { CarData } from '@/types/CarData';
import { useMediaQuery } from 'react-responsive';

interface ScatterChartComponentProps {
    data: CarData[];
    onDataSelection: (data: CarData[]) => void;
    onTimeSelection: (startDate: Date, endDate: Date) => void;
    startDate: Date | null;
    endDate: Date | null;
    imageLoader: (src: string) => string;
}

const parseDate = (dateString: string | null): Date | null => {
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

const formatPrice = (value: number): string =>
    value == null ? 'N/A' : `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const ScatterChartComponent = ({ data, onDataSelection, onTimeSelection, startDate, endDate, imageLoader }: ScatterChartComponentProps) => {
    const isMobile = useMediaQuery({ maxWidth: 767 });

    const scatterData = useMemo(() => {
        return data
            .filter(car => (car.date_listed || car.date_sold) && car.price !== null && car.mileage !== null)
            .map(car => ({
                x: parseDate(car.date_sold || car.date_listed)?.getTime() || 0,
                y: car.price,
                z: car.mileage,
                isSold: !!car.date_sold,
                ...car
            }))
            .sort((a, b) => a.x - b.x);
    }, [data]);

    // Preload images
    useEffect(() => {
        scatterData.forEach(car => {
            if (car.main_image) {
                const img = new Image();
                img.src = car.main_image;
            }
        });
    }, [scatterData]);

    // Check if the data is suitable for graphing
    const isDataSuitable = scatterData.length > 1;

    const formatXAxis = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatYAxis = (value: number) => formatPrice(value);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const dateField = data.isSold ? 'Sold' : 'Listed';
            if (isMobile) {
                return (
                    <div className="custom-tooltip bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-xs dark:text-black">
                        <p className="label font-bold">{`${data.year} ${data.make} ${data.model}`}</p>
                        <p>{`Price: ${formatPrice(data.y)}`}</p>
                        <p>{`${dateField}: ${formatXAxis(data.x)}`}</p>
                        <p>{`Mileage: ${data.z.toLocaleString()}`}</p>
                    </div>
                );
            }
            return (
                <div className="custom-tooltip bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    {data.main_image && (
                        <img
                            src={imageLoader(data.main_image)}
                            alt={`${data.year} ${data.make} ${data.model}`}
                            className="w-full object-cover mb-2 rounded"
                            style={{ height: '200px' }}
                            loading="lazy"
                        />
                    )}
                    <p className="label text-gray-700 font-bold mb-2">{`${data.year} ${data.make} ${data.model}`}</p>
                    <p className="value text-gray-900">{`Price: ${formatPrice(data.y)}`}</p>
                    <p className="date text-gray-600">{`${dateField}: ${new Date(data.x).toLocaleDateString()}`}</p>
                    <p className="mileage text-gray-600">{`Mileage: ${data.z.toLocaleString()} miles`}</p>
                    <p className="trim text-gray-600">{`Trim: ${data.trim || 'N/A'}`}</p>
                    <p className="exterior text-gray-600">{`Exterior: ${data.exterior_color || 'N/A'}`}</p>
                    <p className="interior text-gray-600">{`Interior: ${data.interior_color || 'N/A'}`}</p>
                    <p className="transmission text-gray-600">{`Transmission: ${data.transmission || 'N/A'}`}</p>
                    <p className="drivetrain text-gray-600">{`Drivetrain: ${data.drivetrain || 'N/A'}`}</p>
                </div>
            );
        }
        return null;
    };

    if (!isDataSuitable) {
        return (
            <div className="flex items-center justify-center h-[200px] bg-gray-100 rounded-lg">
                <p className="text-gray-300 text-2xl">
                    Not enough data to display the scatter plot. Please adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={isMobile ? { top: 20, right: 10, left: 0, bottom: 20 } : { top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                        <XAxis
                            dataKey="x"
                            name="Date"
                            tickFormatter={formatXAxis}
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            stroke="#555555"
                            fontSize={isMobile ? 10 : 14}
                            tickLine={false}
                            axisLine={false}
                            padding={{ left: isMobile ? 0 : 30, right: isMobile ? 0 : 30 }}
                            interval="preserveStartEnd"
                            minTickGap={isMobile ? 30 : 50}
                        />
                        <YAxis
                            dataKey="y"
                            name="Price"
                            tickFormatter={formatYAxis}
                            stroke="#555555"
                            fontSize={isMobile ? 10 : 14}
                            tickLine={false}
                            axisLine={false}
                            label={isMobile ? null : { value: 'Price', angle: -90, position: 'insideLeft', fill: '#555555', fontSize: 16 } as any}
                            tick={{
                                textAnchor: 'end',
                                angle: -45,
                                dx: -10
                            } as any}
                            width={isMobile ? 50 : 100}
                        />
                        <ZAxis dataKey="z" range={[20, 60]} name="Mileage" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Scatter name="Listed Cars" data={scatterData.filter(car => !car.isSold)} fill="#3b82f6" shape="circle">
                            {scatterData.filter(car => !car.isSold).map((entry, index) => (
                                <circle
                                    key={`circle-listed-${index}`}
                                    cx={0}
                                    cy={0}
                                    r={isMobile ? 5 : 7}
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                    stroke="#3b82f6"
                                />
                            ))}
                        </Scatter>
                        <Scatter name="Sold Cars" data={scatterData.filter(car => car.isSold)} fill="#ef4444" shape="circle">
                            {scatterData.filter(car => car.isSold).map((entry, index) => (
                                <circle
                                    key={`circle-sold-${index}`}
                                    cx={0}
                                    cy={0}
                                    r={isMobile ? 5 : 7}
                                    fill="#ef4444"
                                    fillOpacity={0.6}
                                    stroke="#ef4444"
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};