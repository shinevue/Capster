"use client";

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
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

interface LineChartMultiComponentProps {
  data: CarData[];
  title: string;
  label: string;
}

const chartConfig = {
  listedPrice: {
    label: "Listed Price",
    color: "hsl(var(--chart-1))",
  },
  soldPrice: {
    label: "Sold Price",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const LineChartComponentMulti: React.FC<LineChartMultiComponentProps> = ({data, title, label}) => {
  console.log("data: ", data);
  console.log("title: ", title);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const chartData = [
    { date: "January", listedPrice: 186, soldPrice: 80 },
    { date: "February", listedPrice: 305, soldPrice: 200 },
    { date: "March", listedPrice: 237, soldPrice: 120 },
    { date: "April", listedPrice: 73, soldPrice: 190 },
    { date: "May", listedPrice: 209, soldPrice: 130 },
    { date: "June", listedPrice: 214, soldPrice: 140 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-96 w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
            <XAxis
              dataKey="date"
              stroke="#555555"
              fontSize={isMobile ? 10 : 14}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              padding={{ left: isMobile ? 0 : 30, right: isMobile ? 0 : 30 }}
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
              tick={{
                  textAnchor: 'end',
                  angle: -45,
                  dx: -10,
              } as any}
              width={isMobile ? 50 : 100}
            />
            <Legend />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="listedPrice"
              type="monotone"
              stroke="var(--color-listedPrice)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="soldPrice"
              type="monotone"
              stroke="var(--color-soldPrice)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
