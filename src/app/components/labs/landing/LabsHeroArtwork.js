"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import StaticParticleSphereArtwork from "./particle-sphere/StaticParticleSphereArtwork";

const LabsParticleSphere = dynamic(
  () => import("./particle-sphere/LabsParticleSphere"),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function LabsHeroArtwork() {
  const artworkRef = useRef(null);
  const isInView = useInView(artworkRef, {
    once: true,
    margin: "140px 0px",
  });
  const reducedMotion = useReducedMotion();
  const [webglReady, setWebglReady] = useState(false);
  const handleRendererStateChange = useCallback((ready) => {
    setWebglReady(Boolean(ready));
  }, []);

  return (
    <figure
      ref={artworkRef}
      aria-hidden="true"
      className="relative isolate mx-auto aspect-[1.08/1] min-h-[280px] w-full max-w-[39rem] overflow-hidden"
    >
      <StaticParticleSphereArtwork
        className={webglReady && !reducedMotion ? "opacity-0" : "opacity-100"}
      />
      {!reducedMotion && isInView ? (
        <LabsParticleSphere onRendererStateChange={handleRendererStateChange} />
      ) : null}
    </figure>
  );
}
