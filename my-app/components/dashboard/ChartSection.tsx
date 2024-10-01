import React from 'react';
import { LineChartComponent } from "@/components/charts/LineChart";
import { ScatterChartComponent } from "@/components/charts/ScatterChart";
import { CarData } from '@/types/CarData';
import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer-motion';
import { ChartToggleButton } from '@/components/chartToggleButton';
import { FaChartLine, FaChartBar, FaTable, FaCog } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence } from 'framer-motion';

interface ChartSectionProps {
    filteredData: CarData[];
    filters: {
        startDate: Date | null;
        endDate: Date | null;
    };
    imageLoader: (src: string) => string;
}

export const ChartSection: React.FC<ChartSectionProps> = ({ filteredData, filters, imageLoader }) => {
    const [showLineChart, setShowLineChart] = React.useState(true);
    const [showScatterChart, setShowScatterChart] = React.useState(true);
    const [showDataTable, setShowDataTable] = React.useState(true);
    const [isChartSettingsOpen, setIsChartSettingsOpen] = React.useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });

    return (
        <div className="mb-16"  >
            {isMobile ? (
                <Dialog.Root open={isChartSettingsOpen} onOpenChange={setIsChartSettingsOpen}>
                    <Dialog.Trigger asChild>
                        <button
                            className="fixed right-4 top-36 z-50 p-3 bg-blue-500 dark:bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                            aria-label="Chart settings"
                        >
                            <FaCog size={20} />
                        </button>
                    </Dialog.Trigger>
                    <AnimatePresence>
                        {isChartSettingsOpen && (
                            <Dialog.Portal forceMount>
                                <Dialog.Overlay asChild>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black bg-opacity-50"
                                    />
                                </Dialog.Overlay>
                                <Dialog.Content asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, x: "100%" }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, x: "100%" }}
                                        transition={{ duration: 0.2 }}
                                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 p-6 shadow-xl overflow-y-auto"
                                    >
                                        <Dialog.Title className="text-xl font-bold mb-4 dark:text-gray-200">Chart Settings</Dialog.Title>
                                        <div className="flex flex-col space-y-4">
                                            <ChartToggleButton
                                                icon={<FaChartLine />}
                                                label="Line Chart"
                                                isActive={showLineChart}
                                                onClick={() => setShowLineChart(!showLineChart)}
                                                color="bg-blue-500 dark:bg-blue-600"
                                            />
                                            <ChartToggleButton
                                                icon={<FaChartBar />}
                                                label="Scatter Chart"
                                                isActive={showScatterChart}
                                                onClick={() => setShowScatterChart(!showScatterChart)}
                                                color="bg-blue-500 dark:bg-blue-600"
                                            />
                                            <ChartToggleButton
                                                icon={<FaTable />}
                                                label="Data Table"
                                                isActive={showDataTable}
                                                onClick={() => setShowDataTable(!showDataTable)}
                                                color="bg-blue-500 dark:bg-blue-600"
                                            />
                                        </div>
                                        <Dialog.Close asChild>
                                            <button className="mt-4 p-2 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">Close</button>
                                        </Dialog.Close>
                                    </motion.div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        )}
                    </AnimatePresence>
                </Dialog.Root>
            ) : (
                <div className="mb-8 flex flex-wrap gap-4 justify-center">
                    <ChartToggleButton
                        icon={<FaChartLine />}
                        label="Line Chart"
                        isActive={showLineChart}
                        onClick={() => setShowLineChart(!showLineChart)}
                        color="bg-blue-500 dark:bg-blue-600"
                    />
                    <ChartToggleButton
                        icon={<FaChartBar />}
                        label="Scatter Chart"
                        isActive={showScatterChart}
                        onClick={() => setShowScatterChart(!showScatterChart)}
                        color="bg-blue-500 dark:bg-blue-600"
                    />
                    <ChartToggleButton
                        icon={<FaTable />}
                        label="Data Table"
                        isActive={showDataTable}
                        onClick={() => setShowDataTable(!showDataTable)}
                        color="bg-blue-500 dark:bg-blue-600"
                    />
                </div>
            )}

            <div className="flex flex-col space-y-20  px-1 md:px-0">
                {showLineChart && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className={`bg-white dark:bg-gray-800 rounded-sm shadow-md ${isMobile ? "w-full" : "p-6"}`}
                    >
                        <LineChartComponent
                            data={filteredData}
                            onTimeSelection={() => { }}
                            onDataSelection={() => { }}
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                        />
                    </motion.div>
                )}
                {showScatterChart && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className={`bg-white dark:bg-gray-800 rounded-sm shadow-md ${isMobile ? "w-full" : "p-6"}`}
                    >
                        <ScatterChartComponent
                            data={filteredData}
                            onTimeSelection={() => { }}
                            onDataSelection={() => { }}
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            imageLoader={imageLoader}
                        />
                    </motion.div>
                )}
            </div>

        </div>
    );
};