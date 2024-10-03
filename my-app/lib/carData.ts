import { CarData } from '@/types/CarData'
import { supabase } from './supabase-client'


const pageSize = 1000
const parallelFetchCount = 6

// Helper function to convert string fields to lowercase
function convertToLowerCase(obj: any): any {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = typeof obj[key] === 'string' ? obj[key].toLowerCase() : obj[key];
    return acc;
  }, {} as any);
}

export async function fetchCarDataByFilters(make: string, model: string, trim: string, year: number | null): Promise<CarData[]> {
    let query = supabase
        .from('processed_bot_listings')
        .select('*', { count: 'exact' })

    if (make) {
        query = query.ilike('make', `${make}`)
    }
    if (model) {
        query = query.ilike('model', `${model}`)
    }
    if (trim) {
        query = query.ilike('trim', `${trim}`)
    }
    if (year !== null) {
        query = query.eq('year', year)
    }


    // First, get the total count
    const { count, error: countError } = await query;

    if (countError) {
        console.error('Error fetching car data count:', countError)
        throw countError
    }

    if (!count) {
        return [];
    }

    // Calculate the number of pages
    const totalPages = Math.ceil(count / pageSize);

    // Create an array of page numbers
    const pages = Array.from({ length: totalPages }, (_, i) => i);

    // Function to fetch a single page
    const fetchPage = async (page: number): Promise<CarData[]> => {
        const { data, error } = await query
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .order('id', { ascending: true });

        if (error) {
            console.error(`Error fetching car data for page ${page + 1}:`, error)
            throw error
        }

        return (data as CarData[] || []).map(convertToLowerCase);
    }

    // Fetch data in parallel
    const allData: CarData[] = [];
    for (let i = 0; i < totalPages; i += parallelFetchCount) {
        const pagePromises = pages.slice(i, i + parallelFetchCount).map(fetchPage);
        const results = await Promise.all(pagePromises);
        const flatResults = results.flat();
        allData.push(...flatResults);
    }

    return allData;
}

export async function fetchUniqueFilterValues(): Promise<{ make: string[], model: string[], trim: string[], year: number[] }> {
    const { data, error } = await supabase
        .from('processed_bot_listings')
        .select('make, model, trim, year')

    if (error) {
        console.error('Error fetching unique filter values:', error)
        throw error
    }

    const uniqueValues = {
        make: Array.from(new Set(data.map(item => item.make).filter(Boolean))).sort(),
        model: Array.from(new Set(data.map(item => item.model).filter(Boolean))).sort(),
        trim: Array.from(new Set(data.map(item => item.trim).filter(Boolean))).sort(),
        year: Array.from(new Set(data.map(item => item.year).filter(Boolean))).sort((a, b) => b - a), // Sort years in descending order
    }

    return uniqueValues;
}

export async function fetchFilteredUniqueValues(filters: Partial<{ make: string | null; model: string | null; trim: string | null; year: number | null; }>): Promise<{ make: string[]; model: string[]; trim: string[]; year: number[]; }> {
    let query = supabase
        .from('processed_bot_listings')
        .select('make, model, trim, year')

    if (filters.make) {
        query = query.ilike('make', `${filters.make}`)
    }
    if (filters.model) {
        query = query.ilike('model', `${filters.model}`)
    }
    if (filters.trim) {
        query = query.ilike('trim', `${filters.trim}`)
    }
    if (filters.year !== null) {
        query = query.eq('year', filters.year)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching filtered unique values:', error)
        throw error
    }

    const uniqueValues = {
        make: Array.from(new Set(data.map(item => item.make).filter(Boolean))).sort(),
        model: Array.from(new Set(data.map(item => item.model).filter(Boolean))).sort(),
        trim: Array.from(new Set(data.map(item => item.trim).filter(Boolean))).sort(),
        year: Array.from(new Set(data.map(item => item.year).filter(Boolean))).sort((a, b) => b - a),
    }

    return uniqueValues
}
