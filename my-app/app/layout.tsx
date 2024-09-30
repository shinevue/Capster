import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@radix-ui/themes/styles.css';

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
      <body className="min-h-screen bg-white dark:bg-gray-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            {children}
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
