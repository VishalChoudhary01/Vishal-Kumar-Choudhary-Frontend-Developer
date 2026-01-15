import React from "react";
import { FiDownload } from "react-icons/fi";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import ShineHoverCurtainButton from "@/app/components/atoms/button/ShineHoverCurtainButton/ShineHoverCurtainButton";
import { HiDownload } from "react-icons/hi";

export default function DownloadResumeCard({ isDarkMode }) {
  const getGlowingCardColor = () => {
    return isDarkMode ? "var(--darkgrad-primary)" : "var(--grad-primary)";
  };

  return (
    <GlowingCard 
      color={getGlowingCardColor()}
      borderRadius="20px"
    >
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-accent/10 dark:bg-darkAccent/10 mb-5">
            <FiDownload className="text-2xl text-accent dark:text-darkAccent" />
          </div>
          <h4 className="text-lg font-semibold mb-3 text-para1 dark:text-darkPara1 font-open-sans">
            Download Resume
          </h4>
          <p className="text-sm mb-6 max-w-xs text-para2 dark:text-darkPara2 font-open-sans">
            Get my detailed resume with skills, experience, and projects
          </p>
          <ShineHoverCurtainButton
            size="md"
            leftIcon={<HiDownload  className="text-xl animate-downloadingFlow"/>}
            onClick={() => window.open("./documents/Vishal_Kumar_Resume_frontend.pdf", "_blank")}
            className="w-full max-w-[300px] md:max-w-[400px]   px-2 py-2 text-[0.92rem] md:px-6 md:py-3 md:text-base font-roboto"
            fullWidth={false}
          >
            Download PDF
          </ShineHoverCurtainButton>
      
        </div>
      </div>
    </GlowingCard>
  );
}