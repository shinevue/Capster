import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { FilterGrid } from './FilterGrid';
import { CarData, Filters } from '@/types/CarData';

interface MobileFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: Filters;
    onApplyFilters: (filters: Filters) => void;
    includedFilters: (keyof Filters)[];
    data: CarData[];
}

export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
    isOpen,
    onClose,
    filters,
    onApplyFilters,
    includedFilters,
    data
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
                                <Dialog.Title className="text-xl font-bold mb-4">Filters</Dialog.Title>
                                <FilterGrid
                                    data={data}
                                    currentFilters={filters}
                                    onApplyFilters={(newFilters) => {
                                        onApplyFilters(newFilters);
                                        onClose();
                                    }}
                                    includedFilters={includedFilters}
                                />
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