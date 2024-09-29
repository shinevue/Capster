import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-6">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-lg md:text-2xl font-bold text-gray-800">
                        Car Sales Dashboard
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-gray-600 hover:text-gray-800">
                            Home
                        </Link>
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}