"use client";

import CinematicHero from "./hero_comp/CinematicHero";
import { ReducedMotionHero } from "./hero_comp/ReducedMotionHero";
import useReducedMotion from "@/app/hooks/useReducedMotion";



/*
 * Root hero scene.
 *
 * Chooses the reduced-motion variant when the user prefers
 * reduced motion, otherwise the full cinematic experience.
 */

export default function HeroSection() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <ReducedMotionHero />;
  }

  return <CinematicHero />;
}
