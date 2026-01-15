"use client";
import { motion } from "motion/react";
import {
  FaSitemap,
  FaLayerGroup,
  FaSearch,
  FaUser,
  FaShoppingCart,
} from "react-icons/fa";
import { IoMdDesktop, IoMdPhonePortrait } from "react-icons/io";
import Heading from "../../atoms/typography/Heading/Heading";
import GlowingCard from "../../molecules/cards/GlowingCard";
import useDarkMode from "@/app/hooks/useDarkMode";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const pageIcons = {
  home: IoMdDesktop,
  search: FaSearch,
  profile: FaUser,
  cart: FaShoppingCart,
  about: FaSitemap,
  contact: FaUser,
  default: FaLayerGroup,
};

const glassGradbackgroundBadge = `border font-roboto border-grad-primary/5  border-darkgrad-primary/25     capitalize  bg-linear-to-r text-grad-primary dark:text-darkgrad-primary from-grad-primary/10 to-grad-secondary/5 dark:from-darkgrad-primary/10 dark:to-darkgrad-secondary/5 md:text-xs sm:text-sm text-[0.8rem]`;


export default function PagesStructureSection({ project }) {
  const { isDarkMode } = useDarkMode();

  if (!project.pages || project.pages.length === 0) {
    return null;
  }

  const primaryAccent = isDarkMode
    ? "var(--darkgrad-primary)"
    : "var(--grad-primary)";
  const secondaryAccent = isDarkMode
    ? "var(--darkgrad-secondary)"
    : "var(--grad-secondary)";

  const getPageIcon = (pageName) => {
    const name = pageName.toLowerCase();
    if (name.includes("home")) return pageIcons.home;
    if (name.includes("search")) return pageIcons.search;
    if (name.includes("profile") || name.includes("user"))
      return pageIcons.profile;
    if (name.includes("cart") || name.includes("shop")) return pageIcons.cart;
    return pageIcons.default;
  };

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-6xl mx-auto px-4 sm:px-6"
    >
      <Heading
        heading="Pages Structure"
        subheading="Overview of the website's page architecture and features"
        align="center"
      />

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
        {project.pages.map((page, index) => {
          const PageIcon = getPageIcon(page.name);
          return (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group"
              whileHover={{ y: -4 }}
              style={{ width: "100%", maxWidth: "350px" }}
            >
              <GlowingCard
                color={index % 2 === 0 ? primaryAccent : secondaryAccent}
                className="h-full border border-gray-400/15 dark:border-neutral-400/20 shadow"
                borderRadius="12px"
              >
                <div className="h-full p-4 sm:p-6">
                  <div className="flex items-center gap-3 md:mb-3 mb-2">
                    <div className="md:p-2 p-0.5 rounded-lg shrink-0">
                      <PageIcon
                        className={`text-lg ${index % 2 ===0 ? 'text-grad-primary dark:text-darkgrad-primary':'text-grad-secondary dark:text-darkgrad-secondary'}`}/>
                    </div>
                    <h3 className="md:text-base text-[0.9rem] font-open-sans sm:text-lg font-semibold text-h1 dark:text-Head1dark">
                      {page.name}
                    </h3>
                  </div>

                  <p className="md:text-sm text-[0.78rem] font-open-sans text-para2 dark:text-darkPara2 mb-4 leading-relaxed">
                    {page.description}
                  </p>

                  {page.features && page.features.length > 0 && (
                    <div className="space-y-2">
                      <p className="md:text-xs text-[0.85rem] font-medium text-h3 dark:text-Head3dark">
                        Key Features:
                      </p>
                      <ul className="space-y-1.5">
                        {page.features
                          .slice(0, 3)
                          .map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-start md:gap-2 gap-1.5 pl-2 md:pl-4 text-xs text-para2 dark:text-darkPara2"
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 font-roboto ${index % 2 === 0? 'bg-grad-primary dark:bg-darkgrad-primary' : 'bg-grad-secondary dark:bg-darkgrad-secondary'}`}/>
                              <span>{feature}</span>
                            </li>
                          ))}
                        {page.features.length > 3 && (
                          <li className="text-xs text-para2 dark:text-darkPara2 pl-3.5">
                            +{page.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </GlowingCard>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile/Desktop view summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`mt-8 sm:mt-12 flex  sm:flex-row items-center justify-center gap-4 sm:gap-8 `}
      >
        <div className= {`${glassGradbackgroundBadge} flex items-center md:gap-2 gap-x-1.5 md:px-4 md:py-1   px-3 py-1 rounded-full`}>
          <IoMdDesktop className="text-lg text-grad-primary dark:text-darkgrad-primary"  />
          <span className="text-sm flex gap-x-1 text-para2 dark:text-darkPara2 text-[0.78rem]  md:text-[0.9rem] ">
            <span className="font-medium text-para1 dark:text-darkPara1 " >
              {project.pages.length}
            </span>{" "}
            <span className="capitalize tracking-wider text-h3 dark:text-Head3dark">
              pages
            </span>
          </span>
        </div>

        {project.stats?.responsiveBreakpoints && (
          <div className={`${glassGradbackgroundBadge} flex items-center md:gap-2 gap-x-1.5 md:px-4 md:py-1   px-3 py-1 rounded-full`}> 
            <IoMdPhonePortrait
              className="text-lg text-grad-primary dark:text-darkgrad-primary"/>
            <span className="text-sm flex gap-x-1 text-para2 dark:text-darkPara2 text-[0.78rem]  md:text-[0.9rem]">
              <span className="font-medium text-para1 dark:text-darkPara1 "  >
                {project.stats.responsiveBreakpoints}
              </span>
              <span className="capitalize tracking-wider text-h3 dark:text-Head3dark">
              breakpoints
            </span>
            </span>
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}
