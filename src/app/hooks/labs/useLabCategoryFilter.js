"use client";

import { useMemo, useState } from "react";
import { LAB_CATEGORIES } from "@/app/data/labsExperiments";
import { buildLabCategoryOptions } from "@/app/lib/labs/category-options.mjs";

export default function useLabCategoryFilter(experiments = []) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(
    () => buildLabCategoryOptions(experiments, LAB_CATEGORIES),
    [experiments],
  );

  const filteredExperiments = useMemo(() => {
    if (activeCategory === "all") return experiments;

    const selected = LAB_CATEGORIES.find(
      (category) => category.id === activeCategory,
    );

    if (!selected) return experiments;

    return experiments.filter(
      (experiment) => experiment.category === selected.name,
    );
  }, [activeCategory, experiments]);

  return {
    activeCategory,
    setActiveCategory,
    categories,
    filteredExperiments,
  };
}
