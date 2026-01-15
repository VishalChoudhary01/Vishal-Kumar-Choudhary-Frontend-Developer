"use client";
import React, { useEffect, useRef, useState } from "react";
import TickerItem from "./TickerItem";
import {techTickerItems} from '@/app/lib/data/index'

const TRIPLET_COPIES = 4; // Increased to 4 for smoother looping

const TickerTrack = () => {
  const scrollerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  const duplicatedTechStack = Array(TRIPLET_COPIES).fill(techTickerItems).flat();

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const scroller = scrollerRef.current;
    if (!scroller || !scroller.firstChild) return;

    const cardStyle = window.getComputedStyle(scroller.firstChild);
    const cardWidth =
      scroller.firstChild.offsetWidth +
      parseFloat(cardStyle.marginLeft) +
      parseFloat(cardStyle.marginRight);

    scroller.style.width = `${cardWidth * techTickerItems.length * TRIPLET_COPIES}px`;

    let animationId;
    let scrollPosition = 0;
    
    // Slower speed for smoother animation
    const speed = 0.3;
    const singleSetWidth = cardWidth * techTickerItems.length;

    // Start from the middle set to allow seamless looping in both directions
    scrollPosition = -singleSetWidth;
    
    const animate = () => {
      scrollPosition -= speed;
      
      // Reset position when we've scrolled past 2 sets
      // This creates seamless infinite scroll
      if (Math.abs(scrollPosition) >= singleSetWidth * 2) {
        scrollPosition = -singleSetWidth;
      }
      
      scroller.style.transform = `translateX(${scrollPosition}px)`;
      animationId = requestAnimationFrame(animate);
    };

    const startDelay = setTimeout(() => {
      // Set initial position before starting animation
      scroller.style.transform = `translateX(${scrollPosition}px)`;
      animationId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(startDelay);
      cancelAnimationFrame(animationId);
    };
  }, [isMounted]);

  return (
    <div
      ref={scrollerRef}
      className="flex will-change-transform"
      style={!isMounted ? { transform: "translateX(0)" } : {}}
    >
      {duplicatedTechStack.map((tech, index) => (
        <TickerItem
          key={`${tech.name}-${index}`}
          tech={tech}
          index={index}
          techStackLength={techTickerItems.length}
          isMounted={isMounted}
        />
      ))}
    </div>
  );
};

export default TickerTrack;