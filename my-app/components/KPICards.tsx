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
        <Flex direction="row" gap="5" wrap="wrap" className="mx-auto w-full md:w-full">
            <KPICard
                title={kpiTitle.title1}
                value={`${Math.abs(current.percentageChange).toFixed(2)}%`}
                icon={
                    current.percentageChange >= 0
                        ? <ArrowUpIcon height={30} width={30} className="text-green-600" />
                        : <ArrowDownIcon height={30} width={30} className="text-red-600" />
                }
                valueColor={current.percentageChange >= 0 ? "green" : "red"}
                hasMore={false}
            />
            <KPICard
                title={kpiTitle.title2}
                value={formatNumber(current.totalListings)}
                valueColor="blue"
                hasMore={false}
            />
            <KPICard
                title={kpiTitle.title3}
                value={current?.averageDaysOnMarket?.toFixed(1) || 'N/A'}
                valueColor="purple"
                hasMore={false}
            />
            <KPICard
                title={kpiTitle.title4}
                value={formatCurrency(current?.averagePrice || 0)}
                valueColor="yellow"
                hasMore={false}
            />
        </Flex>
    );
};

interface KPICardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    valueColor?: string;
    hasMore: boolean;
}

const KPICard: FC<KPICardProps> = ({ title, value, icon, valueColor, hasMore }) => (
    <Card className="flex-1 min-w-[200px] sm:min-w-[150px] shadow-md relative">
        {hasMore && (
            <div className="absolute top-3.5 right-3.5">
                <Spinner size="1" />
            </div>
        )}
        <Flex direction="column" gap="3" className='px-5 py-4'>
            <Text size="2" weight="bold" color="gray">
                {title}
            </Text>
            <Flex justify="between" align="center">
                <Flex justify="center" width={"100%"}>
                    <Text size="7" weight="bold"  align="center" color={valueColor as any}>
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