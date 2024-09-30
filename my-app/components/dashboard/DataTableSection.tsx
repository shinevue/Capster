import React from 'react';
import DataTable from "@/components/DataTable";
import { CarData } from '@/types/CarData';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Add this import

interface DataTableSectionProps {
    filteredData: CarData[];
    imageLoader: (src: string) => string;
    showDataTable: boolean;
}

export const DataTableSection: React.FC<DataTableSectionProps> = ({ filteredData, imageLoader, showDataTable }) => {
    const tableColumns: (keyof CarData)[] = [
        'image',
        'url',
        "listing_type",
        'price',
        'year',
        'make',
        'model',
        'trim',
        'mileage',
        'exterior_color',
        'interior_color',
        'transmission',
        'date_listed',
    ];

    const sortableColumns: (keyof CarData)[] = [
        'price',
        'year',
        'make',
        'model',
        "date_listed",
        "mileage"
    ];

    const formatPrice = (price: number) => {
        return `${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
    };

    const formatUrl = (url: string) => (
        <Link href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            View Listing
        </Link>
    );

    if (!showDataTable) return null;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex-grow overflow-auto"
        >
            <DataTable
                data={filteredData}
                columns={tableColumns}
                sortableColumns={sortableColumns}
                imageLoader={imageLoader}
                formatters={{
                    price: formatPrice,
                    url: formatUrl
                }}
            />
        </motion.div>
    );
};