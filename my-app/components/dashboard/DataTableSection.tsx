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

    const columnDisplayNames: Record<keyof CarData, string> = {
        image: 'Image',
        url: 'URL',
        listing_type: 'Type',
        price: 'Price',
        year: 'Year',
        make: 'Make',
        model: 'Model',
        trim: 'Trim',
        mileage: 'Mileage',
        exterior_color: 'Ext Color',
        interior_color: 'Int Color',
        transmission: 'Transmission',
        date_listed: 'Listed Date',
        source: 'Source',
        drivetrain: 'Drivetrain',
        photos: 'Photos',
        sold_date: 'Sold Date',
    };

    const sortableColumns: (keyof CarData)[] = [
        'price',
        'year',
        'make',
        'model',
        'trim',
        "date_listed",
        "mileage"
    ];

    const formatWithNA = <T,>(formatter: (value: T) => React.ReactNode) => (value: T | null) => {
        return value === null ? "N/A" : formatter(value);
    };

    const formatPrice = formatWithNA((price: number) => {
        return `${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
    });

    const formatUrl = formatWithNA((url: string) => (
        <Link href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Link
        </Link>
    ));

    const formatMileage = formatWithNA((mileage: number) => {
        return `${mileage.toLocaleString('en-US')} mi`;
    });

    const formatDefault = formatWithNA((value: any) => String(value));

    const columnWidths: Partial<Record<keyof CarData, string>> = {
        image: '150px',
        url: '100px',
        listing_type: '100px',
        price: '100px',
        year: '80px',
        make: '100px',
        model: '100px',
        trim: '100px',
        mileage: '100px',
        exterior_color: '100px',
        interior_color: '100px',
        transmission: '120px',
        date_listed: '120px',
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
                columnDisplayNames={columnDisplayNames}
                sortableColumns={sortableColumns}
                imageLoader={imageLoader}
                formatters={{
                    price: formatPrice,
                    url: formatUrl,
                    source: formatDefault,
                    date_listed: formatDefault,
                    listing_type: formatDefault,
                    image: formatDefault,
                    year: formatDefault,
                    make: formatDefault,
                    model: formatDefault,
                    trim: formatDefault,
                    mileage: formatMileage,
                    exterior_color: formatDefault,
                    interior_color: formatDefault,
                    transmission: formatDefault,
                    drivetrain: formatDefault,
                    photos: formatDefault,
                    sold_date: formatDefault,
                }}
                columnWidths={columnWidths}
            />
        </motion.div>
    );
};