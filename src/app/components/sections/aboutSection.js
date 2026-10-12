"use client";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import AboutContent from "./about_comp/AboutContent";
import AboutReduced from "./about_comp/AboutReduced";

export default function About() {
    const reducedMotion = useReducedMotion();

    if (reducedMotion) {
        return <AboutReduced />;
    }

    return <AboutContent />;
}