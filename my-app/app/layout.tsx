import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@radix-ui/themes/styles.css';
import { NextUIProvider } from "@nextui-org/react";

export const metadata: Metadata = {
  title: 'Car Sales Dashboard',
  description: 'Explore comprehensive insights into car sales data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen bg-white dark:bg-gray-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextUIProvider>
            <AuthProvider>
              <Header />
              {children}
              <Footer />
            </AuthProvider>
          </NextUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
