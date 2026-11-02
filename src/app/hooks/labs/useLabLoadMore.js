"use client";

import { useCallback, useMemo, useState } from "react";

const PAGE_SIZE = 6;

export default function useLabLoadMore(items = [], resetKey = "all") {
  const [visibleState, setVisibleState] = useState({
    key: resetKey,
    count: PAGE_SIZE,
  });

  const visibleCount =
    visibleState.key === resetKey
      ? Math.min(visibleState.count, items.length)
      : Math.min(PAGE_SIZE, items.length);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleState((current) => {
      const currentCount =
        current.key === resetKey ? current.count : PAGE_SIZE;

      return {
        key: resetKey,
        count: Math.min(currentCount + PAGE_SIZE, items.length),
      };
    });
  }, [items.length, resetKey]);

  return {
    visibleItems,
    visibleCount,
    totalCount: items.length,
    hasMore,
    loadMore,
  };
}
