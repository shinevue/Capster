import { Suspense } from 'react';
import { fetchInitialCarData } from '@/lib/carData';
import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./DashboardClient'), {
    loading: () => <p>Loading dashboard...</p>,
});

export default async function DashboardPage() {
    const initialData = await fetchInitialCarData();

    return (
        <Suspense fallback={<p>Loading dashboard...</p>}>
            <DashboardClient initialCarData={initialData} />
        </Suspense>
    );
}