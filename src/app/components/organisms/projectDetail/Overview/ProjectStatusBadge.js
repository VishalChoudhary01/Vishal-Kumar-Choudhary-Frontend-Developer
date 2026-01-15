"use client";
import { motion } from "motion/react";
import { getStatusColor } from "@/app/lib/utils/getStatusColor";
import useDarkMode from "@/app/hooks/useDarkMode";

export default function ProjectStatusBadge({ status }) {
  const { isDarkMode } = useDarkMode();
  if (!status) return null;

  const color = getStatusColor(status, isDarkMode);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 md:px-4 md:py-2 px-2.5 py-1.5 md:text-md  text-[0.75rem]  font-medium"
      style={{
        background: `${color}18`,
        color,
        borderLeft: `1px solid ${color}40`,
        borderBottom: `1px solid ${color}40`,
        borderTopRightRadius: "1rem",  
        borderBottomLeftRadius: "0.75rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      />
      {status}
    </motion.div>
  );
}
