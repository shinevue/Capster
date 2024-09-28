"use client";

import React from 'react';
import Image from 'next/image';
import { CarData } from '@/types/CarData';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface DataTableProps {
    data: CarData[];
    columns: (keyof CarData)[];
    sortableColumns: (keyof CarData)[];
    imageLoader: (src: string) => string;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, sortableColumns, imageLoader }) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const tableColumns: ColumnDef<CarData>[] = columns.map(column => {
        if (column === 'image') {
            return {
                accessorKey: "image",
                header: "Image",
                cell: ({ row }) => {
                    const image = row.original.image;
                    return image ? (
                        <Image
                            src={imageLoader(image)}
                            alt={`${row.original.make} ${row.original.model}`}
                            width={300}
                            height={200}
                            className="rounded"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded flex items-center justify-center text-gray-500 mx-auto">
                            <span className="text-lg mx-auto">No image</span>
                        </div>
                    );
                },
            };
        }
        const isSortable = sortableColumns.includes(column);
        return {
            accessorKey: column,
            header: ({ column: tableColumn }) => {
                const title = column.toString().charAt(0).toUpperCase() + column.toString().slice(1).replace(/_/g, ' ');
                return isSortable ? (
                    <Button
                        variant="ghost"
                        onClick={() => tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc")}
                    >
                        {title}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    title
                );
            },
            enableSorting: isSortable,
        };
    });

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            className='py-4'
                                            key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default DataTable;