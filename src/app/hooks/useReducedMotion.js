"use client";

import { useContext } from "react";
import { MotionContext } from "@/app/providers/MotionProvider";

export default function useReducedMotion() {
    const { prefersReducedMotion } = useContext(MotionContext);

    return prefersReducedMotion;
}