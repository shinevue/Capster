import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-6 py-8 text-black">
        <h1 className="text-4xl font-bold mb-6">Welcome to Car Sales Dashboard</h1>
        <p className="mb-4">
          Explore comprehensive insights into car sales data with our interactive dashboard.
        </p>
        <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Go to Dashboard
        </Link>
      </main>
    </div>
  );
}
