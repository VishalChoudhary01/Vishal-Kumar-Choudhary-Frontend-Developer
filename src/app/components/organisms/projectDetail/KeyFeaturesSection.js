"use client";
import {FaStar,FaRocket,FaMobile,FaPalette,FaCog,FaDatabase,FaServer,FaShieldAlt,FaBolt,FaUsers,FaChartLine,FaLayerGroup,FaToolbox,} from "react-icons/fa";
import { motion } from "motion/react";
import { IoSparkles } from "react-icons/io5";
import Heading from "../../atoms/typography/Heading/Heading";
import GlowingCard from "../../molecules/cards/GlowingCard";
import useDarkMode from "@/app/hooks/useDarkMode";

const featureIcons = [FaRocket,FaMobile,FaPalette,FaCog,FaDatabase,FaServer,FaShieldAlt,FaBolt,FaUsers,FaChartLine,FaLayerGroup,FaToolbox,];

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function KeyFeaturesSection({ project }) { 
  const { isDarkMode } = useDarkMode(); 
  
  if (!project.keyFeatures || project.keyFeatures.length === 0) {
    return null;
  }

  // Determine colors based on theme
  const accentColor = isDarkMode ? "var(--darkgrad-primary)" : "var(--grad-primary)";

const glassGradbackgroundBadge=`border font-roboto border-grad-primary/5  border-darkgrad-primary/25     capitalize  bg-linear-to-r text-grad-primary dark:text-darkgrad-primary from-grad-primary/10 to-grad-secondary/5 dark:from-darkgrad-primary/10 dark:to-darkgrad-secondary/5 md:text-xs sm:text-sm text-[0.8rem] rounded-full`

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-6xl mx-auto px-4 sm:px-6"
    >
      <Heading
        heading="Key Features"
        subheading="Innovative features that make this project stand out"
        align="center"
      />

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        variants={staggerContainer}
      >
        {project.keyFeatures.map((feature, index) => {
          const Icon = featureIcons[index % featureIcons.length];
          return (
            <motion.div
              key={index}
              className="group relative"
              variants={scaleIn}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <GlowingCard 
                color={accentColor}
                className="h-full border border-gray-400/15   dark:border-neutral-400/20 shadow"
                borderRadius="12px"
              >
                <div className="relative z-20 h-full p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="md:p-2 p-1  sm:p-3 rounded-lg shrink-0">
                      <Icon className="text-md md:text-xl sm:text-base text-grad-primary dark:text-darkgrad-primary "/>
                    </div>
                    <div>
                      <h3 className="md:text-base text-[0.95rem] sm:text-lg font-roboto font-semibold text-h3 dark:text-Head3dark mb-1">
                        {feature.title}
                      </h3>
                      <p className="md:text-sm text-[0.9rem] leading-5  text-para2 font-open-sans dark:text-darkPara2 md:leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {feature.highlight && (
                    <div className="mt-3 font-roboto capitalize sm:mt-4 pt-3 sm:pt-4 border-t border-lightBorder dark:border-darkBorder">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${glassGradbackgroundBadge}`}>
                        <IoSparkles className="text-sm " />
                        <span  className="font-medium " >
                          {feature.highlight}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </GlowingCard>
              
            </motion.div>
          );
        })}
      </motion.div>

      {/* Optional: Feature count badge */}
      {project.keyFeatures.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 text-center"
        >
          <div  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full  ${glassGradbackgroundBadge}`} >
            <FaStar className="md:text-sm" />
            <span className="text-[0.78rem]  md:text-[0.9rem] text-para1 flex  gap-x-2 capitalize dark:text-darkPara1 font-roboto">
              <span className="font-medium " >
                {project.keyFeatures.length}
              </span>
              <span className="tracking-wider text-h3 dark:text-Head3dark ">key features</span> 
            </span>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}