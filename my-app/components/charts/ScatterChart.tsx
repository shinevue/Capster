"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

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

interface ScatterChartComponentProps {
    data: CarData[];
    onDataSelection: (data: CarData[]) => void;
    onTimeSelection: (startDate: Date, endDate: Date) => void;
    startDate: Date | null;
    endDate: Date | null;
}

function parseDate(dateString: string | null): Date | null {
    if (!dateString) return null;
    const [month, day, year] = dateString.split('-').map(Number);
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        console.warn(`Invalid date format: ${dateString}`);
        return null;
    }
    const fullYear = year < 100 ? 2000 + year : year;
    return new Date(fullYear, month - 1, day);
}

function formatPrice(value: number): string {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ScatterChartComponent({ data, onDataSelection, onTimeSelection, startDate, endDate }: ScatterChartComponentProps) {
    const scatterData = useMemo(() => {
        return data
            .filter(car => car.date_listed && car.price !== null)
            .map(car => ({
                x: parseDate(car.date_listed)?.getTime() || 0,
                y: car.price,
                z: car.mileage,
                ...car
            }))
            .sort((a, b) => a.x - b.x);
    }, [data]);

    const formatXAxis = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString();
    };

    const formatYAxis = (value: number) => {
        return formatPrice(value);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                    <p className="label text-gray-300 font-bold mb-2">{`${data.year} ${data.make} ${data.model}`}</p>
                    <p className="value text-white">{`Price: ${formatPrice(data.y)}`}</p>
                    <p className="date text-gray-400">{`Listed: ${new Date(data.x).toLocaleDateString()}`}</p>
                    <p className="mileage text-gray-400">{`Mileage: ${data.mileage.toLocaleString()} miles`}</p>
                    <p className="trim text-gray-400">{`Trim: ${data.trim || 'N/A'}`}</p>
                    <p className="exterior text-gray-400">{`Exterior: ${data.exterior_color || 'N/A'}`}</p>
                    <p className="interior text-gray-400">{`Interior: ${data.interior_color || 'N/A'}`}</p>
                    <p className="transmission text-gray-400">{`Transmission: ${data.transmission || 'N/A'}`}</p>
                    <p className="drivetrain text-gray-400">{`Drivetrain: ${data.drivetrain || 'N/A'}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative">
            <div className="absolute top-0 right-0 bg-white bg-opacity-75 p-2 rounded text-md text-black">
                {scatterData.length} entries
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <XAxis
                        dataKey="x"
                        name="Date"
                        tickFormatter={formatXAxis}
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        dataKey="y"
                        name="Price"
                        tickFormatter={formatYAxis}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Price', angle: -90, position: 'insideLeft', fill: '#888888', fontSize: 14 }}
                    />
                    <ZAxis dataKey="z" range={[20, 60]} name="Mileage" />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter
                        name="Cars"
                        data={scatterData}
                        fill="#8884d8"
                        shape="circle"
                    >
                        {scatterData.map((entry, index) => (
                            <circle
                                key={`circle-${index}`}
                                cx={0}
                                cy={0}
                                r={6}
                                fill="#8884d8"
                                fillOpacity={0.6}
                                stroke="#8884d8"
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}