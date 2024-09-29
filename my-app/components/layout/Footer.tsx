export default function Footer() {
    return (
        <footer className="bg-white shadow-md">
            <div className="container mx-auto px-6 py-3">
                <p className="text-center text-gray-600">
                    © {new Date().getFullYear()} Car Sales Dashboard. All rights reserved.
                </p>
            </div>
        </footer>
    );
}