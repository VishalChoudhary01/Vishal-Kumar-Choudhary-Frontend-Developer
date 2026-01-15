import { IoCodeSlash } from "react-icons/io5";

import { RiNextjsFill } from "react-icons/ri";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiFramer,
  SiTypescript,
  SiReact,
  SiVite,
  SiNodedotjs,
  SiMongodb,
  SiExpress,
  SiVercel,
  SiFirebase,
  SiRedux,
  SiGraphql,
  SiDocker,
  SiJest,
  SiAxios,
  SiReactrouter,
} from "react-icons/si";
import { TbBrandFramerMotion } from "react-icons/tb";
import { GrLineChart } from "react-icons/gr";
import { SiZod } from "react-icons/si";
import { SiReacthookform } from "react-icons/si";

export const techIcons = {
  // Frontend
  React: SiReact,
  Vite: SiVite,
  "Tailwind CSS": SiTailwindcss,
  Motion: TbBrandFramerMotion,
  "Framer Motion": TbBrandFramerMotion,
  "React Router": SiReactrouter,
  "React Icons": IoCodeSlash,
  Recharts: GrLineChart,
  "Next.js":SiNextdotjs,
  "react-hook":SiReacthookform,
  "react-hook-form":SiReacthookform,

  // Backend
  "Node.js": SiNodedotjs,
  Express: SiExpress,
  MongoDB: SiMongodb,

  // Tools & Libraries
  "Redux Toolkit": SiRedux,
  Redux: SiRedux,
  TypeScript: SiTypescript,
  GraphQL: SiGraphql,
  NextJS: SiNextdotjs,
  "Nextjs": SiNextdotjs,
  zod:SiZod,
  "react-hook":SiReacthookform,
  "react-hook-form":SiReacthookform,

  Firebase: SiFirebase,
  Docker: SiDocker,
  Jest: SiJest,
  Axios: SiAxios,
  Vercel: SiVercel,
};

export const getTechIcon = (techName) => {
  return techIcons[techName] || IoCodeSlash;
};
