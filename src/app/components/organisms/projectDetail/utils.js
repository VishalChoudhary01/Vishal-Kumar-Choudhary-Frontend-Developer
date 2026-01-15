// Color schemes for different projects
export const getProjectColors = (project, isDarkMode) => {
  const colorSchemes = [
    {
      primary: "from-blue-500/15 to-cyan-500/10",
      secondary: "bg-blue-500/20",
      accent: "border-blue-500/30",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      primary: "from-emerald-500/15 to-teal-500/10",
      secondary: "bg-emerald-500/20",
      accent: "border-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      primary: "from-violet-500/15 to-purple-500/10",
      secondary: "bg-violet-500/20",
      accent: "border-violet-500/30",
      text: "text-violet-600 dark:text-violet-400",
    },
    {
      primary: "from-rose-500/15 to-pink-500/10",
      secondary: "bg-rose-500/20",
      accent: "border-rose-500/30",
      text: "text-rose-600 dark:text-rose-400",
    },
    {
      primary: "from-amber-500/15 to-orange-500/10",
      secondary: "bg-amber-500/20",
      accent: "border-amber-500/30",
      text: "text-amber-600 dark:text-amber-400",
    },
  ];

  const scheme = colorSchemes[(project?.id || 1) % colorSchemes.length];
  return {
    ...scheme,
    cardBg: isDarkMode
      ? "bg-gray-900/40 backdrop-blur-lg border-gray-800/60"
      : "bg-white/70 backdrop-blur-lg border-gray-300/50",
    text: isDarkMode ? "text-gray-100" : "text-gray-900",
    textSecondary: isDarkMode ? "text-gray-400" : "text-gray-600",
    bg: isDarkMode ? "bg-gray-950/30" : "bg-white/30",
  };
};

// Share functionality
export const handleShare = async (project) => {
  const shareData = {
    title: project?.name || "Project",
    text: project?.description || "Check out this amazing project",
    url: window.location.href,
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      fallbackShare();
    }
  } else {
    fallbackShare();
  }
};

export const fallbackShare = () => {
  navigator.clipboard
    .writeText(window.location.href)
    .then(() => {
      alert("Project link copied to clipboard!");
    })
    .catch((err) => {
      alert("Failed to copy link. Please copy the URL manually.");
    });
};
