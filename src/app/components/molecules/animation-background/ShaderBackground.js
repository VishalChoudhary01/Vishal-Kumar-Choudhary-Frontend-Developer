"use client";

import React, { useEffect, useRef, useCallback } from "react";
import useDarkMode from "@/app/hooks/useDarkMode";

export default function GridBackground() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { isDarkMode } = useDarkMode();

  const getPalette = useCallback(() => {
    return isDarkMode
      ? {
          bg: "#050505",
          grid: "rgba(255,255,255,0.08)",
        }
      : {
          bg: "#ffffff",
          grid: "rgba(0,0,0,0.06)",
        };
  }, [isDarkMode]);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = container.getBoundingClientRect();

    canvas.width = width;
    canvas.height = height;

    const { bg, grid } = getPalette();
    const gridSize = 30;

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Parse grid color to get RGB values
    const gridMatch = grid.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
    if (!gridMatch) return;
    
    const r = gridMatch[1];
    const g = gridMatch[2];
    const b = gridMatch[3];
    const baseAlpha = parseFloat(gridMatch[4]);

    // Draw vertical lines with base opacity
    ctx.strokeStyle = grid;
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    
    for (let y = 0; y <= height; y += gridSize) {
      const alphaMultiplier = 1.2; 
      const horizontalAlpha = Math.min(baseAlpha * alphaMultiplier, 1);
      
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${horizontalAlpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [getPalette]);

  // Draw on mount + theme change
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Redraw on resize
  useEffect(() => {
    const onResize = () => drawGrid();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawGrid]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}