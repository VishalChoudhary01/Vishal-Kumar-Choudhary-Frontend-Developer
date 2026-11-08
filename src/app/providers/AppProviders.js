"use client";

import SmoothScroll from "@/app/lib/lenis/SmoothScroll";
import { PageLoaderProvider } from "@/app/providers/PageLoaderProvider";
import MotionProvider from "./MotionProvider";
import { MobileMenuProvider } from "./MobileMenuProvider";
import { ActionToastProvider } from "./ActionToastProvider";

export default function AppProviders({ children }) {
    return (
        <ActionToastProvider>
            <MobileMenuProvider>
                <MotionProvider>
                    <SmoothScroll>
                        <PageLoaderProvider>
                            {children}
                        </PageLoaderProvider>
                    </SmoothScroll>
                </MotionProvider>
            </MobileMenuProvider>
        </ActionToastProvider>
    );
}
