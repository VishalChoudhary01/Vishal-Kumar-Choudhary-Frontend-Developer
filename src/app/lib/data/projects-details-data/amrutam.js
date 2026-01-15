import amurtamBanner_desktop from "../../../../../public/images/project carousel/amurtam/amurtamBanner.webp";
import testimonal_desktop from "../../../../../public/images/project carousel/amurtam/gallery/testimonial_doctors.webp";
import search_filter_doctor_desktop from "../../../../../public/images/project carousel/amurtam/gallery/search_filter_doctor.webp";
import amurtamTopBannerHomeDesktop from "../../../../../public/images/project carousel/amurtam/gallery/amurtamTopBannerHomeDesktop.webp";

// Mobile imports
import amurtam_proces_mobile from "../../../../../public/images/project carousel/amurtam/gallery/mobile/amurtam_process_mobile.webp";
import amurtamDoctors from "../../../../../public/images/project carousel/amurtam/gallery/mobile/amurtamDoctors.png";
import mobile_hero from "../../../../../public/images/project carousel/amurtam/gallery/mobile/mobile_hero.webp";

// Icons
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { FaMobileAlt } from "react-icons/fa";

const amrutam = {
  id: 4,
  name: "Amrutam",
  projectType: "Healthcare Landing Page",
  description:
    "A modern healthcare platform bridging traditional Ayurvedic medicine with digital accessibility.",
  image: amurtamBanner_desktop,
  technologies: [
    "React",
    "Tailwind CSS",
    "Framer Motion",
    "Vite",
    "React Router",
  ],
  liveUrl: "https://amurtam-frontend.vercel.app/",
  githubUrl: "https://github.com/VishalChoudhary01/amurtam-frontend",
  figmaUrl:
    "https://www.figma.com/design/6sg7GHDwjkcXdPq6ULtZDS/Amurtam-frontend?t=OwWMbZZQpFhaxf7A-1",
  category: "Healthcare & Wellness",
  year: "2023",
  about: {
    short:
      "Frontend assignment focused on converting a provided Figma design into a responsive, production-ready healthcare landing page using React and Tailwind CSS, with emphasis on layout accuracy and smooth animations.",
  },

  longDescription:
    "Amrutam is a healthcare platform that connects users with Ayurvedic practitioners. Built with modern React patterns, it demonstrates advanced UI/UX principles and responsive design.",

  stats: {
    developmentTime: "4 Days",
    pages: "2",
    components: "10+",
    responsiveBreakpoints: "3",
    lighthousePerformance: 79,
    lighthouseAccessibility: 85,
    lighthouseBestPractices: 92,
    lighthouseSEO: 91,
    loadTime: "1.8s",
    coreWebVitals: "Good",
  },

  bentoGrid: [
    {
      id: 1,
      title: "Amrutam – Ayurvedic Consultation Platform (Homepage Design)",
      description:
        "A modern, conversion-focused homepage design for an Ayurvedic healthcare platform. The layout emphasizes trust, holistic healing, and accessibility with a strong hero section, clear value propositions, and intuitive call-to-actions for booking expert consultations. Designed to balance visual calmness with usability, reflecting the essence of Ayurveda through typography, color, and imagery.",
      image: amurtamBanner_desktop,
      gridPosition: "md:col-span-2 md:row-span-2",
      category: "design",
      size: "wide", 
    },
    {
      id: 2,
      title: "Desktop Hero Section",
      description: "Hero section with featured doctors and call-to-action",
      image: testimonal_desktop,
      gridPosition: "md:col-span-2 md:row-span-2",
      category: "design",
      size: "large",
    },
    {
      id: 3,
      title: "Ayurvedic Consultation Process – Mobile View",
      description:
        "Mobile carousel section explaining the step-by-step Ayurvedic consultation approach, guiding users from appointment booking to personalized treatment planning.",
      image: amurtam_proces_mobile,
      gridPosition: "md:col-span-1 md:row-span-3 ",
      category: "process",
      size: "medium",
    },
    {
      id: 4,
      title: "Ayurveda Experts – Mobile View",
      description:
        "Mobile carousel section showcasing certified Ayurveda doctors with ratings, experience, specialization, and a call-to-action to book a consultation.",
      image: amurtamDoctors,
      gridPosition: "md:col-span-1 md:row-span-3",
      category: "experts",
      size: "medium",
    },
    {
      id: 5,
      title: "Ayurveda Wellness Section – Mobile View",
      description:
        "Mobile view of the Ayurveda wellness section showcasing holistic healing principles, personalized wellness, and preventive care with a calm, responsive layout.",
      image: mobile_hero,
      gridPosition: "md:col-span-1 md:row-span-2",
      category: "mobile",
      size: "tall",
    },
    {
      id: 6,
      title: "Ayurvedic Consultation Platform – Hero Section",
      description:
        "Desktop homepage hero section for an Ayurveda healthcare platform highlighting holistic healing, certified doctor consultations, and seamless appointment booking.",
      image: amurtamTopBannerHomeDesktop,
      gridPosition: "md:col-span-1 md:row-span-1",
      category: "hero-section",
      size: "large",
    },
    {
      id: 7,
      title: "Doctor Search & Filters – Desktop View",
      description:
        "Desktop interface for finding expert Ayurvedic doctors with advanced search, location selection, and multi-criteria filters such as expertise, gender, fees, and language.",
      image: search_filter_doctor_desktop,
      gridPosition: "col-span-1 row-span-1",
      category: "search",
      size: "wide",
    },
  ],

  keyFeatures: [
    {
      title: "Interactive Doctor Discovery",
      description:
        "Advanced search and filtering system  for finding better doctors",
      highlight: "Dynamic Filtering",
    },
    {
      title: "Responsive Design",
      description:
        "Mobile-first approach with consistent experience across all devices",
      highlight: "Mobile Optimized",
    },
    
  ],

  techStack: {
    frontend: [
      { name: "React", version: "18.3.1" },
      { name: "Vite", version: "6.0.1" },
      { name: "Tailwind CSS", version: "3.4.16" },
      { name: "React Router", version: "7.0.2" },
      { name: "Motion", version: "11.15.0" },
      { name: "React Icons", version: "5.4.0" },
    ],
  },

 challenges: [
  {
    title: "First Figma to React Implementation",
    description:
      "This was my first experience converting a complete Figma design into a React application. Understanding layout hierarchy, spacing, and component structure while maintaining visual accuracy was initially challenging.",
    icon: BsFillRocketTakeoffFill,
  },
  {
    title: "Designing Mobile UI Without Figma Reference",
    description:
      "The provided Figma design only covered the desktop layout. Designing mobile and tablet views required independent decisions for layout restructuring, spacing, and content prioritization without predefined designs.",
    icon: FaMobileAlt,
  },
  {
    title: "Maintaining Design Consistency Across Breakpoints",
    description:
      "Ensuring visual consistency between desktop and mobile views while adapting components for smaller screens required careful planning and responsive layout adjustments.",
    icon: BsFillRocketTakeoffFill,
  },
  {
    title: "Assignment Scope vs Full Functionality",
    description:
      "As the project was a UI-focused assignment, there was limited clarity on backend flows and real data handling, making it necessary to focus on structure and presentation rather than full feature implementation.",
    icon: BsFillRocketTakeoffFill,
  },
],



  developmentInfo: {
    type: "Assignment Project",
    status: "Pending",
    focus: "UI/UX & Frontend Development",
  },

  pages: [
    {
      name: "Home",
      description: "Landing page with featured content and navigation",
      features: [
        "Hero section",
        "Doctor carousel",
        "Process steps",
        "Testimonials",
      ],
    },
  ],

  learningOutcomes: [
  "Learning how to convert a desktop-only Figma design into a responsive React application",
  "Gaining experience in making independent UI decisions for mobile and tablet layouts",
  "Improved understanding of responsive design principles using Tailwind CSS",
  "Learning how to balance design accuracy with usability on smaller screens",
  "Building confidence in structuring React components for scalable UI projects",
  "Understanding the importance of design systems when adapting layouts across devices",
],




  futureEnhancements: [
    "User authentication system",
    "Real-time chat functionality",
    "Advanced filtering options",
    "Dark mode implementation",
  ],
};

export default amrutam;
