import './globals.css';
import './themes.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import '@radix-ui/themes/styles.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
    <html lang="en">
      <body>
        <ThemeProvider>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
