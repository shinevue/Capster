export interface CarData {
    source: string;
    date_listed: string | null;
    year: string;
    make: string;
    model: string;
    trim: string | null;
    price: number | null;
    mileage: number | null;
    interior_color: string | null;
    exterior_color: string | null;
    transmission: string | null;
    drivetrain: string | null;
    listing_type: string | null;
    photos: string;
    image: string | null;
    url: string | null;
    sold_date: string | null;
}

export interface Filters {
    trim: string | null;
    mileage: number | null;
    exteriorColor: string | null;
    interiorColor: string | null;
    transmission: string | null;
    drivetrain: string | null;
    period: 'day' | 'week' | 'month' | 'custom';
    periodCount: number;
    startDate: Date | null;
    endDate: Date | null;
    listing_type: string | null;
    onlyWithPricing: boolean;
}

export interface KPIData {
    percentageChange: number;
    totalListings: number;
    averageDaysOnMarket: number;
    averagePrice: number;
}