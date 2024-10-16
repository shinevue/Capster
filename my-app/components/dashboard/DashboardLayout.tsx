import React from 'react';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full flex flex-col text-gray-800 dark:text-gray-200 overflow-hidden mt-4 md:mt-0"
        >
            <main className="flex-grow flex flex-col overflow-hidden relative">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white dark:bg-gray-900 p-2 md:p-10 w-full h-full flex flex-col overflow-hidden md:w-[90%] md:mx-auto"
                >
                    {children}
                </motion.div>
            </main>
        </motion.div>
    );
};