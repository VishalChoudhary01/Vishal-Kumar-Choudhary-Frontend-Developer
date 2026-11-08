"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import StaticParticleSphereArtwork from "./particle-sphere/StaticParticleSphereArtwork";

const LabsParticleSphere = dynamic(
  () => import("./particle-sphere/LabsParticleSphere"),
  {
    ssr: false,
    loading: () => <StaticParticleSphereArtwork />,
  },
);

export default function LabsHeroArtwork() {
  const artworkRef = useRef(null);
  const isInView = useInView(artworkRef, {
    once: true,
    margin: "140px 0px",
  });
  const reducedMotion = useReducedMotion();

  return (
    <figure
      ref={artworkRef}
      aria-hidden="true"
      className="relative isolate mx-auto aspect-[1.08/1] min-h-[280px] w-full max-w-[39rem] overflow-hidden"
    >
      {reducedMotion || !isInView ? (
        <StaticParticleSphereArtwork />
      ) : (
        <LabsParticleSphere />
      )}
    </figure>
  );
}
