import { LuLanguages } from "react-icons/lu";
import { HiCode } from "react-icons/hi";
import { FaDatabase } from "react-icons/fa";
import { BsTools } from "react-icons/bs";
// import { FaReact } from "react-icons/fa6";
import { FaReact } from "react-icons/fa"

export const skillsData = {
  frontend: [
    "HTML / HTML5",
    "CSS / CSS3",
    "Tailwind CSS",
    "JavaScript (ES6+)",
    "React.js",
    "Redux Toolkit",
    "Next.js",
    "Motion",
    "TypeScript",
    "Zustand",
    "React Query",
    "React Router",
  ],
  backend: ["Node.js", "Express.js", "MongoDB", "REST APIs"],
  languages: ["JavaScript", "HTML", "CSS"],
  tools: ["Git", "Vite","Figma", "VS Code", "Postman","Swagger", "Responsively App"],
};

export const categories = [
  
  {
    title: "Frontend Development",
    icon: <FaReact />,
    gradientColor: "var(--grad-primary)",
    darkGradientColor: "var(--darkgrad-primary)",
    lightTextShadow: "var(--grad-primary)",
    darkTextShadow: "var(--darkgrad-primary)",
    skills: skillsData.frontend,
    colorIndex: 0
  },
  // {
  //   title: "Backend Development",
  //   icon: <FaDatabase />,
  //   gradientColor: "var(--grad-secondary)",
  //   darkGradientColor: "var(--darkgrad-secondary)",
  //   lightTextShadow: "var(--grad-secondary)",
  //   darkTextShadow: "var(--darkgrad-secondary)",
  //   skills: skillsData.backend,
  //   colorIndex: 1
  // },
  // {
  //   title: "Programming Languages",
  //   icon: <LuLanguages />,
  //   gradientColor: "var(--grad-tertiary)",
  //   darkGradientColor: "var(--darkgrad-tertiary)",
  //   lightTextShadow: "var(--grad-tertiary)",
  //   darkTextShadow: "var(--darkgrad-tertiary)",
  //   skills: skillsData.languages,
  //   colorIndex: 2
  // },
  {
    title: "Tools & Software",
    icon: <BsTools />,
    gradientColor: "var(--grad-quaternary)",
    darkGradientColor: "var(--darkgrad-quaternary)",
    lightTextShadow: "var(--grad-quaternary)",
    darkTextShadow: "var(--darkgrad-quaternary)",
    skills: skillsData.tools,
    colorIndex: 3
  },
];