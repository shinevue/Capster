import { Filters, CarData } from '@/types/CarData';

export const initialFilters: Filters = {
    make: [],
    model: [],
    trim: [],
    mileage: null,
    exteriorColor: [],
    interiorColor: [],
    transmission: null,
    drivetrain: null,
    period: 'day',
    periodCount: 7,
    startDate: null,
    endDate: null,
    listingType: null,
    onlyWithPricing: true, // Add this new filter
    year: [],
};

export const applyTimeFilter = (filters: Filters): Filters => {
    const endDate = new Date();
    const startDate = new Date();

    switch (filters.period) {
        case 'day':
            startDate.setDate(endDate.getDate() - (filters.periodCount || 0));
            break;
        case 'week':
            startDate.setDate(endDate.getDate() - (filters.periodCount || 0) * 7);
            break;
        case 'month':
            startDate.setMonth(endDate.getMonth() - (filters.periodCount || 0));
            break;
        default:
            return filters; // Don't modify custom date range
    }

    return {
        ...filters,
        startDate,
        endDate,
    };
};

export const updateFilter = (filters: Filters, key: keyof Filters, value: any): Filters => {
    const newFilters = { ...filters, [key]: value };
    
    if (['period', 'periodCount'].includes(key)) {
        return applyTimeFilter(newFilters);
    }

    return newFilters;
};

export const removeFilter = (filters: Filters, key: keyof Filters): Filters => {
    const newFilters = { ...filters, [key]: null };
    return newFilters;
};

export const getActiveFilters = (filters: Filters): [string, any][] => {
    return Object.entries(filters).filter(([key, value]) =>
        value !== null && !['period', 'periodCount', 'startDate', 'endDate'].includes(key)
    );
};

export const applyFiltersToData = (data: CarData[], filters: Filters): CarData[] => {
    return data.filter((car: CarData) => {
        // Convert photos JSON string and get first image URL
        if (typeof car.photos == 'string') {
            try {
                const photosArray = JSON.parse(car.photos);
                car.image = photosArray[0] || null;
            } catch (error) {
                console.error('Error parsing photos JSON:', error);
                car.image = null;
            }
        } else {
            car.image = null;
        }

        // Parse the date in "dd/mm/yy" format
        let carDate = null;
        if (car?.date_listed) {
            const [day, month, year] = car.date_listed.split('/').map(Number);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const fullYear = year + 2000; // Assuming all years are in the 2000s
                carDate = new Date(fullYear, month - 1, day); // month is 0-indexed in JavaScript Date
            }
        }   

        const isInTimeRange = carDate && filters.startDate && filters.endDate
        ? carDate >= filters.startDate && carDate <= filters.endDate
        : true;

        // Skip listings with null prices if onlyWithPricing is true
        if (filters.onlyWithPricing && (car.price === null || car.price === undefined)) {
            return false;
        }

        const matchesColor = (carColor: string | null, filterColors: string[]) =>
            !filterColors?.length || (carColor && filterColors.some(color => carColor.toLowerCase().includes(color.toLowerCase())));

        const matchesListingType = (car: CarData, listingType: string[] | null): boolean => {
            if (!listingType || listingType.length === 0) return true;
            return listingType.includes(car?.listing_type);
        };

        const matchesTransmission = (car: CarData, transmission: string[] | null): boolean => {
            if (!transmission || transmission.length === 0) return true;
            return transmission.includes(car?.transmission);
        };

        const matchesDrivetrain = (car: CarData, drivetrain: string[] | null): boolean => {
            if (!drivetrain || drivetrain.length === 0) return true;
            return drivetrain.includes(car?.drivetrain);
        };

        const matchesMake = !filters.make || filters.make.length === 0 || 
            (car.make && filters.make.some((make: string) => car.make?.toLowerCase() === make.toLowerCase()));
        const matchesModel = !filters.model || filters.model.length === 0 || 
            (car.model && filters.model.some((model: string) => car.model?.toLowerCase() === model.toLowerCase()));
        const matchesTrim = !filters.trim || filters.trim.length === 0 || 
            (car.trim && filters.trim.some((trim: string) => car.trim?.toLowerCase() === trim.toLowerCase()));
        const matchesYear = (car: CarData, years: number[] | null): boolean => {
            if (!years || years.length === 0) return true;
            return years.includes(car.year);
        };

        return (
            matchesMake &&
            matchesModel &&
            matchesTrim &&
            (!filters.mileage || (car.mileage !== null && car.mileage <= filters?.mileage)) &&
            matchesColor(car.exterior_color, filters.exteriorColor) &&
            matchesColor(car.interior_color, filters.interiorColor) &&
            matchesTransmission(car, filters.transmission) &&
            matchesDrivetrain(car, filters.drivetrain) &&
            matchesListingType(car, filters.listingType) &&
            matchesYear(car, filters.year) &&
            isInTimeRange
        );
    });
};