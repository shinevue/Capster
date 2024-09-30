import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { ChartToggleButton } from './chartToggleButton';
import { FaChartLine, FaChartBar, FaTable } from 'react-icons/fa';

interface MobileChartSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showLineChart: boolean;
    showScatterChart: boolean;
    showDataTable: boolean;
    onToggleLineChart: () => void;
    onToggleScatterChart: () => void;
    onToggleDataTable: () => void;
}

export const MobileChartSettingsModal: React.FC<MobileChartSettingsModalProps> = ({
    isOpen,
    onClose,
    showLineChart,
    showScatterChart,
    showDataTable,
    onToggleLineChart,
    onToggleScatterChart,
    onToggleDataTable
}) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <AnimatePresence>
                {isOpen && (
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
                                className="fixed top-0 right-0 h-full w-full max-w-sm bg-white p-6 shadow-xl overflow-y-auto"
                            >
                                <Dialog.Title className="text-xl font-bold mb-4">Chart Settings</Dialog.Title>
                                <div className="flex flex-col space-y-4">
                                    <ChartToggleButton
                                        icon={<FaChartLine />}
                                        label="Line Chart"
                                        isActive={showLineChart}
                                        onClick={onToggleLineChart}
                                        color="bg-blue-500"
                                    />
                                    <ChartToggleButton
                                        icon={<FaChartBar />}
                                        label="Scatter Chart"
                                        isActive={showScatterChart}
                                        onClick={onToggleScatterChart}
                                        color="bg-blue-500"
                                    />
                                    <ChartToggleButton
                                        icon={<FaTable />}
                                        label="Data Table"
                                        isActive={showDataTable}
                                        onClick={onToggleDataTable}
                                        color="bg-blue-500"
                                    />
                                </div>
                                <Dialog.Close asChild>
                                    <button className="mt-4 p-2 px-6 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200">Close</button>
                                </Dialog.Close>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
};