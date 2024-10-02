import { CarData } from '@/types/CarData'
import { supabase } from './supabase-client'

const pageSize = 100

export async function fetchInitialCarData(): Promise<CarData[]> {
    console.log('Fetching initial car data...')
    const { data, error } = await supabase
        .from('processed_bot_listings')
        .select('*')
        .range(0, pageSize - 1)

    if (error) {
        console.error('Error fetching initial car data:', error)
        throw error
    }

    console.log(`Received ${data?.length || 0} initial records`)
    return data as CarData[]
}

export async function fetchAdditionalCarData(page: number): Promise<CarData[]> {
    console.log(`Fetching additional car data (page ${page + 1})...`)
    const { data, error } = await supabase
        .from('processed_bot_listings')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('date_listed', { ascending: false })

    if (error) {
        console.error('Error fetching additional car data:', error)
        throw error
    }

    console.log(`Received ${data?.length || 0} additional records`)
    return data as CarData[] || []
}