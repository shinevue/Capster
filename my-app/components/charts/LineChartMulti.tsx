"use client";

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { CarData } from '@/types/CarData';
import { useMediaQuery } from "react-responsive";
import { useMemo } from "react";

interface LineChartMultiComponentProps {
  data: CarData[];
  label: string;
}

const chartConfig = {
  averageListedPrice: {
    label: "Listed Price",
    color: "hsl(var(--chart-1))",
  },
  averageSoldPrice: {
    label: "Sold Price",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

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

export const LineChartComponentMulti: React.FC<LineChartMultiComponentProps> = ({data, label}) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

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

  const formatPrice = (value: number): string =>
    value == null ? 'N/A' : `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatYAxis = (value: number) => formatPrice(value);

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
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{isMobile ? "" : "Average Price"}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pr-4 sm5:p-6">
        <ChartContainer config={chartConfig} className="h-48 sm5:h-96 w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
            <XAxis
              dataKey="date"
              stroke="#555555"
              fontSize={isMobile ? 10 : 14}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(5, )}
              padding={{ left: isMobile ? 0 : 30, right: isMobile ? 0 : 30 }}
              interval="preserveStartEnd"
              minTickGap={isMobile ? 30 : 50}
            />
            <YAxis
              stroke="#555555"
              fontSize={isMobile ? 10 : 14}
              tickLine={false}
              axisLine={false}
              padding={{ top: 20, bottom: 20 }}
              tickFormatter={formatYAxis}
              tick={{
                  textAnchor: 'end',
                  dx: -10,
              } as any}
              width={isMobile ? 50 : 100}
            />
            {/* <Legend /> */}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {label == "Listing Data" && (
              <Line
                dataKey="averageListedPrice"
                type="monotone"
                stroke="var(--color-averageListedPrice)"
                strokeWidth={2}
                dot={false}
              />
            )}
            {label == "Sale Data" && (
              <Line
                dataKey="averageSoldPrice"
                type="monotone"
                stroke="var(--color-averageSoldPrice)"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
