"use client";

import { useState } from "react";
import Heading from "@/app/components/atoms/typography/Heading/Heading";
import ExperienceList from "./ExperienceList";
import ExperienceCard from "./ExperienceCard";
import { experiences } from "@/app/lib/data/storyExperiencedata";

export default function WorkExperience() {
  const [activeId, setActiveId] = useState(experiences[0].id);
  const activeExperience = experiences.find(e => e.id === activeId);

  return (
    <section id="experience" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <Heading
        heading="Work Experience"
        subheading="A focused look at my professional journey, responsibilities, and impact."
      />

      <div className="grid md:grid-cols-[280px_1fr] gap-6 md:gap-10 overflow-hidden">
        <ExperienceList
          items={experiences}
          activeId={activeId}
          onChange={setActiveId}
        />

        <ExperienceCard experience={activeExperience} />
      </div>
    </section>
  );
}