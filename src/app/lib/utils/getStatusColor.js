export const getStatusColor = (status, isDarkMode) => {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower.includes('complete') || statusLower.includes('done') || statusLower.includes('live')) {
    return isDarkMode ? "#10b981" : "#059669"; // Green
  } else if (statusLower.includes('progress') || statusLower.includes('ongoing') || statusLower.includes('active')) {
    return isDarkMode ? "#f59e0b" : "#d97706"; // Amber
  } else if (statusLower.includes('pending') || statusLower.includes('planned') || statusLower.includes('upcoming')) {
    return isDarkMode ? "#f97316" : "#ea580c"; // Orange
  } else if (statusLower.includes('hold') || statusLower.includes('paused') || statusLower.includes('stopped')) {
    return isDarkMode ? "#ef4444" : "#dc2626"; // Red
  }
  
  // Default to theme accent color
  return isDarkMode ? "var(--darkgrad-primary)" : "var(--grad-primary)";
};
