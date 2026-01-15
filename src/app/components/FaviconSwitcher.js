"use client";

import { useEffect } from "react";
import useDarkMode from "../hooks/useDarkMode";

export default function FaviconSwitcher() {
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    // Remove existing favicons
    const existing = document.querySelectorAll("link[rel='icon']");
    existing.forEach((el) => el.remove());

    // Create favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = isDarkMode
      ? "/favicon/dark.png"
      : "/favicon/light.png";

    document.head.appendChild(link);
  }, [isDarkMode]);

  return null;
}
