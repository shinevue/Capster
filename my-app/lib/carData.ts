import { CarData } from '@/types/CarData'
import axios from 'axios'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!BACKEND_API_URL) {
  throw new Error('NEXT_PUBLIC_BACKEND_API_URL is not defined in the environment');
}

export async function fetchCarDataByFilters(
    make: string[] | null,
    model: string[] | null,
    trim: string[] | null,
    year: number[] | null
): Promise<CarData[]> {
    const startTime = Date.now();

    const filter = { make, model, trim, year }

    const response = await axios.post(`${BACKEND_API_URL}/api/cars/fetch-by-filters`, { filter });
    const data = response.data;

    if (!data) {
        throw new Error('No data returned');
    }

    const endTime = Date.now();
    console.log(`Time taken for fetch-by-filters: ${endTime - startTime}ms`);

    return data;
}


export async function fetchLineChartDataByFilters(
    make: string[] | null,
    model: string[] | null,
    trim: string[] | null,
    year: number[] | null
): Promise<CarData[]> {
    const startTime = Date.now();

    const filter = { make, model, trim, year }
    
    const response = await axios.post(`${BACKEND_API_URL}/api/cars/fetch-line-chart-data`, { filter });
    const data = response.data;

    if (!data) {
        throw new Error('No data returned');
    }

    const endTime = Date.now();
    console.log(`Time taken for line chart: ${endTime - startTime}ms`);

    return data;
}


export async function fetchUniqueFilterValues() {
    console.log('fetching unique filter values')

    const response = await axios.get(`${BACKEND_API_URL}/api/cars/fetch-unique-filter-values`);
    const data = response.data;

    if (!data) {
        throw new Error('No data returned');
    }

    return data;
}

export async function fetchFilteredUniqueValues(filters: Partial<{ make: string[]; model: string[]; trim: string[]; year: number[]; }>): Promise<{ make: string[]; model: string[]; trim: string[]; year: number[]; }> {
    const response = await axios.post(`${BACKEND_API_URL}/api/cars/fetch-filtered-unique-values`, { filter: filters });
    const data = response.data;

    if (!data) {
        throw new Error('No data returned');
    }

    return data;
}
