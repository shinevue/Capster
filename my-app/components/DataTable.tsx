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

interface DataTableProps {
    data: CarData[];
    columns: (keyof CarData)[];
    sortableColumns: (keyof CarData)[];
    imageLoader: (src: string) => string;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, sortableColumns, imageLoader }) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const isMobile = useMediaQuery({ maxWidth: 767 });

    const mobileColumns: (keyof CarData)[] = ['image', 'make', 'model', 'year', 'price'];

    const tableColumns: ColumnDef<CarData>[] = (isMobile ? mobileColumns : columns).map(column => {
        if (column === 'image') {
            return {
                accessorKey: "image",
                header: "Image",
                cell: ({ row }) => {
                    const image = row.original.image;
                    return (
                        <div className={`${isMobile ? 'w-[100px] h-[80px]' : 'w-[250px] h-[200px]'} rounded flex items-center justify-center`}>
                            {image ? (
                                <Image
                                    src={imageLoader(image)}
                                    alt={`${row.original.make} ${row.original.model}`}
                                    width={isMobile ? 100 : 250}
                                    height={isMobile ? 80 : 200}
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
        const isSortable = sortableColumns.includes(column);
        return {
            accessorKey: column,
            header: ({ column: tableColumn }) => {
                const title = column.toString().charAt(0).toUpperCase() + column.toString().slice(1).replace(/_/g, ' ');
                return isSortable ? (
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
        getPaginationRowModel: isMobile ? getPaginationRowModel() : undefined,
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

    const swipeableProps = isMobile ? handlers : {};

    return (
        <div className="overflow-x-auto" {...swipeableProps}>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className={isMobile ? "text-xs" : "p-2"}>
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
                                        <TableCell key={cell.id} className={isMobile ? "p-2 text-xs" : ""}>
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
            {isMobile && (
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
            )}
        </div>
    );
};

export default DataTable;