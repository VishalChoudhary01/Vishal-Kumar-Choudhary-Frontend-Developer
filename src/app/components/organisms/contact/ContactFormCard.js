import React from "react";
import { FiStar } from "react-icons/fi";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import ShineHoverCurtainButton from "@/app/components/atoms/button/ShineHoverCurtainButton/ShineHoverCurtainButton";
import ProjectTypeSelector from "./ProjectTypeSelector";
import { RiSendPlaneFill } from "react-icons/ri";
import {Input,TextArea} from '@/app/components/atoms/form/index'

export default function ContactFormCard({
  formData,
  projectTypes,
  onFormChange,
  onSubmit,
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
      <div className="px-3 py-5   md:px-8 md:pt-7 md:pb-14">
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 md:mb-3 mb-1">
            <div className="p-2.5 rounded-xl bg-accent/10 dark:bg-darkAccent/10">
              <FiStar className="text-md md:text-xl text-accent dark:text-darkAccent" />
            </div>
            <h2 className="text-lg md:text-2xl font-semibold text-para1 dark:text-darkPara1">
              Let's Start Your Project
            </h2>
          </div>
          <p className="text-[0.8rem] md:text-base text-para2 dark:text-darkPara2 md:pl-11 pl-12">
            Tell me about your project and I'll get back to you within 24 hours
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 md:space-y-8">
          <ProjectTypeSelector
            projectTypes={projectTypes}
            selectedValue={formData.category}
            onChange={onFormChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label="Your Name *"
              name="name"
              value={formData.name}
              onChange={onFormChange}
              placeholder="Your Full Name"
              required
            />
            
            <Input
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={onFormChange}
              placeholder="your@company.com"
              required
            />
          </div>

          <TextArea
            label="Project Details *"
            name="message"
            value={formData.message}
            onChange={onFormChange}
            placeholder="Tell me about your project, timeline, and budget..."
            rows={4}
            required
          />

          <div className="pt-2 md:pt-4 flex justify-center">
  <ShineHoverCurtainButton
    type="submit"
    leftIcon={<RiSendPlaneFill />}
    className="w-full max-w-[300px] md:max-w-[400px]   px-2 py-2 text-[0.92rem] md:px-6 md:py-3 md:text-base font-roboto"
    fullWidth={false}
  >
    Send Message & Schedule Call
  </ShineHoverCurtainButton>
</div>
        </form>
      </div>
    </GlowingCard>
  );
}

