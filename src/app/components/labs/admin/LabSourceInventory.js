"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  FileCode2,
  FolderPlus,
  LoaderCircle,
  RefreshCw,
  Search,
  SearchX,
} from "lucide-react";

const FILTERS = [
  { value: "all", label: "All experiments" },
  { value: "missing", label: "No source" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

function getSourceState(item) {
  if (!item.hasSource) return "missing";
  if (item.published) return "published";
  if (
    item.draftVersionId ||
    item.latestVersion ||
    item.versionCount > 0 ||
    (item.legacyVersion && item.legacyVersion !== "0.0")
  ) {
    return "draft";
  }
  return "setup";
}

function formatDate(value) {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StateLabel({ state }) {
  const config = {
    missing: {
      label: "Not created",
      className: "border-border bg-surface-2 text-text-tertiary",
    },
    setup: {
      label: "Needs files",
      className: "border-warning/40 bg-warning/10 text-warning",
    },
    draft: {
      label: "Draft saved",
      className: "border-border bg-surface-2 text-text-secondary",
    },
    published: {
      label: "Published",
      classNa¶»§q«^