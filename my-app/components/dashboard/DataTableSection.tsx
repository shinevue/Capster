import React from 'react';
import DataTable from "@/components/DataTable";
import { CarData } from '@/types/CarData';
import { motion } from 'framer-motion';

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
        "date_listed"
    ];

    const formatPrice = (price: number) => {
        return `${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
    };

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
                    price: formatPrice
                }}
            />
        </motion.div>
    );
};