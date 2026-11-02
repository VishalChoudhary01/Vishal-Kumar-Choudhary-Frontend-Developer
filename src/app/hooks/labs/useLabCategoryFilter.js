"use client";

import { useMemo, useState } from "react";
import { LAB_CATEGORIES } from "@/app/data/labsExperiments";

export default function useLabCategoryFilter(experiments = []) {
  const [activeCategory, setActiveCategory] = useState("all");

  const availableCategories = useMemo(
    () =>
      LAB_CATEGORIES.filter((category) =>
        experiments.some((experiment) => experiment.category === category.name)
      ),
    [experiments]
  );

  const categories = useMemo(
    () => [{ id: "all", label: "All" }, ...availableCategories],
    [availableCategories]
  );

  const filteredExperiments = useMemo(() => {
    if (activeCategory === "all") return experiments;

    const selected = LAB_CATEGORIES.find(
      (category) => category.id === activeCategory
    );

    if (!selected) return experiments;

    return experiments.filter(
      (experiment) => experiment.category === selected.name
    );
  }, [activeCategory, experiments]);

  return {
    activeCategory,
    setActiveCategory,
    categories,
    filteredExperiments,
  };
}
