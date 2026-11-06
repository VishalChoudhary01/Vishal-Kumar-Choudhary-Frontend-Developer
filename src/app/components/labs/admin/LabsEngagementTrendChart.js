"use client";

import { useId, useMemo } from "react";
import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

const SERIES = [
  { key: "sourceOpens", label: "Source opens", color: "var(--brand)" },
  { key: "codeCopies", label: "Code copies", color: "var(--info)" },
  { key: "verifiedLikeActions", label: "Verified like actions", color: "var(--success)" },
  { key: "anonymousLikeActions", label: "Anonymous like actions", color: "var(--text-tertiary)" },
];

function dateLabel(value) {
  const date = new Date(value + "T00:00:00Z");
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function number(value) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

export default function LabsEngagementTrendChart({ daily = [] }) {
  const reducedMotion = useReducedMotion();
  const titleId = useId();

  const chart = useMemo(() => {
    if (!daily.length) return null;

    const width = 960;
    const height = 280;
    const left = 48;
    const right = 18;
    const top = 20;
    const bottom = 42;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const maximum = Math.max(
      1,
      ...daily.flatMap((day) => SERIES.map((series) => Number(day[series.key]) || 0)),
    );
    const xAt = (index) =>
      daily.length === 1
        ? left + plotWidth / 2
        : left + (index / (daily.length - 1)) * plotWidth;
    const yAt = (value) => top + plotHeight - ((Number(value) || 0) / maximum) * plotHeight;
    const paths = Object.fromEntries(
      SERIES.map((series) => [
        series.key,
        daily
          .map((day, index) => (index === 0 ? "M" : "L") + xAt(index).toFixed(2) + " " + yAt(day[series.key]).toFixed(2))
          .join(" "),
      ]),
    );
    const tickValues = [...new Set([0, Math.round(maximum / 2), maximum])];
    const tickIndexes = [...new Set([
      0,
      Math.floor((daily.length - 1) / 4),
      Math.floor((daily.length - 1) / 2),
      Math.floor(((daily.length - 1) * 3) / 4),
      daily.length - 1,
    ])];

    return {
      width,
      height,
      left,
      right,
      top,
      bottom,
      plotWidth,
      plotHeight,
      maximum,
      xAt,
      yAt,
      paths,
      tickValues,
      tickIndexes,
      lastIndex: daily.length - 1,
    };
  }, [daily]);

  const hasActivity = daily.some((day) =>
    SERIES.some((series) => Number(day[series.key]) > 0),
  );

  return (
    <section
      aria-labelledby={titleId}
      className="mt-8 border border-border bg-surface-1 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-sm font-semibold">
            Live engagement trends
          </h2>
          <p className="mt-1 text-xs text-text-tertiary">
            Successful source activity and like-state changes, grouped by UTC day.
          </p>
        </div>
        <span className="text-xs text-text-tertiary">
          {daily.length} days in range
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Chart legend">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2 text-[11px] text-text-secondary">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>

      {hasActivity && chart ? (
        <div className="mt-4">
          <svg
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            role="img"
            aria-label="Daily line chart for source opens, code copies, verified like actions and anonymous like actions"
            className="block h-auto w-full overflow-visible"
          >
            <g aria-hidden="true">
              {chart.tickValues.map((tick) => {
                const y = chart.yAt(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={chart.left}
                      x2={chart.width - chart.right}
                      y1={y}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="3 5"
                      strokeWidth="1"
                    />
                    <text
                      x={chart.left - 10}
                      y={y + 4}
                      fill="var(--text-tertiary)"
                      fontSize="11"
                      textAnchor="end"
                    >
                      {number(tick)}
                    </text>
                  </g>
                );
              })}
              <line
                x1={chart.left}
                x2={chart.width - chart.right}
                y1={chart.height - chart.bottom}
                y2={chart.height - chart.bottom}
                stroke="var(--border-strong)"
              />
              {chart.tickIndexes.map((index) => (
                <text
                  key={daily[index].date}
                  x={chart.xAt(index)}
                  y={chart.height - 12}
                  fill="var(--text-tertiary)"
                  fontSize="11"
                  textAnchor={index === 0 ? "start" : index === chart.lastIndex ? "end" : "middle"}
                >
                  {dateLabel(daily[index].date)}
                </text>
              ))}
            </g>

            {SERIES.map((series) => (
              <g key={series.key}>
                <motion.path
                  d={chart.paths[series.key]}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={false}
                  animate={{ d: chart.paths[series.key] }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.circle
                  cx={chart.xAt(chart.lastIndex)}
                  cy={chart.yAt(daily[chart.lastIndex][series.key])}
                  r="4"
                  fill={series.color}
                  stroke="var(--surface-1)"
                  strokeWidth="2"
                  initial={false}
                  animate={{
                    cx: chart.xAt(chart.lastIndex),
                    cy: chart.yAt(daily[chart.lastIndex][series.key]),
                  }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <title>
                    {series.label}: {number(daily[chart.lastIndex][series.key])} on {daily[chart.lastIndex].date}
                  </title>
                </motion.circle>
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <p className="mt-5 border border-dashed border-border p-6 text-center text-xs text-text-tertiary">
          No engagement events have been recorded during this period. The chart will populate when new verified source activity or like actions are recorded.
        </p>
      )}

      <details className="mt-4 border-t border-border pt-3">
        <summary className="cursor-pointer text-xs font-medium text-text-secondary outline-none transition-colors hover:text-brand focus-visible:text-brand">
          View daily data table
        </summary>
        <div className="mt-3 max-h-72 overflow-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <caption className="sr-only">Daily analytics values for the selected reporting period, in UTC</caption>
            <thead className="sticky top-0 bg-surface-2 text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              <tr>
                <th className="px-3 py-2 font-medium">UTC date</th>
                <th className="px-3 py-2 text-right font-medium">Source opens</th>
                <th className="px-3 py-2 text-right font-medium">Copies</th>
                <th className="px-3 py-2 text-right font-medium">Verified like actions</th>
                <th className="px-3 py-2 text-right font-medium">Anonymous like actions</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((day) => (
                <tr key={day.date} className="border-t border-border">
                  <th scope="row" className="px-3 py-2 font-mono font-normal text-text-secondary">{day.date}</th>
                  <td className="px-3 py-2 text-right tabular-nums">{number(day.sourceOpens)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{number(day.codeCopies)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{number(day.verifiedLikeActions)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{number(day.anonymousLikeActions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
