"use client";

import { useCallback, useEffect, useState } from "react";

export default function useLabFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      Boolean(
        document.fullscreenEnabled &&
        targetRef.current &&
        typeof targetRef.current.requestFullscreen === "function"
      )
    );

    const handleChange = () => {
      setIsFullscreen(document.fullscreenElement === targetRef.current);
    };

    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, [targetRef]);

  const enterFullscreen = useCallback(async () => {
    const target = targetRef.current;

    if (
      !target ||
      !document.fullscreenEnabled ||
      typeof target.requestFullscreen !== "function"
    ) {
      return;
    }

    try {
      await target.requestFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  }, [targetRef]);

  const exitFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) return;

    try {
      await document.exitFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      return exitFullscreen();
    }

    return enterFullscreen();
  }, [enterFullscreen, exitFullscreen, isFullscreen]);

  return {
    isFullscreen,
    isSupported,
    toggleFullscreen,
  };
}
