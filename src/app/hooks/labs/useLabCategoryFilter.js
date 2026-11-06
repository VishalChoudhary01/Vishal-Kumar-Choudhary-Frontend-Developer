"use client";

import { useMemo, useState } from "react";
import { LAB_CATEGORIES } from "@/app/data/labsExperiments";

export default function useLabCategoryFilter(experiments = []) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const counts = new Map();

    for (const experiment of experiments) {
      if (typeof experiment?.category !== "string" || !experiment.category.trim()) {
        continue;
      }

      counts.set(
        experiment.category,
        (counts.get(experiment.category) || 0) + 1,
      );
    }

    const availableCategories = LAB_CATEGORIES
      .filter((category) => counts.has(category.name))
      .map((category) => ({
        ...category,
        count: counts.get(category.name),
      }));

    return [
      { id: "all", label: "All", count: experiments.length },
      ...availableCategories,
    ];
  }, [experiments]);

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
