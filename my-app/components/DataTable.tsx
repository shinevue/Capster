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
                    return (
                        <div className="w-[250px] h-[200px] rounded flex items-center justify-center">
                            {image ? (
                                <Image
                                    src={imageLoader(image)}
                                    alt={`${row.original.make} ${row.original.model}`}
                                    width={250}
                                    height={200}
                                    className="rounded"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextSibling.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <div className="text-gray-500" style={{ display: image ? 'none' : 'block' }}>
                                <span className="text-lg">No image found</span>
                            </div>
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
            cell: ({ getValue }) => {
                const value = getValue() as string;
                if (column === 'url') {
                    return (
                        <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {value}
                        </div>
                    );
                }
                return value;
            },
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