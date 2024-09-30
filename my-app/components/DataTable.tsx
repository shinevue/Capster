"use client";

import React, { useState } from 'react';
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
    getPaginationRowModel,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from 'react-responsive';
import { useSwipeable } from 'react-swipeable';

interface DataTableProps<T> {
    data: T[];
    columns: (keyof T)[];
    columnDisplayNames: Record<keyof T, string>;
    sortableColumns: (keyof T)[];
    imageLoader: (src: string) => string;
    formatters: Record<keyof T, (value: any) => React.ReactNode>;
    columnWidths: Partial<Record<keyof T, string>>;
}

const DataTable = <T extends Record<string, any>>({
    data,
    columns,
    columnDisplayNames,
    sortableColumns,
    imageLoader,
    formatters,
    columnWidths
}: DataTableProps<T>) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const isMobile = useMediaQuery({ maxWidth: 767 });

    const mobileColumns: (keyof CarData)[] = ['image', 'make', 'model', 'year', 'price'];

    const tableColumns: ColumnDef<CarData>[] = (isMobile ? mobileColumns : columns).map(column => {
        const baseColumnDef = {
            accessorKey: column as string,
            header: ({ column: tableColumn }: { column: any; }) => {
                const title = columnDisplayNames[column];
                return sortableColumns.includes(column) ? (
                    <Button
                        variant="ghost"
                        onClick={() => tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc")}
                        className={isMobile ? "p-1 text-xs" : ""}
                    >
                        {title}
                        <ArrowUpDown className={isMobile ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4"} />
                    </Button>
                ) : (
                    title
                );
            },
            enableSorting: sortableColumns.includes(column),
            cell: ({ getValue }: { getValue: () => any; }) => {
                const value = getValue();
                const formattedValue = formatters[column] ? formatters[column](value) : value;
                return (
                    <div className="text-wrap" style={{ maxWidth: '100%' }}>
                        {formattedValue}
                    </div>
                );
            },
        };

        if (column === 'image') {
            return {
                ...baseColumnDef,
                header: "Image",
                cell: ({ row }: { row: any; }) => {
                    const image = row.original.image;
                    return (
                        <div className={`${isMobile ? 'w-[100px] h-[80px]' : 'w-[150px] h-[120px]'} rounded flex items-center justify-center`}>
                            {image ? (
                                <Image
                                    src={imageLoader(image)}
                                    alt={`${row.original.make} ${row.original.model}`}
                                    width={isMobile ? 100 : 150}
                                    height={isMobile ? 80 : 100}
                                    className="rounded object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const nextSibling = e.currentTarget.nextSibling as HTMLElement;
                                        if (nextSibling) {
                                            nextSibling.style.display = 'block';
                                        }
                                    }}
                                />
                            ) : null}
                            <div className="text-gray-500" style={{ display: image ? 'none' : 'block' }}>
                                <span className={isMobile ? "text-sm" : "text-lg"}>No image</span>
                            </div>
                        </div>
                    );
                },
            };
        }

        return {
            ...baseColumnDef,
            size: columnWidths[column] ? parseInt(columnWidths[column] as string) : undefined,
        };
    });

    const renderCell = (item: CarData, column: keyof CarData) => {
        const value = item[column];

        if (formatters && formatters[column]) {
            return formatters[column](value);
        }

        return value;
    };

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const handlers = useSwipeable({
        onSwipedLeft: () => table.nextPage(),
        onSwipedRight: () => table.previousPage(),
        trackMouse: true
    });

    return (
        <div {...handlers}>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={`${isMobile ? "text-xs" : "p-2"}`}
                                        style={{
                                            width: columnWidths[header.id as keyof T],
                                            minWidth: columnWidths[header.id as keyof T]
                                        }}
                                    >
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
                                            key={cell.id}
                                            className={`${isMobile ? "p-2 text-xs" : ""}`}
                                            style={{
                                                width: columnWidths[cell.column.id as keyof T],
                                                minWidth: columnWidths[cell.column.id as keyof T]
                                            }}
                                        >
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
            <div className="flex justify-between items-center mt-4">
                <Button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <span className="text-sm text-gray-700">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default DataTable;