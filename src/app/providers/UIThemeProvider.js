"use client";

import { ThemeProvider } from "next-themes";

export function UIThemeProvider({
    children,
}) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
        >
            {children}
        </ThemeProvider>
    );
}