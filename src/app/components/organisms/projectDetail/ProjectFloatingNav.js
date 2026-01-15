"use client";

import { FaChevronLeft, FaShare } from "react-icons/fa";
import QuietShineButton from "@/app/components/atoms/button/QuietShineButton";

const ProjectFloatingNav = ({ router, isDarkMode, handleShare }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
      
      {/* Back Button */}
      <QuietShineButton
        label="Back"
        icon={FaChevronLeft}
        isDarkMode={isDarkMode}
        onClick={() => router.back()}
      />

      {/* Share Button (icon-only variant) */}
      <QuietShineButton
        label=""
        icon={FaShare}
        isDarkMode={isDarkMode}
        onClick={handleShare}
        className="px-4"
      />
    </div>
  );
};

export default ProjectFloatingNav;
