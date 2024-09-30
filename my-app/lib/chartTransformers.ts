import { CarData, Filters, KPIData } from '@/types/CarData';

export const calculateKPIs = (data: CarData[]): KPIData => {
    const validPriceData = data.filter(car => car.price !== null && car.price > 0);
    const totalListings = validPriceData.length;
    const totalPrice = validPriceData.reduce((sum, car) => sum + (car.price || 0), 0);
    const averagePrice = totalPrice / totalListings;

    const now = new Date();
    const totalDaysOnMarket = validPriceData.reduce((sum, car) => {
        if (car.date_listed) {
            const listedDate = new Date(car.date_listed);
            const daysOnMarket = (now.getTime() - listedDate.getTime()) / (1000 * 3600 * 24);
            return sum + daysOnMarket;
        }
        return sum;
    }, 0);
    const averageDaysOnMarket = totalDaysOnMarket / totalListings;

    // Calculate percentage change using linear regression
    let percentageChange = 0;
    if (validPriceData.length > 1) {
        // Sort the data by date
        const sortedData = validPriceData.sort((a, b) => {
            return new Date(a.date_listed || '').getTime() - new Date(b.date_listed || '').getTime();
        });

        // Prepare data for linear regression
        const xValues = sortedData.map((car, index) => index);
        const yValues = sortedData.map(car => car.price || 0);

        // Calculate linear regression
        const n = xValues.length;
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Calculate start and end prices based on the regression line
        const startPrice = intercept;
        const endPrice = slope * (n - 1) + intercept;

        // Calculate percentage change
        percentageChange = ((endPrice - startPrice) / startPrice) * 100;
    }

    return {
        percentageChange,
        totalListings,
        averageDaysOnMarket,
        averagePrice,
    };
};

export function calculatePreviousPeriodChange(currentKPIs: KPIData, previousKPIs: KPIData): number {
    const currentAvgPrice = currentKPIs.averagePrice;
    const previousAvgPrice = previousKPIs.averagePrice;
    
    if (previousAvgPrice === 0) return 0;
    
    return ((currentAvgPrice - previousAvgPrice) / previousAvgPrice) * 100;
}

export interface KPIComparison {
  current: KPIData;
  previous: KPIData;
  changes: {
    percentageChange: number;
    totalListings: number;
    averageDaysOnMarket: number;
    averagePrice: number;
  };
}

export function calculateKPIComparison(currentKPIs: KPIData, previousKPIs: KPIData): KPIComparison {
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current: currentKPIs,
    previous: previousKPIs,
    changes: {
      percentageChange: currentKPIs.percentageChange - previousKPIs.percentageChange,
      totalListings: calculatePercentageChange(currentKPIs.totalListings, previousKPIs.totalListings),
      averageDaysOnMarket: calculatePercentageChange(currentKPIs.averageDaysOnMarket, previousKPIs.averageDaysOnMarket),
      averagePrice: calculatePercentageChange(currentKPIs.averagePrice, previousKPIs.averagePrice),
    },
  };
}
