"use client";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode, setDarkMode } from "../redux/featuresSlice/themeSlice";
import { useEffect } from "react";

const useDarkMode = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.DarkMode);

  // Sync Redux ONCE with already-applied theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    dispatch(setDarkMode(isDark));
  }, [dispatch]);

  // Toggle handler
  const toggleMode = () => {
    dispatch(toggleDarkMode());
    const next = !isDarkMode;

    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("dark", next.toString());
  };

  return { isDarkMode, toggleMode };
};

export default useDarkMode;
