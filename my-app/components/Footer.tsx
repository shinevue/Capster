export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-800 shadow-md border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-6 py-4">
                <p className="text-center text-gray-600 dark:text-gray-300">
                    © {new Date().getFullYear()} Car Sales Dashboard. All rights reserved.
                </p>
            </div>
        </footer>
    );
}