"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

function StaticSphereArtwork() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(ellipse_at_50%_48%,var(--brand-soft),transparent_70%)] opacity-55 dark:opacity-[0.035]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/20 bg-[radial-gradient(circle_at_34%_28%,rgba(116,205,194,0.18),rgba(15,65,60,0.10)_44%,transparent_72%)] shadow-[inset_-18px_-14px_42px_rgba(0,0,0,0.24),0_0_58px_rgba(30,130,120,0.08)] dark:bg-[radial-gradient(circle_at_34%_28%,rgba(55,110,101,0.08),rgba(4,18,14,0.12)_44%,transparent_72%)] dark:shadow-[inset_-18px_-14px_42px_rgba(0,0,0,0.34),0_0_58px_rgba(3,18,13,0.04)]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 [background-image:radial-gradient(circle,rgba(116,205,194,0.72)_0.8px,transparent_1.4px)] [background-size:8px_8px] [mask-image:radial-gradient(circle,black_40%,transparent_72%)]" />
      <div className="absolute left-1/2 top-1/2 aspect-[1.6/1] w-[88%] -translate-x-1/2 -translate-y-1/2 rotate-[-22deg] rounded-[50%] border border-brand/15" />
      <div className="absolute left-1/2 top-1/2 aspect-[1.8/1] w-[96%] -translate-x-1/2 -translate-y-1/2 rotate-[28deg] rounded-[50%] border border-brand/10" />
    </div>
  );
}

const LabsParticleSphere = dynamic(
  () => import("./particle-sphere/LabsParticleSphere"),
  {
    ssr: false,
    loading: () => <StaticSphereArtwork />,
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
      <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(ellipse_at_50%_48%,var(--brand-soft),transparent_70%)] opacity-55 dark:opacity-[0.035]" />
      <div className="pointer-events-none absolute left-[22%] top-[20%] h-[18%] w-[18%] rounded-full bg-brand/[0.06] blur-3xl dark:bg-[#030b08]/[0.018]" />
      <div className="pointer-events-none absolute bottom-[16%] right-[14%] h-[23%] w-[23%] rounded-full bg-brand/[0.06] blur-3xl dark:bg-[#030b08]/[0.018]" />

      {reducedMotion || !isInView ? (
        <StaticSphereArtwork />
      ) : (
        <LabsParticleSphere />
      )}
    </figure>
  );
}
