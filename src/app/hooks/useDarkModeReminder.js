"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "@/app/redux/featuresSlice/toastSlice";

export default function useDarkModeReminder() {
  const dispatch = useDispatch();
  const { DarkMode: isDarkMode, ready } = useSelector(
    (state) => state.theme
  );

  const hasShownInitialToast = useRef(false);
  const timers = useRef([]);

  useEffect(() => {
    // ❌ Do NOTHING until theme is synced
    if (!ready) return;

    // Clear timers on every run
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // ❌ Dark mode → never show toast
    if (isDarkMode) {
      hasShownInitialToast.current = false;
      return;
    }

    const messages = [
      { iconType: "moon", text: "Please switch to dark mode !!" },
      { iconType: "star", text: "Switch to dark for a better experience." },
      { iconType: "eye", text: "Dark mode = less strain, more vibes." },
    ];

    if (!hasShownInitialToast.current) {
      dispatch(showToast(messages[0]));
      hasShownInitialToast.current = true;

      [90000, 180000].forEach((delay, i) => {
        const timer = setTimeout(() => {
          dispatch(showToast(messages[i + 1]));
        }, delay);
        timers.current.push(timer);
      });
    }

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [isDarkMode, ready, dispatch]);
}
