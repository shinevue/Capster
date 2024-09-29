import React from 'react';
import { motion } from "framer-motion";

// Add this new component at the end of the file
interface ChartToggleButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    color: string;
}

export const ChartToggleButton: React.FC<ChartToggleButtonProps> = ({ icon, label, isActive, onClick, color }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${isActive
                    ? `${color} text-white`
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
        >
            {icon}
            <span>{label}</span>
        </motion.button>
    );
};