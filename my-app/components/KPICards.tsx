import { FC } from 'react';
import { Card, Flex, Text, Box, Spinner } from '@radix-ui/themes';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import { KPIComparison } from '@/lib/chartTransformers';

interface KPICardsProps {
    kpiComparison: KPIComparison;
    hasMore: boolean;
    kpiTitle: {
        title1: string;
        title2: string;
        title3: string;
        title4: string;
    };
}

const KPICards: FC<KPICardsProps> = ({ kpiComparison, hasMore, kpiTitle }) => {
    const { current, changes } = kpiComparison;

    if (!current || !changes) {
        return null;
    }

    return (
        <Flex className="mx-auto gap-1 sm5:gap-5">
            <KPICard
                title={kpiTitle.title1}
                value={`${Math.abs(current.percentageChange).toFixed(2)}%`}
                // icon={
                //     current.percentageChange >= 0
                //         ? <ArrowUpIcon height={30} width={30} className="text-green-600" />
                //         : <ArrowDownIcon height={30} width={30} className="text-red-600" />
                // }
                hasMore={false}
            />
            <KPICard
                title={kpiTitle.title2}
                value={formatNumber(current.totalListings)}
                hasMore={false}
            />
            <KPICard
                title={kpiTitle.title3}
                value={current?.averageDaysOnMarket?.toFixed(1) || 'N/A'}
                hasMore={false}
            />
            <KPICard
                title={kpiTitle.title4}
                value={formatCurrency(current?.averagePrice || 0)}
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
            <Text color="gray" className='text-xs sm5:text-lg sm5:font-bold'>
                {title}
            </Text>
            <Flex justify="between" align="center">
                <Flex justify="center" width={"100%"}>
                    <Text weight="bold"  align="center" color="blue" className='text-xl sm5:text-3xl'>
                        {value}
                    </Text>
                </Flex>
                {icon && (
                    <Box>
                        {icon}
                    </Box>
                )}
            </Flex>
        </Flex>
    </Card>
);

export default KPICards;