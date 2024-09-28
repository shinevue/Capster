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

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DataTableProps {
    data: CarData[];
    columns: (keyof CarData)[];
    sortableColumns: (keyof CarData)[];
    imageLoader: (src: string) => string;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, sortableColumns, imageLoader }) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [date, setDate] = React.useState<Date | undefined>(undefined);

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
                            width={200}
                            height={200}
                            className="object-cover rounded"
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

    React.useEffect(() => {
        console.log("Date changed:", date);
        if (date) {
            const formattedDate = format(date, 'MM-dd-yyyy');
            console.log("Formatted date:", formattedDate);
            table.getColumn('date_listed')?.setFilterValue(formattedDate);
        } else {
            console.log("Date filter cleared");
            table.getColumn('date_listed')?.setFilterValue(undefined);
        }
    }, [date, table]);

    return (
        <div>
            <div className="flex items-center py-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                                console.log("New date selected:", newDate);
                                setDate(newDate);
                            }}
                            initialFocus
                            className={cn(
                                "rounded-md border bg-white",
                                "dark:bg-gray-800 dark:text-white dark:border-gray-700"
                            )}
                        />
                    </PopoverContent>
                </Popover>
                <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                        console.log("Reset Date button clicked");
                        setDate(undefined);
                    }}
                >
                    Reset Date
                </Button>
            </div>

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