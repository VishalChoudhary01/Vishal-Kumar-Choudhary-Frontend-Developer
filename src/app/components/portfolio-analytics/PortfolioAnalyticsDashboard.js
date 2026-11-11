"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Globe2,
  Laptop,
  Monitor,
  MousePointer2,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { ActivityIcon } from "@animateicons/react/lucide/activity-icon";
import { ClockIcon } from "@animateicons/react/lucide/clock-icon";
import { EyeIcon } from "@animateicons/react/lucide/eye-icon";
import { UsersIcon } from "@animateicons/react/lucide/users-icon";

import MotionNumber from "@/app/components/motion/MotionNumber/MotionNumber";
import usePortfolioAnalyticsPolling from "@/app/hooks/portfolio-analytics/usePortfolioAnalyticsPolling";
import PortfolioAnalyticsDeletionControls from "@/app/components/portfolio-analytics/PortfolioAnalyticsDeletionControls";

const numberFormat = new Intl.NumberFormat("en-IN");

function number(value) {
  return numberFormat.format(Math.max(0, Number(value) || 0));
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  if (total < 60) return total + "s";
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  if (minutes < 60) return minutes + "m " + remainingSeconds + "s";
  return Math.floor(minutes / 60) + "h " + (minutes % 60) + "m";
}

function formatDate(value, options = {}) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    ...options,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getPageLabel(pageType) {
  return ({
    home: "Homepage",
    project: "Project detail",
    labs_index: "Labs collection",
    lab_detail: "Lab detail",
  })[pageType] || "Other page";
}

function getSourceLabel(item) {
  if (item.sourceType === "referral") return item.source || "Referral";
  if (item.sourceType === "campaign") return item.source || "Campaign";
  if (item.sourceType === "internal") return "Internal navigation";
  return "Direct";
}

function getDeviceLabel(value) {
  return ({
    desktop: "Desktop",
    mobile: "Mobile",
    tablet: "Tablet",
    unknown: "Unknown device",
  })[value] || "Unknown device";
}

function getDeviceIcon(value) {
  if (value === "mobile") return Smartphone;
  if (value === "tablet") return Tablet;
  return value === "desktop" ? Laptop : Monitor;
}

function getLocationLabel(item) {
  const parts = [item.city, item.regionCode, item.countryCode].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location unavailable";
}

function MetricCard({ icon: Icon, label, value, detail, duration = false, index = 0 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: reduceMotion ? 0 : index * 0.045 }}
      className="min-w-0 border border-border bg-surface-1 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-tertiary">{label}</p>
        <Icon size={17} duration={0.72} isAnimated={!reduceMotion} className="shrink-0 text-text-tertiary" aria-hidden="true" />
      </div>
      <div className="mt-4 min-h-9 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
        {duration ? (
          <span>{formatDuration(value)}</span>
        ) : (
          <MotionNumber value={Math.max(0, Number(value) || 0)} locale="en-IN" ariaLabel={label + ": " + number(value)} duration={0.42} />
        )}
      </div>
      <p className="mt-1 text-xs leading-5 text-text-tertiary">{detail}</p>
    </motion.article>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-4 border border-dashed border-border px-4 py-8 text-center text-xs leading-5 text-text-tertiary">
      {message}
    </div>
  );
}

function VisitsTrendChart({ daily = [], days }) {
  const reduceMotion = useReducedMotion();
  const width = 920;
  const height = 250;
  const left = 42;
  const right = 16;
  const top = 16;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxValue = Math.max(1, ...daily.map((point) => Number(point.visits) || 0));
  const tickMax = Math.max(4, Math.ceil(maxValue / 4) * 4);
  const points = daily.map((point, index) => ({
    ...point,
    x: daily.length <= 1 ? left + chartWidth / 2 : left + (index / (daily.length - 1)) * chartWidth,
    y: top + chartHeight - ((Number(point.visits) || 0) / tickMax) * chartHeight,
  }));
  const linePath = points.map((point, index) =>
    (index === 0 ? "M" : "L") + " " + point.x.toFixed(2) + " " + point.y.toFixed(2)
  ).join(" ");
  const areaPath = points.length
    ? linePath + " L " + points[points.length - 1].x + " " + (top + chartHeight) + " L " + points[0].x + " " + (top + chartHeight) + " Z"
    : "";
  const tickValues = [0, tickMax / 4, tickMax / 2, (tickMax * 3) / 4, tickMax];
  const labelIndices = [...new Set([
    0,
    Math.floor((daily.length - 1) / 4),
    Math.floor((daily.length - 1) / 2),
    Math.floor(((daily.length - 1) * 3) / 4),
    daily.length - 1,
  ])].filter((index) => index >= 0 && index < daily.length);
  const totalVisits = daily.reduce((sum, point) => sum + (Number(point.visits) || 0), 0);

  return (
    <section className="border border-border bg-surface-1 p-5 sm:p-6" aria-labelledby="portfolio-trend-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="portfolio-trend-title" className="text-sm font-semibold">Visit trend</h2>
          <p className="mt-1 text-xs text-text-tertiary">Daily page visits · UTC buckets · {days} days</p>
        </div>
        <div className="inline-flex items-center gap-2 text-[11px] text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
          Page visits
        </div>
      </div>

      {points.length ? (
        <div className="mt-5">
          <svg viewBox={"0 0 " + width + " " + height} role="img" aria-label={"Daily page visits over " + days + " days"} className="block h-auto w-full overflow-visible">
            <defs>
              <linearGradient id="portfolio-visits-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.20" />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.015" />
              </linearGradient>
            </defs>
            {tickValues.map((tick, index) => {
              const y = top + chartHeight - (tick / tickMax) * chartHeight;
              return (
                <g key={index}>
                  <line x1={left} x2={width - right} y1={y} y2={y} stroke="var(--border)" strokeOpacity="0.75" strokeDasharray={index === 0 ? "0" : "3 6"} />
                  <text x={left - 10} y={y + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="10">{number(tick)}</text>
                </g>
              );
            })}
            {areaPath ? (
              <motion.path
                d={areaPath}
                fill="url(#portfolio-visits-area)"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
              />
            ) : null}
            {linePath ? (
              <motion.path
                d={linePath}
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            ) : null}
            {points.map((point) => (
              <circle key={point.date} cx={point.x} cy={point.y} r={daily.length <= 14 ? 3 : 1.8} fill="var(--brand)" opacity={daily.length <= 14 ? 0.9 : 0.7}>
                <title>{point.date}: {number(point.visits)} visits</title>
              </circle>
            ))}
            {labelIndices.map((index) => {
              const point = points[index];
              return (
                <text key={point.date} x={point.x} y={height - 12} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} fill="var(--text-tertiary)" fontSize="10">
                  {formatDate(point.date + "T00:00:00Z")}
                </text>
              );
            })}
          </svg>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-xs text-text-secondary">
            <span>{number(totalVisits)} visits in this period</span>
            <span>Peak day: {number(maxValue)}</span>
          </div>
        </div>
      ) : <EmptyState message="No daily visit data is available for this period." />}
    </section>
  );
}

function BreakdownCard({ title, description, items, labelFor }) {
  const maxValue = Math.max(1, ...items.map((item) => Number(item.visits) || 0));

  return (
    <section className="min-w-0 border border-border bg-surface-1 p-5" aria-label={title}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-text-tertiary">{description}</p>
      {items.length ? (
        <ol className="mt-5 space-y-4">
          {items.map((item, index) => {
            const value = Number(item.visits) || 0;
            const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
            return (
              <li key={item.key || item.path || item.source || item.city || item.deviceType || item.pageType || index}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-text-secondary">{labelFor(item)}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-text-primary">{number(value)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden bg-surface-2">
                  <motion.div
                    className="h-full bg-brand"
                    initial={false}
                    animate={{ width: percentage + "%" }}
                    transition={{ duration: 0.55, delay: index * 0.035 }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      ) : <EmptyState message="No visits recorded in this breakdown yet." />}
    </section>
  );
}

function RecentVisitsTable({
  visits,
  nextCursor,
  days,
  error,
  newVisitIds = new Set(),
  selectedVisitIds = new Set(),
  onToggleVisit,
}) {
  const nextHref = nextCursor
    ? "/admin/portfolio/analytics?days=" + days + "&cursor=" + encodeURIComponent(nextCursor)
    : null;

  return (
    <section className="border border-border bg-surface-1" aria-labelledby="recent-visits-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 id="recent-visits-title" className="text-sm font-semibold">Visitor activity</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            One row per page visit, with visitor identity, device and approximate location. Verified account emails are masked.
          </p>
        </div>
        <span className="text-xs text-text-tertiary">{visits.length} records shown</span>
      </div>

      {error ? (
        <p role="alert" className="px-5 py-6 text-xs leading-5 text-warning">{error}</p>
      ) : visits.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1480px] border-collapse text-left text-xs">
              <thead className="bg-surface-2 text-[10px] uppercase tracking-[0.12em] text-text-tertiary">
                <tr>
                  <th className="w-10 px-3 py-3 font-medium">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3 font-medium">Visitor name</th>
                  <th className="px-4 py-3 font-medium">Raw account ID</th>
                  <th className="px-4 py-3 font-medium">Email (masked)</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Page visited</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 text-right font-medium">Visible time</th>
                  <th className="px-5 py-3 text-right font-medium">Visited</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => {
                  const DeviceIcon = getDeviceIcon(visit.deviceType);
                  const isNew = newVisitIds.has(visit.id);
                  const isVerified = visit.visitor?.kind === "verified";
                  return (
                    <motion.tr
                      key={visit.id}
                      initial={isNew ? { opacity: 0, y: 10 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="border-t border-border align-middle"
                    >
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedVisitIds.has(visit.id)}
                          onChange={(event) => onToggleVisit?.(visit.id, event.target.checked)}
                          aria-label={"Select visit for " + visit.path}
                          className="size-4 accent-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
                        />
                      </td>
                      <td className="max-w-[180px] px-4 py-4">
                        <span className="block truncate font-medium text-text-primary">
                          {isVerified ? visit.visitor.name || "Verified account" : "Guest visitor"}
                        </span>
                      </td>
                      <td className="max-w-[240px] px-4 py-4">
                        {isVerified && visit.visitor.accountId ? (
                          <span
                            className="block break-all font-mono text-[10px] leading-5 text-text-secondary"
                            title={visit.visitor.accountId}
                          >
                            {visit.visitor.accountId}
                          </span>
                        ) : (
                          <span className="text-text-tertiary">
                            {isVerified ? "Not captured on this visit" : "—"}
                          </span>
                        )}
                      </td>
                      <td className="max-w-[190px] px-4 py-4">
                        {isVerified && visit.visitor.email ? (
                          <span className="block truncate text-text-secondary">{visit.visitor.email}</span>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {isVerified ? (
                          <span className="inline-flex items-center rounded border border-success/30 bg-success/10 px-1.5 py-0.5 text-[9px] font-semibold text-success">
                            Verified
                          </span>
                        ) : (
                          <span className="text-text-tertiary">Guest / unverified</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 text-text-secondary">
                          <DeviceIcon size={14} aria-hidden="true" />
                          {getDeviceLabel(visit.deviceType)}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-4 py-4 text-text-secondary">
                        <span className="block truncate">{getLocationLabel(visit)}</span>
                      </td>
                      <td className="max-w-[250px] px-4 py-4">
                        <span className="block truncate font-medium text-text-primary">{getPageLabel(visit.pageType)}</span>
                        <span className="mt-1 block truncate font-mono text-[10px] text-text-tertiary">{visit.path}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block font-medium text-text-secondary">{getSourceLabel(visit)}</span>
                        {visit.referrerHost ? <span className="mt-1 block max-w-[140px] truncate text-[10px] text-text-tertiary">{visit.referrerHost}</span> : null}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-text-secondary">{formatDuration(visit.activeSeconds)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-text-secondary">
                        <time dateTime={new Date(visit.startedAt).toISOString()}>
                          {formatDate(visit.startedAt, { year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </time>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {nextHref ? (
            <div className="flex justify-center border-t border-border px-5 py-4">
              <Link href={nextHref} scroll={false} className="inline-flex min-h-9 items-center justify-center border border-border px-4 text-xs font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                Load older visits
              </Link>
            </div>
          ) : (
            <p className="border-t border-border px-5 py-3 text-center text-[11px] text-text-tertiary">You’re viewing the end of this period.</p>
          )}
        </>
      ) : (
        <div className="px-5 py-8">
          <EmptyState message="No visits have been recorded in this period yet. Real visit data will appear here after tracking is enabled." />
        </div>
      )}
    </section>
  );
}

export default function PortfolioAnalyticsDashboard({
  report: initialReport,
  recentVisits: initialRecentVisits = [],
  nextCursor: initialNextCursor = null,
  days = 30,
  cursor = null,
  reportError: initialReportError = "",
  recentError: initialRecentError = "",
}) {
  const {
    report,
    recentVisits,
    nextCursor,
    reportError,
    recentError,
    refreshing,
    summaryRefreshing,
    recentRefreshing,
    lastSummaryUpdatedAt,
    refreshNow,
    newVisitIds,
  } = usePortfolioAnalyticsPolling({
    days,
    cursor,
    initialReport,
    initialRecentVisits,
    initialNextCursor,
    initialReportError,
    initialRecentError,
  });
  const reduceMotion = useReducedMotion();
  const [selectedVisitIds, setSelectedVisitIds] = useState(() => new Set());
  const overview = report?.overview || {
    totalVisits: 0,
    uniqueTabSessions: 0,
    averageActiveSeconds: 0,
    totalActiveSeconds: 0,
  };
  const daily = report?.daily || [];

  const toggleVisitSelection = (visitId, selected) => {
    setSelectedVisitIds((current) => {
      const next = new Set(current);
      if (selected) {
        if (next.size >= 25) return current;
        next.add(visitId);
      } else {
        next.delete(visitId);
      }
      return next;
    });
  };

  const handleDeletionComplete = (result) => {
    setSelectedVisitIds(new Set());
    refreshNow();
    return result;
  };

  return (
    <div className="mt-7 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Reporting period</p>
          <p className="mt-1 text-sm text-text-secondary">Page visits and visible activity across your public portfolio.</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Auto-refresh while this tab is visible
            </span>
            <span>Summary 10s · Recent visits 30s</span>
            {lastSummaryUpdatedAt ? (
              <time dateTime={lastSummaryUpdatedAt}>
                Updated {formatDate(lastSummaryUpdatedAt, { year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </time>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refreshNow}
            disabled={refreshing}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-3 text-xs font-semibold text-text-secondary transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand/45 hover:bg-surface-2 hover:text-brand hover:shadow-sm active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <RefreshCw size={13} className={refreshing && !reduceMotion ? "animate-spin" : ""} aria-hidden="true" />
            Refresh now
          </button>
          <nav aria-label="Portfolio analytics reporting period" className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-1/80 p-1 shadow-sm">
          {[7, 30, 60].map((period) => (
            <Link
              key={period}
              href={"/admin/portfolio/analytics?days=" + period}
              aria-current={days === period ? "page" : undefined}
              className={[
                "inline-flex h-8 min-w-11 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none",
                days === period
                  ? "border-brand/40 bg-brand-soft text-brand shadow-[0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-brand/15"
                  : "border-transparent text-text-secondary hover:-translate-y-0.5 hover:border-border hover:bg-surface-2 hover:text-text-primary hover:shadow-sm active:scale-[0.98]",
              ].join(" ")}
            >
              {period}D
            </Link>
          ))}
        </nav>
        </div>
      </div>

      {reportError || recentError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-warning/40 bg-warning/10 px-4 py-3 text-xs leading-5 text-warning" role="status">
          <span>
            {reportError || recentError} Showing the last successful data where available.
          </span>
          <button type="button" onClick={refreshNow} className="font-semibold underline underline-offset-2">
            Retry now
          </button>
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Portfolio visit overview">
        <MetricCard icon={EyeIcon} label="Page visits" value={overview.totalVisits} detail="Eligible page loads in this period" index={0} />
        <MetricCard icon={UsersIcon} label="Tab sessions" value={overview.uniqueTabSessions} detail="Distinct temporary browser-tab sessions" index={1} />
        <MetricCard icon={ClockIcon} label="Average visible time" value={overview.averageActiveSeconds} detail="Foreground seconds per page visit" duration index={2} />
        <MetricCard icon={ActivityIcon} label="Total visible time" value={overview.totalActiveSeconds} detail="Accumulated foreground page time" duration index={3} />
      </section>

      <VisitsTrendChart daily={daily} days={days} />

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Traffic breakdowns">
        <BreakdownCard
          title="Top pages"
          description="Most visited routes during this period."
          items={(report?.topPages || []).map((item) => ({ ...item, key: item.path }))}
          labelFor={(item) => item.path}
        />
        <BreakdownCard
          title="Traffic sources"
          description="External referrers, campaigns, direct and internal navigation."
          items={(report?.sources || []).map((item) => ({ ...item, key: item.sourceType + ":" + item.source + ":" + (item.medium || "") }))}
          labelFor={getSourceLabel}
        />
        <BreakdownCard
          title="Locations"
          description="Coarse IP-derived location metadata. Missing values remain unknown."
          items={(report?.cities || []).map((item) => ({ ...item, key: item.countryCode + ":" + item.city + ":" + (item.regionCode || "") }))}
          labelFor={getLocationLabel}
        />
        <BreakdownCard
          title="Devices"
          description="Coarse browser device categories."
          items={(report?.devices || []).map((item) => ({ ...item, key: item.deviceType }))}
          labelFor={(item) => getDeviceLabel(item.deviceType)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <BreakdownCard
          title="Page types"
          description="Distribution across tracked public page types."
          items={(report?.pageTypes || []).map((item) => ({ ...item, key: item.pageType }))}
          labelFor={(item) => getPageLabel(item.pageType)}
        />
        <article className="border border-border bg-surface-1 p-5">
          <div className="flex items-center gap-2">
            <MousePointer2 size={16} className="text-text-tertiary" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Measurement notes</h2>
          </div>
          <ul className="mt-4 space-y-2 text-xs leading-5 text-text-secondary">
            <li>• A page visit is one tracked page load, not a unique person.</li>
            <li>• Tab sessions are temporary and may represent the same person more than once.</li>
            <li>• Visible time counts only while the page is in the foreground.</li>
            <li>• Location is approximate country, region and city; raw IP is not stored in visit records.</li>
            <li>• Reporting dates use UTC. Visit timestamps are displayed in India Standard Time.</li>
          </ul>
        </article>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 -mb-3 text-[11px] text-text-tertiary">
        <span>{recentRefreshing ? "Refreshing recent visits…" : "Recent visits refresh every 30 seconds"}</span>
        {summaryRefreshing ? <span>Updating summary…</span> : null}
      </div>
      <PortfolioAnalyticsDeletionControls
        selectedVisitIds={[...selectedVisitIds]}
        onClearSelection={() => setSelectedVisitIds(new Set())}
        onDeleted={handleDeletionComplete}
      />
      <RecentVisitsTable
        visits={recentVisits}
        nextCursor={nextCursor}
        days={days}
        error={recentError}
        newVisitIds={newVisitIds}
        selectedVisitIds={selectedVisitIds}
        onToggleVisit={toggleVisitSelection}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[11px] text-text-tertiary">
        <span>{report?.generatedAt ? "Last generated " + formatDate(report.generatedAt, { year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Analytics summary unavailable"}</span>
        <span className="inline-flex items-center gap-2">
          <Globe2 size={13} aria-hidden="true" />
          Private owner report · No public analytics access
        </span>
      </div>
    </div>
  );
}
