"use client";

import SmoothScroll from "@/app/lib/lenis/SmoothScroll";
import { PageLoaderProvider } from "@/app/providers/PageLoaderProvider";
import MotionProvider from "./MotionProvider";
import { MobileMenuProvider } from "./MobileMenuProvider";

export default function AppProviders({ children }) {
    return (
        <MobileMenuProvider>
            <MotionProvider>
                <SmoothScroll>
                    <PageLoaderProvider>
                        {children}
                    </PageLoaderProvider>
                </SmoothScroll>
            </MotionProvider>
        </MobileMenuProvider>
    );
}
