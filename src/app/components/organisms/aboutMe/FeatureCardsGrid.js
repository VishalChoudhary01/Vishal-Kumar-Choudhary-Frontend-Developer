import React from "react";
import FeatureCard from "./FeatureCard";

const FeatureCardsGrid = ({ repoCount, isDarkMode }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6 md:mb-8 font-roboto">
      <FeatureCard
        type="passion"
        isDarkMode={isDarkMode}
        delay={0.1}
      />
      
      <FeatureCard
        type="goals"
        isDarkMode={isDarkMode}
        delay={0.2}
      />
      
      {repoCount !== null && (
        <FeatureCard
          type="github"
          isDarkMode={isDarkMode}
          repoCount={repoCount}
          delay={0.3}
        />
      )}
    </div>
  );
};

export default FeatureCardsGrid;