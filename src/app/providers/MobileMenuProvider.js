"use client";

import { createContext, useContext, useState, useCallback } from "react";

const MobileMenuContext = createContext(null);

export function MobileMenuProvider({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = useCallback(
        () => setMobileMenuOpen((prev) => !prev),
        []
    );
    const closeMobileMenu = useCallback(
        () => setMobileMenuOpen(false),
        []
    );
    const openMobileMenu = useCallback(
        () => setMobileMenuOpen(true),
        []
    );

    return (
        <MobileMenuContext.Provider
            value={{
                mobileMenuOpen,
                toggleMobileMenu,
                closeMobileMenu,
                openMobileMenu,
            }}
        >
            {children}
        </MobileMenuContext.Provider>
    );
}

export function useMobileMenu() {
    const ctx = useContext(MobileMenuContext);
    if (!ctx) {
        throw new Error("useMobileMenu must be used within MobileMenuProvider");
    }
    return ctx;
}
