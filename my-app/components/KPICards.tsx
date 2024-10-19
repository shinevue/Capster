import { FC, useEffect, useState } from 'react';
import { Card, Flex, Text, Box, Spinner } from '@radix-ui/themes';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import { KPIComparison } from '@/lib/chartTransformers';

import { CarData } from '@/types/CarData';
import { parseDate } from './charts/LineChart';

interface KPICardsProps {
    data?: CarData[];
    kpiComparison: KPIComparison;
    hasMore: boolean;
    kpiTitle: string;
}

const KPICards: FC<KPICardsProps> = ({ data, kpiComparison, hasMore, kpiTitle }) => {
    const { current, changes } = kpiComparison;
    const [priceData, setPriceData] = useState({min: 0, max: 0});

    if (!current || !changes) {
        return null;
    }

    useEffect(()=>{
        const counts: Record<string, {
            minPrice: number;
            maxPrice: number;
            soldTotalPrice: number;
        }> = {};

        data?.forEach(car => {
            const soldDate = parseDate(car.date_sold);

            if (soldDate) {
                const soldKey = soldDate.toISOString().split('T')[0];
                if (!counts[soldKey]) {
                    counts[soldKey] = { minPrice: Infinity, maxPrice: 0, soldTotalPrice: 0 };
                }
                if (car.price !== null) {
                    counts[soldKey].soldTotalPrice += car.price;
                }
            }
        });
        let minprince = Infinity;
        let maxprince = 0;
        Object.entries(counts)
            .map(([date, data]) => {
                minprince = minprince < data.soldTotalPrice ? minprince : data.soldTotalPrice;
                maxprince = maxprince > data.soldTotalPrice ? maxprince : data.soldTotalPrice;
            });
        setPriceData(prev => ({
            ...prev,
            min: minprince,
            max: maxprince
        }))


    })

    if(kpiTitle == "sale")
        return (
            <Flex className="mx-auto gap-1 sm5:gap-5">
                <KPICard
                    title="% Change"
                    value={`${Math.abs(changes.averagePrice).toFixed(2)}%`}
                    icon={
                        current.percentageChange > 0
                        ? <ArrowUpIcon height={30} width={30} className="text-green-600" />
                        : current.percentageChange < 0 ? <ArrowDownIcon height={30} width={30} className="text-red-600" /> : <></>
                    }
                    hasMore={false}
                />
                <KPICard
                    title="Average Sale"
                    value={`$${formatNumber(Math.round(current.averagePrice))}`}
                    hasMore={false}
                />
                <KPICard
                    title="Lowest Sale"
                    value={`$${formatNumber(Math.round(priceData.min == Infinity ? 0 : priceData.min))}`}
                    hasMore={false}
                />
                <KPICard
                    title="Highest Sale"
                    value={`$${formatNumber(Math.round(priceData.max))}`}
                    hasMore={false}
                />
            </Flex>
        );

    if(kpiTitle == "list")
        return (
            <Flex className="mx-auto gap-1 sm5:gap-5">
                <KPICard
                    title="% Change"
                    value={`${Math.abs(changes.totalListings).toFixed(2)}%`}
                    icon={
                        current.percentageChange > 0
                            ? <ArrowUpIcon height={30} width={30} className="text-green-600" />
                            : current.percentageChange < 0 ? <ArrowDownIcon height={30} width={30} className="text-red-600" /> : <></>
                    }
                    hasMore={false}
                />
                <KPICard
                    title="Avg Price"
                    value={`$${formatNumber(Math.round(current.averagePrice))}`}
                    hasMore={false}
                />
                <KPICard
                    title="Total Listings"
                    value={`${formatNumber(Math.round(current.totalListings))}`}
                    hasMore={false}
                />
                <KPICard
                    title="Avg Days on Market"
                    value={`${formatNumber(Math.round(current?.averageDaysOnMarket || 0))}`}
                    hasMore={false}
                />
            </Flex>
        );
};

interface KPICardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    hasMore: boolean;
}

const KPICard: FC<KPICardProps> = ({ title, value, icon, hasMore }) => (
    <Card className="flex-1 hadow-md relative">
        {hasMore && (
            <div className="absolute top-3.5 right-3.5">
                <Spinner size="1" />
            </div>
        )}
        <Flex direction="column" justify="between" gap={"3"} className='h-full p-2 sm5:px-5 sm5:py-4'>
            <Text color="gray" align="center" className='text-xs sm5:text-md sm5:font-semibold md:text-lg md:font-bold'>
                {title}
            </Text>
            <Flex justify="between" align="center">
                <Flex justify="center" gap="2" width={"100%"} className='items-center'>
                    <Text weight="bold"  align="center" color="blue" className='text-xl sm5:text-2xl md:text-3xl'>
                        {value}
                    </Text>

                    {icon && (
                        <div> {icon} </div>
                    )}
                </Flex>
            </Flex>
        </Flex>
    </Card>
);

export default KPICards;