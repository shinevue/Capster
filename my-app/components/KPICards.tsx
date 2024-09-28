import { FC } from 'react';
import { Card, Flex, Text, Box } from '@radix-ui/themes';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

interface KPICardsProps {
    percentageChange: number;
    totalListings: number;
    averageDaysOnMarket: number;
    averagePrice: number;
}

const KPICards: FC<KPICardsProps> = ({ percentageChange, totalListings, averageDaysOnMarket, averagePrice }) => {
    return (
        <Flex direction="row" gap="3" wrap="wrap" className="mb-6">
            <KPICard
                title="% Change"
                value={`${Math.abs(percentageChange).toFixed(2)}%`}
                icon={
                    percentageChange >= 0
                        ? <ArrowUpIcon className="text-green-600" />
                        : <ArrowDownIcon className="text-red-600" />
                }
                valueColor={percentageChange >= 0 ? "green" : "red"}
            />
            <KPICard
                title="Total Listings"
                value={formatNumber(totalListings)}
                valueColor="blue"
            />
            <KPICard
                title="Avg Days on Market"
                value={averageDaysOnMarket.toFixed(1)}
                valueColor="purple"
            />
            <KPICard
                title="Average Price"
                value={formatCurrency(averagePrice)}
                valueColor="yellow"
            />
        </Flex>
    );
};

interface KPICardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    valueColor?: string;
}

const KPICard: FC<KPICardProps> = ({ title, value, icon, valueColor }) => (
    <Card className="flex-1 min-w-[200px] sm:min-w-[150px]">
        <Flex direction="column" gap="1">
            <Text size="2" weight="bold" color="gray">
                {title}
            </Text>
            <Flex justify="between" align="center">
                <Text size="6" weight="bold" color={valueColor as any}>
                    {value}
                </Text>
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