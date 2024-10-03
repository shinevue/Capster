import { CarData } from '@/types/CarData'
import { supabase } from './supabase-client'


const pageSize = 1000
const parallelFetchCount = 10

// Helper function to convert string fields to lowercase
function convertToLowerCase(obj: any): any {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = typeof obj[key] === 'string' ? obj[key].toLowerCase() : obj[key];
    return acc;
  }, {} as any);
}

export async function fetchCarDataByFilters(make: string, model: string, trim: string, year: number | null): Promise<CarData[]> {
    console.log('Starting fetchCarDataByFilters with filters:', { make, model, trim, year });

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

    console.log('Total count:', count);

    if (!count) {
        console.log('No results found, returning empty array');
        return [];
    }

    // Calculate the number of pages
    const totalPages = Math.ceil(count / pageSize);
    console.log('Total pages:', totalPages);

    // Create an array of page numbers
    const pages = Array.from({ length: totalPages }, (_, i) => i);

    // Function to fetch a single page
    const fetchPage = async (page: number): Promise<CarData[]> => {
        console.log(`Fetching page ${page + 1} of ${totalPages}`);
        const { data, error } = await query
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .order('id', { ascending: true });

        if (error) {
            console.error(`Error fetching car data for page ${page + 1}:`, error)
            throw error
        }

        console.log(`Received ${data?.length || 0} results for page ${page + 1}`);
        return (data as CarData[] || []).map(convertToLowerCase);
    }

    // Fetch data in parallel
    const allData: CarData[] = [];
    for (let i = 0; i < totalPages; i += parallelFetchCount) {
        console.log(`Starting parallel fetch for pages ${i + 1} to ${Math.min(i + parallelFetchCount, totalPages)}`);
        const pagePromises = pages.slice(i, i + parallelFetchCount).map(fetchPage);
        const results = await Promise.all(pagePromises);
        const flatResults = results.flat();
        console.log(`Received ${flatResults.length} results in this batch`);
        allData.push(...flatResults);
    }

    console.log(`Fetched a total of ${allData.length} results`);
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

    console.log("filters", filters)

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

    console.log("query", query)

    const { data, error } = await query

    console.log("data", data)

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

    console.log("uniqueValues", uniqueValues)

    return uniqueValues
}
