"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import {
  buildActivityBuckets,
  LABS_ACTIVITY_METRICS,
} from "@/app/lib/labs/owner-analytics-utils.mjs";

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBucketRange(bucket) {
  if (!bucket) return "No data";
  if (bucket.startDate === bucket.endDate) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(bucket.startDate + "T00:00:00.000Z"));
  }

  const format = (value) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(value + "T00:00:00.000Z"));

  return format(bucket.startDate) + " – " + format(bucket.endDate);
}

function readTheme(canvas) {
  const styles = window.getComputedStyle(canvas);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

  return {
    brand: read("--brand", "#176b68"),
    brandSoft: read("--brand-soft", "rgba(23,107,104,.18)"),
    success: read("--success", "#177452"),
    warning: read("--warning", "#8a6115"),
    error: read("--error", "#a33e38"),
    info: read("--info", "#35627f"),
    grid: read("--border", "rgba(127,127,127,.18)"),
    text: read("--text-tertiary", "#888888"),
    surface: read("--surface-1", "#ffffff"),
    border: read("--border-strong", "#888888"),
    fontFamily: styles.fontFamily || "sans-serif",
  };
}

function getMetricColor(theme, metricKey) {
  switch (metricKey) {
    case "sourceOpens":
      return theme.info;
    case "codeCopies":
      return theme.brand;
    case "componentCopies":
      return theme.success;
    case "verifiedLikes":
      return theme.success;
    case "verifiedUnlikes":
    case "anonymousUnlikes":
      return theme.warning;
    case "anonymousLikes":
      return theme.brand;
    default:
      return theme.brand;
  }
}

export default function LabsEngagementTrendChart({
  daily = [],
  periodDays = 30,
  isRefreshing = false,
}) {
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const latestDataRef = useRef(null);
  const [metricKey, setMetricKey] = useState("sourceOpens");
  const [hoverIndex, setHoverIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [chartReady, setChartReady] = useState(false);
  const [chartError, setChartError] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);

  const metric = LABS_ACTIVITY_METRICS.find((item) => item.key === metricKey) || LABS_ACTIVITY_METRICS[0];
  const buckets = useMemo(
    () => buildActivityBuckets({ daily, metric: metric.key, periodDays }),
    [daily, metric.key, periodDays],
  );
  const total = useMemo(
    () => buckets.reduce((sum, bucket) => sum + bucket.value, 0),
    [buckets],
  );
  const hasBuckets = buckets.length > 0;
  const hasActivity = total > 0;

  const preferredIndex = hoverIndex ?? selectedIndex ?? buckets.length - 1;
  const activeIndex = buckets.length
    ? Math.min(Math.max(preferredIndex, 0), buckets.length - 1)
    : -1;
  const activeBucket = activeIndex >= 0 ? buckets[activeIndex] : null;
  const dataSignature = metric.key + "|" + periodDays + "|" +
    buckets.map((bucket) => bucket.key + ":" + bucket.value).join("|");
  const lastDataSignatureRef = useRef("");
  const chartThemeRef = useRef(null);

  latestDataRef.current = {
    buckets,
    metric,
    periodDays,
    reducedMotion,
    dataSignature,
  };

  useEffect(() => {
    if (!hasBuckets || !canvasRef.current) {
      chartRef.current?.destroy();
      chartRef.current = null;
      setChartReady(false);
      return undefined;
    }

    let cancelled = false;
    setChartReady(false);
    setChartError("");

    async function mountChart() {
      try {
        const module = await import("chart.js");
        if (cancelled || !canvasRef.current) return;

        const {
          Chart,
          BarController,
          BarElement,
          CategoryScale,
          LinearScale,
          Tooltip,
        } = module;

        Chart.register(
          BarController,
          BarElement,
          CategoryScale,
          LinearScale,
          Tooltip,
        );

        const current = latestDataRef.current;
        const theme = readTheme(canvasRef.current);
        const reduced = current.reducedMotion;
        const datasetColor = getMetricColor(theme, current.metric.key);

        chartRef.current = new Chart(canvasRef.current, {
          type: "bar",
          data: {
            labels: current.buckets.map((bucket) => bucket.label),
            datasets: [{
              label: current.metric.label,
              data: current.buckets.map((bucket) => bucket.value),
              backgroundColor: datasetColor,
              hoverBackgroundColor: datasetColor,
              borderColor: datasetColor,
              borderWidth: 0,
              borderRadius: 5,
              borderSkipped: false,
              maxBarThickness: 34,
              categoryPercentage: 0.76,
              barPercentage: 0.9,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 80,
            animation: reduced
              ? false
              : {
                  duration: 520,
                  easing: "easeOutQuart",
                },
            transitions: {
              active: {
                animation: {
                  duration: reduced ? 0 : 170,
                },
              },
            },
            interaction: {
              mode: "index",
              intersect: false,
            },
            events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
            onHover(event, activeElements) {
              if (event.type === "mouseout") {
                setHoverIndex(null);
                return;
              }

              if (activeElements?.length) {
                const nextIndex = activeElements[0].index;
                setHoverIndex((currentIndex) =>
                  currentIndex === nextIndex ? currentIndex : nextIndex,
                );
              } else {
                setHoverIndex(null);
              }
            },
            onClick(_event, activeElements) {
              if (activeElements?.length) {
                setSelectedIndex(activeElements[0].index);
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                displayColors: false,
                padding: 12,
                cornerRadius: 8,
                backgroundColor: theme.surface,
                titleColor: theme.text,
                bodyColor: theme.text,
                borderColor: theme.border,
                borderWidth: 1,
                callbacks: {
                  title(items) {
                    const point = currentBucket(items?.[0]?.dataIndex);
                    return point ? formatBucketRange(point) : "";
                  },
                  label(context) {
                    return currentMetricLabel() + ": " + formatNumber(context.parsed.y);
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { display: false, drawBorder: false },
                border: { display: false },
                ticks: {
                  color: theme.text,
                  autoSkip: true,
                  maxTicksLimit: current.periodDays >= 90 ? 9 : current.periodDays === 30 ? 8 : 7,
                  maxRotation: 0,
                  minRotation: 0,
                  font: { size: 10, family: theme.fontFamily },
                },
              },
              y: {
                beginAtZero: true,
                grace: "8%",
                grid: {
                  color: theme.grid,
                  drawTicks: false,
                },
                border: { display: false, dash: [3, 4] },
                ticks: {
                  color: theme.text,
                  precision: 0,
                  padding: 10,
                  font: { size: 10, family: theme.fontFamily },
                  callback(value) {
                    return Number.isInteger(Number(value)) ? formatNumber(value) : "";
                  },
                },
              },
            },
          },
        });
        lastDataSignatureRef.current = current.dataSignature;
        chartThemeRef.current = resolvedTheme;
        setChartReady(true);
      } catch (error) {
        if (!cancelled) {
          chartRef.current?.destroy();
          chartRef.current = null;
          setChartReady(false);
          setChartError("The activity chart could not be loaded. The data table remains available.");
          console.error("[labs-analytics-chart] Chart.js failed to load:", error?.message || error);
        }
      }
    }

    mountChart();

    return () => {
      cancelled = true;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [hasBuckets, retryNonce]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !canvasRef.current) return;
    if (lastDataSignatureRef.current === dataSignature && chartThemeRef.current === resolvedTheme) {
      return;
    }

    const theme = readTheme(canvasRef.current);
    chart.data.labels = buckets.map((bucket) => bucket.label);
    chart.data.datasets[0].label = metric.label;
    chart.data.datasets[0].data = buckets.map((bucket) => bucket.value);
    const datasetColor = getMetricColor(theme, metric.key);
    chart.data.datasets[0].backgroundColor = datasetColor;
    chart.data.datasets[0].hoverBackgroundColor = datasetColor;
    chart.data.datasets[0].borderColor = datasetColor;

    chart.options.animation = reducedMotion
      ? false
      : { duration: 340, easing: "easeOutQuart" };
    chart.options.scales.x.ticks.maxTicksLimit =
      periodDays >= 90 ? 9 : periodDays === 30 ? 8 : 7;
    chart.options.plugins.tooltip.backgroundColor = theme.surface;
    chart.options.plugins.tooltip.titleColor = theme.text;
    chart.options.plugins.tooltip.bodyColor = theme.text;
    chart.options.plugins.tooltip.borderColor = theme.border;
    chart.options.scales.x.ticks.color = theme.text;
    chart.options.scales.y.ticks.color = theme.text;
    chart.options.scales.y.grid.color = theme.grid;

    const safeIndex = Math.min(selectedIndex ?? buckets.length - 1, buckets.length - 1);
    if (safeIndex !== selectedIndex && selectedIndex !== null) {
      setSelectedIndex(safeIndex >= 0 ? safeIndex : null);
    }
    chart.update(reducedMotion ? "none" : "default");
    lastDataSignatureRef.current = dataSignature;
    chartThemeRef.current = resolvedTheme;
  }, [buckets, metric.key, metric.label, periodDays, reducedMotion, resolvedTheme, dataSignature]);

  function currentBucket(index) {
    return latestDataRef.current?.buckets[index] || null;
  }

  function currentMetricLabel() {
    return latestDataRef.current?.metric.label || "Activity";
  }

  function selectMetric(key) {
    setMetricKey(key);
    setHoverIndex(null);
    setSelectedIndex(null);
  }

  return (
    <section className="mt-8 border border-border bg-surface-1 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Activity over time</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            One measure at a time · {periodDays >= 90 ? "UTC weekly totals" : "UTC daily totals"}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-[11px] text-text-tertiary" aria-live="polite">
          <motion.span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-success"
            animate={isRefreshing && !reducedMotion ? { opacity: [1, 0.45, 1], scale: [1, 1.18, 1] } : { opacity: 1, scale: 1 }}
            transition={isRefreshing ? { duration: 0.8, repeat: Infinity } : { duration: 0.18 }}
          />
          {isRefreshing ? "Updating" : "Auto-updating"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7" role="group" aria-label="Select activity metric">
        {LABS_ACTIVITY_METRICS.map((item) => {
          const active = item.key === metric.key;
          return (
            <motion.button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => selectMetric(item.key)}
              whileTap={reducedMotion ? undefined : { scale: 0.975 }}
              transition={{ duration: 0.14 }}
              className={[
                "relative min-h-10 overflow-hidden border px-2.5 py-2 text-left text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active
                  ? "border-brand text-brand"
                  : "border-border text-text-secondary hover:border-brand/60 hover:text-text-primary",
              ].join(" ")}
            >
              {active ? (
                <motion.span
                  layoutId="labs-activity-metric-active"
                  className="absolute inset-0 bg-brand-soft"
                  transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 36 }}
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div aria-live="polite" aria-atomic="true">
          <p className="text-[11px] font-medium text-text-tertiary">
            {activeBucket ? formatBucketRange(activeBucket) : "No activity buckets"}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <motion.span
              key={metric.key + "-" + (activeBucket?.value ?? "empty")}
              initial={reducedMotion ? false : { opacity: 0.45, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary"
            >
              {formatNumber(activeBucket?.value || 0)}
            </motion.span>
            <span className="text-xs text-text-tertiary">{metric.label.toLowerCase()}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-text-tertiary">Selected period total</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-text-primary">{formatNumber(total)}</p>
        </div>
      </div>

      {hasBuckets ? (
        <div className="relative mt-3 h-[230px] w-full sm:h-[280px]">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={metric.label + " by " + (periodDays >= 90 ? "UTC week" : "UTC day") + " for the selected reporting period"}
            className="block h-full w-full"
          />
          {!chartReady && !chartError ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-text-tertiary" role="status">
              Preparing activity chart…
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 grid h-[230px] place-items-center border border-dashed border-border px-6 text-center">
          <div>
            <p className="text-sm font-medium text-text-secondary">No activity data</p>
            <p className="mt-1 text-xs text-text-tertiary">No calendar buckets were returned for this period.</p>
          </div>
        </div>
      )}

      {chartError ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3" role="status">
          <p className="text-xs text-warning">{chartError}</p>
          <button
            type="button"
            onClick={() => setRetryNonce((value) => value + 1)}
            className="text-xs font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Retry chart
          </button>
        </div>
      ) : null}
      {hasBuckets && !hasActivity ? (
        <p className="mt-3 text-xs text-text-tertiary">No {metric.label.toLowerCase()} were recorded in this period. The zero values below are valid data, not a loading state.</p>
      ) : null}

      <details className="mt-4 border-t border-border pt-3">
        <summary className="cursor-pointer text-xs font-medium text-text-secondary outline-none transition-colors hover:text-brand focus-visible:text-brand">
          View {periodDays >= 90 ? "weekly" : "daily"} data table
        </summary>
        <div className="mt-3 max-h-72 overflow-auto">
          <table className="w-full min-w-[360px] text-left text-xs">
            <caption className="sr-only">{metric.label} by UTC date range for the selected period</caption>
            <thead className="sticky top-0 bg-surface-2 text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              <tr>
                <th className="px-3 py-2 font-medium">UTC date range</th>
                <th className="px-3 py-2 text-right font-medium">{metric.label}</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket) => (
                <tr key={bucket.key} className="border-t border-border">
                  <th scope="row" className="px-3 py-2 font-mono font-normal text-text-secondary">
                    {formatBucketRange(bucket)}
                  </th>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{formatNumber(bucket.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <th scope="row" className="px-3 py-2 font-semibold">Total</th>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatNumber(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </details>
    </section>
  );
}
