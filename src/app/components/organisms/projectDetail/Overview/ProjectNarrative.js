"use client";

export default function ProjectNarrative({ project }) {
  return (
    <div className="max-w-3xl text-center space-y-4">
      <h3 className="font-roboto font-medium mb-2 lg:text-[1.85rem] md:text-[1.6rem] text-[1.25rem] text-h1 dark:text-Head1dark">
        About Project
      </h3>

      <p className="lg:text-[1.2rem] md:text-[1.05rem] text-[0.98rem] text-para2 font-open-sans dark:text-darkPara2 leading-relaxed">
        {project.about.short}
      </p>
    </div>
  );
}
