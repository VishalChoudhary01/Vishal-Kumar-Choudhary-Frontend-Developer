import { FaReact, FaHtml5, FaCss3Alt, FaJs, FaGitAlt } from "react-icons/fa";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiFramer,
  SiRedux,
  SiReactrouter,
  SiReactquery,
} from "react-icons/si";

const techStack = [
  { name: "React", icon: <FaReact />, color: "#61DAFB", darkColor: "#80E8FF" },
  {
    name: "Next.js",
    icon: <SiNextdotjs />,
    color: "#000000",
    darkColor: "#FFFFFF",
  },
  { name: "HTML5", icon: <FaHtml5 />, color: "#E34F26", darkColor: "#FF784D" },
  { name: "CSS3", icon: <FaCss3Alt />, color: "#1572B6", darkColor: "#33A9FF" },
  {
    name: "JavaScript",
    icon: <FaJs />,
    color: "#F7DF1E",
    darkColor: "#FFF270",
  },
  {
    name: "Tailwind CSS",
    icon: <SiTailwindcss />,
    color: "#06B6D4",
    darkColor: "#2DD4BF",
  },
  { name: "Git", icon: <FaGitAlt />, color: "#F05032", darkColor: "#FF7043" },
  {
    name: "Framer Motion",
    icon: <SiFramer />,
    color: "#0055FF",
    darkColor: "#4C8DFF",
  },
  {
    name: "Redux Toolkit",
    icon: <SiRedux />,
    color: "#764ABC",
    darkColor: "#A970FF",
  },
  {
    name: "React Router",
    icon: <SiReactrouter />,
    color: "#CA4245",
    darkColor: "#FF6B6B",
  },
  {
    name: "TanStack Query",
    icon: <SiReactquery />,
    color: "#FF4154",
    darkColor: "#FF6B81",
  },
];

export default techStack