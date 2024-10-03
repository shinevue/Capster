import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
    supabaseUrl, 
    supabaseAnonKey,
    {
        global: {
          fetch: (url: any, options = {}) => {
            return fetch(url, { ...options, cache: 'no-store' });
          }
        }
    }
);

// Add this function to get the current session
export const getCurrentSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error getting session:', error);
        return null;
    }
    return data.session;
};