import React from "react";
import { FiPhone } from "react-icons/fi";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import ContactOption from "./ContactOption";

export default function QuickContactCard({
  contactOptions,
  copied,
  onCopyEmail,
  isDarkMode,
}) {
  const getGlowingCardColor = () => {
    return isDarkMode ? "var(--darkgrad-primary)" : "var(--grad-primary)";
  };

  return (
    <GlowingCard 
      color={getGlowingCardColor()}
      borderRadius="20px"
    >
      <div className="md:p-6 px-3 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-accent/10 dark:bg-darkAccent/10">
            <FiPhone className="md:text-xl text-accent dark:text-darkAccent" />
          </div>
          <div>
          <h3 className="md:text-xl text-lg font-semibold text-para1 font-open-sans dark:text-darkPara1">
            Quick Contact
          </h3>
          <p className="md:text-[0.8rem]  text-[0.8rem] mt-1 pl-1   font-open-sans  text-para2 dark:text-darkPara2">
            Just One Click Away
          </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {contactOptions.map((option, index) => (
            <ContactOption
              key={option.label}
              option={option}
              index={index}
              copied={copied && option.label === "Email"}
              onCopyEmail={onCopyEmail}
            />
          ))}
        </div>

        
      </div>
    </GlowingCard>
  );
}