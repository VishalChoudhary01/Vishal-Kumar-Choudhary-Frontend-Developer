import React from "react";
import { Heading } from "@/app/components/atoms/typography/index";
import CarouselProjects from "@/app/components/organisms/projectCarousel/CarouselProjects";

const ProjectsCarousel = () => {
  return (
    <div id="projects">
      <Heading
        heading="Projects"
        subheading="Selected projects demonstrating design decisions, implementation details, and impact."
      />
      <CarouselProjects />
    </div>
  );
};

export default ProjectsCarousel;
