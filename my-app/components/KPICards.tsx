import { FC } from 'react';
import { Card, Flex, Text, Box, Spinner } from '@radix-ui/themes';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import { KPIComparison } from '@/lib/chartTransformers';

interface KPICardsProps {
    kpiComparison: KPIComparison;
    hasMore: boolean;
}

const KPICards: FC<KPICardsProps> = ({ kpiComparison, hasMore }) => {
    const { current, changes } = kpiComparison;

    if (!current || !changes) {
        return null;
    }

    const formatChange = (change: number, isInverse: boolean = false) => {
        const prefix = isInverse ? (change >= 0 ? '-' : '+') : (change >= 0 ? '+' : '-');
        return `${prefix}${Math.abs(change).toFixed(2)}%`;
    };

    const getChangeText = (change: number, isInverse: boolean = false) => {
        const direction = isInverse ? (change >= 0 ? 'decrease' : 'increase') : (change >= 0 ? 'increase' : 'decrease');
        return `${formatChange(change, isInverse)} ${direction} from last period`;
    };

    return (
        <Flex direction="row" gap="5" wrap="wrap" className="mb-6 mx-auto w-[85%] md:w-full">
            <KPICard
                title="% Change"
                value={`${Math.abs(current.percentageChange).toFixed(2)}%`}
                icon={
                    current.percentageChange >= 0
                        ? <ArrowUpIcon height={30} width={30} className="text-green-600" />
                        : <ArrowDownIcon height={30} width={30} className="text-red-600" />
                }
                valueColor={current.percentageChange >= 0 ? "green" : "red"}
                changeText={getChangeText(changes.percentageChange)}
                hasMore={hasMore}
            />
            <KPICard
                title="Total Listings"
                value={formatNumber(current.totalListings)}
                valueColor="blue"
                changeText={getChangeText(changes.totalListings)}
                hasMore={hasMore}
            />
            <KPICard
                title="Avg Days on Market"
                value={current.averageDaysOnMarket.toFixed(1)}
                valueColor="purple"
                changeText={getChangeText(changes.averageDaysOnMarket, true)}
                hasMore={hasMore}
            />
            <KPICard
                title="Average Price"
                value={formatCurrency(current.averagePrice)}
                valueColor="yellow"
                changeText={getChangeText(changes.averagePrice)}
                hasMore={hasMore}
            />
        </Flex>
    );
};

interface KPICardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    valueColor?: string;
    changeText: string;
    hasMore: boolean;
}

const KPICard: FC<KPICardProps> = ({ title, value, icon, valueColor, changeText, hasMore }) => (
    <Card className="flex-1 min-w-[200px] sm:min-w-[150px] shadow-md relative">
        {hasMore && (
            <div className="absolute top-3.5 right-3.5">
                <Spinner size="sm" />
            </div>
        )}
        <Flex direction="column" gap="1" className='px-4'>
            <Text size="2" weight="bold" color="gray">
                {title}
            </Text>
            <Flex justify="between" align="center">
                <Flex direction="column">
                    <Text size="6" weight="bold" color={valueColor as any}>
                        {value}
                    </Text>
                    <Text size="2" color="gray">
                        {changeText}
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