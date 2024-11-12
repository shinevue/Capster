"use client";

import React, { useEffect, useRef, useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useMediaQuery } from 'react-responsive';
import "@/styles/DataTable.css";


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
    const [virtualRows, setVirtualRows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });

    const ITEMS_PER_PAGE = 20;

    const mobileColumns: (keyof CarData)[] = ['main_image', 'make', 'model', 'year', 'price'];

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
                        <b>{title}</b>
                        <ArrowUpDown className={isMobile ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4"} />
                    </Button>
                ) : (
                    <b>{title}</b>
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

        if (column === 'main_image') {
            return {
                ...baseColumnDef,
                header: () => (
                    <b>Image</b>
                ),
                cell: ({ row }: { row: any; }) => {
                    const image = row.original.main_image;
                    return (
                        <div className='w-[75px] h-[50px] rounded flex items-center justify-center mx-auto'>
                            {image ? (
                                <Image
                                    src={imageLoader(image)}
                                    alt={`${row.original.make} ${row.original.model}`}
                                    width={75}
                                    height={50}
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
                                <span className={"text-sm"}>No image</span>
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

    const table = useReactTable({
        data: data,
        columns: tableColumns as ColumnDef<T>[],
        state: {
            sorting,
            columnFilters,
        },
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: (newSorting) => {
            setSorting(newSorting);
            resetVirtualRows();
        },
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: (filters) => {
            setColumnFilters(filters);
            resetVirtualRows();
        },
        getFilteredRowModel: getFilteredRowModel(),
    });

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const resetVirtualRows = () => {
        const { rows } = table.getRowModel();
        setVirtualRows(rows.slice(0, ITEMS_PER_PAGE));
    };

    const fetchMoreData = () => {
        if (isLoading) return;

        setIsLoading(true);
        setTimeout(() => {
            const { rows } = table.getRowModel();
            const startIndex = virtualRows.length;
            const endIndex = Math.min(rows.length, startIndex + ITEMS_PER_PAGE);
            const newItems = rows.slice(startIndex, endIndex);

            if (newItems.length > 0) {
                setVirtualRows(prevData => [...prevData, ...newItems]);
            }
            setIsLoading(false);
        }, 500);
    };

    useEffect(() => {
        resetVirtualRows();
    }, [sorting, columnFilters, data]);

    useEffect(() => {
        const handleScroll = () => {
            if (tableContainerRef.current) {
                const { scrollHeight, scrollTop, clientHeight } = tableContainerRef.current;
                if (scrollHeight - scrollTop - clientHeight < 300 && !isLoading) {
                    fetchMoreData();
                }
            }
        };

        const tableContainer = tableContainerRef.current;
        if (tableContainer) {
            tableContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (tableContainer) {
                tableContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isLoading, virtualRows.length]);

    return (
        <div className="relative" style={{ minHeight: "500px", height: `${data?.length * 50}px`, maxHeight: "1000px" }}>
            <div className="sticky top-0 z-10 bg-background">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={`${isMobile ? "text-xs" : "p-2"} text-center`}
                                        style={{
                                            width: columnWidths[header.column.id as keyof T],
                                            minWidth: columnWidths[header.column.id as keyof T]
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
                </Table>
            </div>
            <div ref={tableContainerRef} style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
                <Table>
                    <TableBody>
                        {virtualRows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell: any) => (
                                    <TableCell
                                        key={cell.id}
                                        className={`${isMobile ? "p-2 text-xs" : ""} text-center`}
                                        style={{
                                            width: columnWidths[cell.column.id as keyof T],
                                            minWidth: columnWidths[cell.column.id as keyof T]
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {isLoading && <div className="text-center py-10 mb-10">Loading more...</div>}
                {virtualRows.length >= table.getRowModel().rows.length && (
                    <p className="text-center py-10 mb-10">No more data to load</p>
                )}
            </div>
        </div>
    );
};

export default DataTable;