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
        'main_image',
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
        'date_sold',
    ];

    const columnDisplayNames: Record<keyof CarData, string> = {
        main_image: 'Image',
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
        date_sold: 'Sold Date',
        source: 'Source',
        drivetrain: 'Drivetrain',
    };

    const sortableColumns: (keyof CarData)[] = [
        'price',
        'year',
        'make',
        'model',
        'trim',
        "date_listed",
        "mileage",
        "date_sold",
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

    const capitalizeFirstLetter = (value: string) => {
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const formatWithCapitalization = <T,>(formatter: (value: T) => React.ReactNode) => (value: T | null) => {
        if (value === null) return "N/A";
        if (typeof value === 'string') {
            return capitalizeFirstLetter(value);
        }
        return formatter(value);
    };
    const formatDefault = formatWithCapitalization((value: any) => String(value));

    const columnWidths: Partial<Record<keyof CarData, string>> = {
        main_image: '100px',
        url: '60px',
        listing_type: '60px',
        price: '100px',
        year: '80px',
        make: '100px',
        model: '100px',
        trim: '100px',
        mileage: '80px',
        exterior_color: '100px',
        interior_color: '100px',
        transmission: '120px',
        date_listed: '120px',
        date_sold: '120px',
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
                    main_image: formatDefault,
                    year: formatDefault,
                    make: formatDefault,
                    model: formatDefault,
                    trim: formatDefault,
                    mileage: formatMileage,
                    exterior_color: formatDefault,
                    interior_color: formatDefault,
                    transmission: formatDefault,
                    drivetrain: formatDefault,
                    date_sold: formatDefault,
                }}
                columnWidths={columnWidths}
            />
        </motion.div>
    );
};