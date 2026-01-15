"use client";

import useDarkModeReminder from "@/app/hooks/useDarkModeReminder";

export default function DarkModeReminderProvider() {
  useDarkModeReminder();
  return null;
}
