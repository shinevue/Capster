import React from 'react';

interface KPICardsProps {
    dollarChange: number;
    totalListings: number;
    averageDaysOnMarket: number;
    averagePrice: number;
}

const KPICards: React.FC<KPICardsProps> = ({ dollarChange, totalListings, averageDaysOnMarket, averagePrice }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">$ Change</h3>
                <p className="text-2xl font-bold text-green-400">${dollarChange.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Listings</h3>
                <p className="text-2xl font-bold text-blue-400">{totalListings.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Avg Days on Market</h3>
                <p className="text-2xl font-bold text-purple-400">{averageDaysOnMarket.toFixed(1)}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Average Price</h3>
                <p className="text-2xl font-bold text-yellow-400">${averagePrice.toLocaleString()}</p>
            </div>
        </div>
    );
};

export default KPICards;