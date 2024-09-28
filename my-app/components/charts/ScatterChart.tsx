"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMemo, useEffect } from 'react';
import { CarData } from '@/types/CarData';

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
    const [month, day, year] = dateString.split('-').map(Number);
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        console.warn(`Invalid date format: ${dateString}`);
        return null;
    }
    const fullYear = year < 100 ? 2000 + year : year;
    return new Date(fullYear, month - 1, day);
};

const formatPrice = (value: number): string =>
    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ScatterChartComponent = ({ data, onDataSelection, onTimeSelection, startDate, endDate, imageLoader }: ScatterChartComponentProps) => {
    const scatterData = useMemo(() => {
        return data
            .filter(car => car.date_listed && car.price !== null && car.mileage !== null)
            .map(car => ({
                x: parseDate(car.date_listed)?.getTime() || 0,
                y: car.price,
                z: car.mileage,
                ...car
            }))
            .sort((a, b) => a.x - b.x);
    }, [data]);

    // Preload images
    useEffect(() => {
        scatterData.forEach(car => {
            if (car.image) {
                const img = new Image();
                img.src = car.image;
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
            return (
                <div className="custom-tooltip bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    {data.image && (
                        <img
                            src={imageLoader(data.image)}
                            alt={`${data.year} ${data.make} ${data.model}`}
                            className="w-full object-cover mb-2 rounded"
                            style={{ height: '200px' }} // Set a fixed height of 200 pixels
                            loading="lazy"
                        />
                    )}
                    <p className="label text-gray-700 font-bold mb-2">{`${data.year} ${data.make} ${data.model}`}</p>
                    <p className="value text-gray-900">{`Price: ${formatPrice(data.y)}`}</p>
                    <p className="date text-gray-600">{`Listed: ${new Date(data.x).toLocaleDateString()}`}</p>
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
                <p className="text-gray-300 text-4xl">
                    Not enough data to display the scatter plot. Please adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="absolute top-0 right-0 bg-gray-100 p-2 rounded text-lg text-gray-700">
                {scatterData.length} entries
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                    <XAxis
                        dataKey="x"
                        name="Date"
                        tickFormatter={formatXAxis}
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        stroke="#555555"
                        fontSize={14}
                        tickLine={false}
                        axisLine={false}
                        padding={{ left: 30, right: 30 }}
                        interval="preserveStartEnd"
                        minTickGap={50}
                    />
                    <YAxis
                        dataKey="y"
                        name="Price"
                        tickFormatter={formatYAxis}
                        stroke="#555555"
                        fontSize={14}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Price', angle: -90, position: 'insideLeft', fill: '#555555', fontSize: 16 }}
                        tick={{ textAnchor: 'end' }}
                        width={100}
                    />
                    <ZAxis dataKey="z" range={[20, 60]} name="Mileage" />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter name="Cars" data={scatterData} fill="#3b82f6" shape="circle">
                        {scatterData.map((entry, index) => (
                            <circle
                                key={`circle-${index}`}
                                cx={0}
                                cy={0}
                                r={7}
                                fill="#3b82f6"
                                fillOpacity={0.6}
                                stroke="#3b82f6"
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};