"use client";
import { SiLighthouse, SiSpeedtest } from "react-icons/si";
import { FaBolt } from "react-icons/fa";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import ProgressBar from "@/app/components/organisms/projectDetail/ProgressBar";

export default function LighthouseScoresCard({ project, primaryAccent }) {
  return (
    <GlowingCard
      color={primaryAccent}
      className="h-full border border-gray-400/15 dark:border-neutral-400/20 shadow-lg"
      borderRadius="16px"
    >
      <div className="h-full p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="md:p-3 p-2 rounded-md bg-linear-120 border border-grad-primary/15 dark:border-darkgrad-primary/15    from-grad-primary/15 to-grad-secondary/5 dark:from-darkgrad-primary/15 dark:to-darkgrad-secondary/5 ">
           <SiLighthouse   className="md:text-xl sm:text-2xl text-[1.1rem] text-grad-primary dark:text-darkgrad-primary"/>
          </div>
          <div>
            <h3 className="md:text-lg sm:text-xl text-[0.95rem] font-open-sans font-semibold text-h1 dark:text-Head1dark">
              Lighthouse Scores
            </h3>
            <p className="text-xs sm:text-sm text-h3 dark:text-Head3dark mt-1">
              Google Lighthouse performance audit results
            </p>
          </div>
        </div>

        {/* Progress Bars Grid */}
        <div className="space-y-4 sm:space-y-5">
          {project.stats.lighthousePerformance !== undefined && (
            <ProgressBar
              score={project.stats.lighthousePerformance}
              label="Performance"
            />
          )}

          {project.stats.lighthouseAccessibility !== undefined && (
            <ProgressBar
              score={project.stats.lighthouseAccessibility}
              label="Accessibility"
            />
          )}

          {project.stats.lighthouseBestPractices !== undefined && (
            <ProgressBar
              score={project.stats.lighthouseBestPractices}
              label="Best Practices"
            />
          )}

          {project.stats.lighthouseSEO !== undefined && (
            <ProgressBar score={project.stats.lighthouseSEO} label="SEO" />
          )}
        </div>

        {/* Additional Metrics */}
        <div className="flex justify-between mt-6 sm:mt-8 font-open-sans" >
          {project.stats.loadTime && (
              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-grad-primary/15 dark:border-darkgrad-primary/15 bg-linear-to-r from-grad-primary/10 to-grad-primary/5">
                <FaBolt className="text-sm text-grad-primary dark:text-darkgrad-primary"  />
                <div>
                  <p className="text-xs text-para3 font-open-sans dark:text-darkPara3">
                    Load Time
                  </p>
                  <p className="text-sm font-medium text-para1 font-roboto dark:text-darkPara1">
                    {project.stats.loadTime}
                  </p>
                </div>
              </div>
          )}

          {project.stats.coreWebVitals && (
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-grad-primary/15 dark:border-darkgrad-primary/15 bg-linear-to-r from-grad-primary/10 to-grad-primary/5">
                <SiSpeedtest className="text-sm text-grad-primary dark:text-darkgrad-primary"  />
                <div>
                  <p className="text-xs text-para3 font-open-sans dark:text-darkPara3">
                    Core Web Vitals
                  </p>
                  <p className="text-sm font-medium text-para1 font-roboto dark:text-darkPara1">
                    {project.stats.coreWebVitals}
                  </p>
                </div>
              </div>
          )}
        </div>
      </div>
    </GlowingCard>
  );
}