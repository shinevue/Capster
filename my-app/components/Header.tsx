"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, HomeIcon } from "@heroicons/react/24/solid";
import { Squares2X2Icon as DashboardIcon } from "@heroicons/react/24/solid";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              Car Sales Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* {pathname !== "/dashboard" ? (
                  <Link href={"/dashboard"}>
                    <motion.button
                      className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <DashboardIcon className="sm2:h-4 sm2:w-4 sm3:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </motion.button>
                  </Link>
                ) : (
                  <Link href={"/"}>
                    <motion.button
                      className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <HomeIcon className="sm2:h-4 sm2:w-4 sm3:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Home</span>
                    </motion.button>
                  </Link>
                )} */}
                <Link href={"/dashboard"}>
                  <motion.button
                    className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <DashboardIcon className="sm2:h-4 sm2:w-4 sm3:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </motion.button>
                </Link>

                <UserMenu />
              </>
            ) : (
              <>
                <motion.button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-5 w-5 text-foreground" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-foreground" />
                  )}
                </motion.button>
                <Link href="/login">
                  <motion.button
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
