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
    date_sold?: string | null;
}

export interface Filters {
    make: string[] | null;
    model: string[] | null;
    trim: string[] | null;
    mileage: number | null;
    exteriorColor: string[] | null;
    interiorColor: string[] | null;
    transmission: string[] | null;
    drivetrain: string[] | null;
    period: 'day' | 'week' | 'month' | null;
    periodCount: number | null;
    startDate: Date | null;
    endDate: Date | null;
    listingType: string[] | null;
    onlyWithPricing: boolean;
    year: number[] | null;
}

export interface KPIData {
    percentageChange: number;
    totalListings: number;
    averageDaysOnMarket: number;
    averagePrice: number;
}