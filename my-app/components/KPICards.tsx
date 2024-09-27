import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface KPICardsProps {
    percentageChange: number; // Changed from dollarChange
    totalListings: number;
    averageDaysOnMarket: number;
    averagePrice: number;
}

const KPICards: FC<KPICardsProps> = ({ percentageChange, totalListings, averageDaysOnMarket, averagePrice }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
                title="% Change"
                value={`${Math.abs(percentageChange).toFixed(2)}%`}
                icon={
                    percentageChange >= 0
                        ? <ArrowUpIcon className="w-6 h-6 text-green-600" />
                        : <ArrowDownIcon className="w-6 h-6 text-red-600" />
                }
                className={percentageChange >= 0 ? "text-green-600" : "text-red-600"}
            />
            <KPICard
                title="Total Listings"
                value={formatNumber(totalListings)}
                className="text-blue-600"
            />
            <KPICard
                title="Avg Days on Market"
                value={averageDaysOnMarket.toFixed(1)}
                className="text-purple-600"
            />
            <KPICard
                title="Average Price"
                value={formatCurrency(averagePrice)}
                className="text-yellow-600"
            />
        </div>
    );
};

interface KPICardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    className?: string;
}

const KPICard: FC<KPICardProps> = ({ title, value, icon, className }) => (
    <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <p className={`text-2xl font-bold ${className}`}>{value}</p>
                {icon && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {icon}
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
);

export default KPICards;