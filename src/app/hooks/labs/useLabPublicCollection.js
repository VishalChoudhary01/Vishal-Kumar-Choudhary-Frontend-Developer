"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LAB_CATEGORIES } from "@/app/data/labsExperiments";
import { buildLabCategoryOptions } from "@/app/lib/labs/category-options.mjs";

const REVEAL_BATCH_SIZE = 6;

function initialPageFromProps(page) {
  return {
    experiments: Array.isArray(page?.experiments) ? page.experiments : [],
    nextCursor: typeof page?.nextCursor === "string" ? page.nextCursor : null,
  };
}

async function requestPublicPage({ category, cursor, signal }) {
  const params = new URLSearchParams();
  if (category !== "all") {
    const definition = LAB_CATEGORIES.find((item) => item.id === category);
    if (!definition) throw new Error("This Labs category is not supported.");
    params.set("category", definition.name);
  }
  if (cursor) params.set("cursor", cursor);

  const query = params.toString();
  const response = await fetch(query ? `/api/v1/labs?${query}` : "/api/v1/labs", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.data || !Array.isArray(payload.data.experiments)) {
    throw new Error(
      payload?.error?.message || "The experiment collection could not be loaded.",
    );
  }

  return {
    experiments: payload.data.experiments,
    nextCursor:
      typeof payload.data.nextCursor === "string" ? payload.data.nextCursor : null,
  };
}

export default function useLabPublicCollection({
  builtInExperiments = [],
  initialCustomPage = {},
  totalCount = 0,
  categoryCounts = {},
} = {}) {
  const firstPage = useMemo(
    () => initialPageFromProps(initialCustomPage),
    [initialCustomPage],
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [remotePage, setRemotePage] = useState(() => ({
    category: "all",
    ...initialPageFromProps(initialCustomPage),
  }));
  const [visibleCount, setVisibleCount] = useState(REVEAL_BATCH_SIZE);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);
  const pageCache = useRef(new Map([["all", firstPage]]));
  const activeCategoryRef = useRef("all");
  const loadMoreController = useRef(null);

  const categorySummary = useMemo(
    () => ({ totalCount, categoryCounts }),
    [totalCount, categoryCounts],
  );
  const categoryOptions = useMemo(
    () => buildLabCategoryOptions(builtInExperiments, LAB_CATEGORIES, categorySummary),
    [builtInExperiments, categorySummary],
  );

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(
    () => () => {
      loadMoreController.current?.abort();
    },
    [],
  );

  useEffect(() => {
    setVisibleCount(REVEAL_BATCH_SIZE);
    setLoadError("");
  }, [activeCategory]);

  useEffect(() => {
    if (activeCategory === "all") {
      setRemotePage({ category: "all", ...firstPage });
      setIsLoadingCategory(false);
      setLoadError("");
      return undefined;
    }

    const cached = pageCache.current.get(activeCategory);
    if (cached) {
      setRemotePage({ category: activeCategory, ...cached });
      setIsLoadingCategory(false);
      setLoadError("");
      return undefined;
    }

    const selectedDefinition = LAB_CATEGORIES.find(
      (item) => item.id === activeCategory,
    );
    if (!selectedDefinition) {
      setRemotePage({ category: activeCategory, experiments: [], nextCursor: null });
      setIsLoadingCategory(false);
      return undefined;
    }

    const builtInCount = builtInExperiments.filter(
      (experiment) => experiment.category === selectedDefinition.name,
    ).length;
    const combinedCategoryCount = Number(categoryCounts[selectedDefinition.name]) || 0;
    if (combinedCategoryCount <= builtInCount) {
      const emptyPage = { experiments: [], nextCursor: null };
      pageCache.current.set(activeCategory, emptyPage);
      setRemotePage({ category: activeCategory, ...emptyPage });
      setIsLoadingCategory(false);
      return undefined;
    }

    const controller = new AbortController();
    setRemotePage({ category: activeCategory, experiments: [], nextCursor: null });
    setIsLoadingCategory(true);
    setLoadError("");

    requestPublicPage({ category: activeCategory, signal: controller.signal })
      .then((page) => {
        pageCache.current.set(activeCategory, page);
        if (activeCategoryRef.current === activeCategory) {
          setRemotePage({ category: activeCategory, ...page });
        }
      })
      .catch((error) => {
        if (error?.name !== "AbortError" && activeCategoryRef.current === activeCategory) {
          setLoadError(error?.message || "The experiments could not be loaded.");
        }
      })
      .finally(() => {
        if (activeCategoryRef.current === activeCategory) {
          setIsLoadingCategory(false);
        }
      });

    return () => controller.abort();
  }, [activeCategory, builtInExperiments, categoryCounts, firstPage, retryVersion]);

  const filteredBuiltIns = useMemo(() => {
    if (activeCategory === "all") return builtInExperiments;
    const selected = LAB_CATEGORIES.find((item) => item.id === activeCategory);
    if (!selected) return [];
    return builtInExperiments.filter(
      (experiment) => experiment.category === selected.name,
    );
  }, [activeCategory, builtInExperiments]);

  const currentRemotePage =
    remotePage.category === activeCategory
      ? remotePage
      : { experiments: [], nextCursor: null };
  const loadedExperiments = useMemo(
    () => [...filteredBuiltIns, ...currentRemotePage.experiments],
    [filteredBuiltIns, currentRemotePage.experiments],
  );
  const visibleItems = loadedExperiments.slice(0, visibleCount);
  const visibleItemsCount = visibleItems.length;
  const remainingLoaded = Math.max(0, loadedExperiments.length - visibleCount);
  const nextPageCount = Math.min(REVEAL_BATCH_SIZE, remainingLoaded);
  const hasMore = remainingLoaded > 0 || Boolean(currentRemotePage.nextCursor);

  const selectedCategory = LAB_CATEGORIES.find(
    (item) => item.id === activeCategory,
  );
  const currentCategoryTotal =
    activeCategory === "all"
      ? totalCount
      : Number(categoryCounts[selectedCategory?.name]) || 0;

  const changeCategory = useCallback((nextCategory) => {
    if (nextCategory === activeCategoryRef.current) return;
    loadMoreController.current?.abort();
    activeCategoryRef.current = nextCategory;
    setActiveCategory(nextCategory);
    setIsLoadingMore(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingCategory || isLoadingMore) return;

    if (visibleCount < loadedExperiments.length) {
      setVisibleCount((current) =>
        Math.min(current + REVEAL_BATCH_SIZE, loadedExperiments.length),
      );
      return;
    }

    const cursor = currentRemotePage.nextCursor;
    if (!cursor) return;

    const requestedCategory = activeCategory;
    const controller = new AbortController();
    loadMoreController.current = controller;
    setIsLoadingMore(true);
    setLoadError("");

    try {
      const nextPage = await requestPublicPage({
        category: requestedCategory,
        cursor,
        signal: controller.signal,
      });
      if (activeCategoryRef.current !== requestedCategory) return;

      const currentCached = pageCache.current.get(requestedCategory) ||
        currentRemotePage;
      const mergedPage = {
        experiments: [...currentCached.experiments, ...nextPage.experiments],
        nextCursor: nextPage.nextCursor,
      };
      pageCache.current.set(requestedCategory, mergedPage);
      setRemotePage({ category: requestedCategory, ...mergedPage });
      setVisibleCount((current) =>
        current + Math.min(REVEAL_BATCH_SIZE, nextPage.experiments.length),
      );
    } catch (error) {
      if (error?.name !== "AbortError" && activeCategoryRef.current === requestedCategory) {
        setLoadError(error?.message || "More experiments could not be loaded.");
      }
    } finally {
      if (activeCategoryRef.current === requestedCategory) {
        setIsLoadingMore(false);
      }
      if (loadMoreController.current === controller) {
        loadMoreController.current = null;
      }
    }
  }, [
    activeCategory,
    currentRemotePage,
    isLoadingCategory,
    isLoadingMore,
    loadedExperiments.length,
    visibleCount,
  ]);

  const retryCategory = useCallback(() => {
    if (activeCategory === "all") return;
    pageCache.current.delete(activeCategory);
    setLoadError("");
    setRemotePage({ category: activeCategory, experiments: [], nextCursor: null });
    setVisibleCount(REVEAL_BATCH_SIZE);
    setIsLoadingCategory(false);
    setRetryVersion((current) => current + 1);
  }, [activeCategory]);

  return {
    activeCategory,
    setActiveCategory: changeCategory,
    categories: categoryOptions,
    visibleItems,
    visibleCount: visibleItemsCount,
    totalCount: currentCategoryTotal,
    hasMore,
    nextPageCount,
    isLoadingCategory,
    isLoadingMore,
    loadError,
    loadMore,
    retryCategory,
  };
}
