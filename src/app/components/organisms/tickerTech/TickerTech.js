"use client";
import React from "react";
import TickerTrack from "./TickerTrack";

const TickerTech = () => {
  return (
    <section className=" bg-contextBG dark:bg-contextDarkBG">

      <div className="w-full">
        

        {/* Carousel */}
        <div className="w-full md:py-8 py-3 relative overflow-hidden">
          {/* Gradient overlays */}
          <div className="absolute top-0 left-0 h-full w-14 md:w-64 z-20 pointer-events-none bg-linear-to-r from-contextBG via-contextBG/50 to-transparent dark:from-contextDarkBG dark:via-contextDarkBG/50 dark:to-transparent" />
          <div className="absolute top-0 right-0 h-full w-14 md:w-64 z-20 pointer-events-none bg-linear-to-l from-contextBG via-contextBG/50 to-transparent dark:from-contextDarkBG dark:via-contextDarkBG/50 dark:to-transparent" />

          {/* Scrolling track (moved to its own component) */}
          <TickerTrack />
        </div>
      </div>
    </section>
  );
};

export default TickerTech;
