export const getIconColor = (isScrolled, isDarkMode) => {
  if (isScrolled) {
    return isDarkMode ? "text-neutral-50" : "text-neutral-950";
  }
  return isDarkMode ? "text-DrkIcon-text" : "text-icon-text";
};

