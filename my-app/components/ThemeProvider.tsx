import { Theme } from '@radix-ui/themes';

export function ThemeProvider({ children }: { children: React.ReactNode; }) {
    return <Theme>{children}</Theme>;
}