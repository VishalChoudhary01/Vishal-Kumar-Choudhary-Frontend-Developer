// Trailor Ride imports
import trailorBanner from "../../../../../public/images/project carousel/trailor-ride/trailorBanner.webp";
import trailor_bentoGrid from '../../../../../public/images/project carousel/trailor-ride/gallery/bentogrid.webp';
import trailor_ride_desktop_testimonials from '../../../../../public/images/project carousel/trailor-ride/gallery/desktop_testimonials.webp';
import trailor_bikes_showcase from '../../../../../public/images/project carousel/trailor-ride/gallery/trailor_bikes_desktop.webp';


// mobile imports
import trailor_brands_mobile from '../../../../../public/images/project carousel/trailor-ride/gallery/mobile/brands.webp';
import trailor_community_mobile from '../../../../../public/images/project carousel/trailor-ride/gallery/mobile/community.webp';
import trailor_consumerFormMobile from '../../../../../public/images/project carousel/trailor-ride/gallery/mobile/consumForm.webp';
import trailor_customerbanner_mobile from '../../../../../public/images/project carousel/trailor-ride/gallery/mobile/customerbanner.webp';


import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { FaMobileAlt } from "react-icons/fa";


const trailorRide =  {
    id: 2,
    name: "Trailor Ride",
    projectType: "Motorcycle E-Commerce Landing Page",
    description:
      "A modern, high-performance motorcycle landing page showcasing premium models, generating leads, and promoting a mobile companion app.",
    image: trailorBanner,
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Motion",
      "React Icons",
    ],
    liveUrl: "https://trailor-trade.vercel.app",
    githubUrl: "https://github.com/VishalChoudhary01/Trailor-Trade-.git",
    figmaUrl:
      "https://www.figma.com/design/Z3IQPsEokQ9c2ho1n1wDTC/NextJS-Assignment--Part-1--by-webbywolf--Community---Copy-?node-id=31-6&t=I8ARFhLP9W6uRNVQ-1",
    category: "E-commerce & Automotive",
    year: "2024",
    about: {
      short:
        "Landing page implementation built from a provided design to showcase motorcycle models, focusing on responsive layout engineering, performance optimization, and polished UI animations using Next.js.",
    },

    longDescription:
      "Trailor Ride is a responsive landing page built with Next.js and Tailwind CSS designed to showcase motorcycle models, capture leads through conversion-focused forms, and promote the companion mobile app.",

    // Consolidated stats
    stats: {
      developmentTime: "5 Days",
      pages: "1 (Landing)",
      components: "20+",
      responsiveBreakpoints: "3",
      lighthousePerformance: 62,
      lighthouseAccessibility: 83,
      lighthouseBestPractices: 100,
      lighthouseSEO: 92,
      loadTime: "1.8s",
      coreWebVitals: "Good",
    },

    bentoGrid: [
      {
        id: 1,
        title: "Hero / Digital Showroom",
        description: "Large hero with featured motorcycles and primary CTA.",
        image: trailorBanner,
        gridPosition: "md:col-span-2 md:row-span-2",
        category: "design",
        size: "large",
      },
      {
        id: 2,
        title: "Community BentoGrid",
        description: "Community section with user stories and images.",
        image: trailor_bentoGrid,
        gridPosition: "md:col-span-2 md:row-span-2",
        category: "design",
        size: "medium",
      },
      {
        id: 3,
        title: "Bikes Showcase",
        description: "Model cards with specs and quick actions.",
        image: trailor_bikes_showcase,
        gridPosition: "md:col-span-1 md:row-span-1",
        category: "showcase",
        size: "medium",
      },
      {
        id: 4,
        title: "Testimonials",
        description: "Customer reviews carousel to build trust.",
        image: trailor_ride_desktop_testimonials,
        gridPosition: "md:col-span-1 md:row-span-1",
        category: "testimonials",
        size: "medium",
      },
      {
        id: 5,
        title: "Mobile View Brands Partnerships",
        description:
          "Showcase of brand logos and partnerships in mobile view.",
        image: trailor_brands_mobile,
        gridPosition: "md:col-span-1 md:row-span-2",
        category: "mobile",
        size: "tall",
      },
      {
        id: 6,
        title: "Mobile View Consumer Form",
        description: "Consumer form layout optimized for mobile devices.",
        image: trailor_consumerFormMobile,
        gridPosition: "md:col-span-1 md:row-span-2",
        category: "responsive",
        size: "tall",
      },
      {
        id: 7,
        title: "Mobile View Community Section",
        description: "Community section layout optimized for mobile devices.",
        image: trailor_community_mobile,
        gridPosition: "md:col-span-1 md:row-span-2",
        category: "responsive",
        size: "tall",
      },
      {
        id: 8,
        title: "Mobile View Customer Banner",
        description: "Customer banner layout optimized for mobile devices.",
        image: trailor_customerbanner_mobile,
        gridPosition: "md:col-span-1 md:row-span-2",
        category: "responsive",
        size: "tall",
      },
    ],

    keyFeatures: [
  {
    title: "Pixel-Accurate UI Implementation",
    description:
      "Converted the provided Figma design into a pixel-accurate Next.js interface with close attention to spacing, typography, and visual hierarchy.",
    highlight: "Figma to Code",
  },
  {
    title: "Responsive Layout Without Mobile Figma",
    description:
      "Designed and implemented mobile and tablet layouts independently while maintaining visual consistency with the desktop design.",
    highlight: "Responsive Design",
  },
  {
    title: "Motion-Based UI Animations",
    description:
      "Used Motion to add smooth transitions, section reveals, and micro-interactions to enhance the user experience.",
    highlight: "Smooth Animations",
  },
  {
    title: "Optimized Asset Delivery",
    description:
      "Implemented optimized images and component structuring to maintain acceptable performance scores for a visually rich landing page.",
    highlight: "Performance-Aware",
  },
],


    techStack: {
      frontend: [
        { name: "Next.js", version: "16.0.7" },
        { name: "React", version: "19.2.0" },
        { name: "TypeScript", version: "5" },
        { name: "Tailwind CSS", version: "4" },
        { name: "Motion", version: "12.23.24" },
        { name: "React Icons", version: "5.5.0" },
      ],
    },

    challenges: [
  {
    title: "Learning TypeScript While Building",
    description:
      "This project required TypeScript, which I was not fully comfortable with initially. Writing typed React components and handling props and state safely added complexity during development.",
    icon: BsFillRocketTakeoffFill,
  },
  {
    title: "Desktop-Only Figma Design",
    description:
      "The provided Figma file included only desktop screens. Designing responsive mobile and tablet layouts required independent design decisions without predefined references.",
    icon: FaMobileAlt,
  },
  {
    title: "Balancing Animation with Performance",
    description:
      "Adding multiple animations using Motion while keeping performance acceptable required careful control of animation scope and component rendering.",
    icon: BsFillRocketTakeoffFill,
  },
  {
    title: "Pixel-Perfect Implementation Under Time Constraint",
    description:
      "Achieving close visual accuracy to the Figma design within a short assignment timeline required focused attention on layout details and consistent styling.",
    icon: BsFillRocketTakeoffFill,
  },
],


    developmentInfo: {
      type: "Assigment Project",
      status: "Completed",
      focus: "UI/UX & Frontend Development",
    },

    pages: [
      {
        name: "Home",
        description: "Landing page with hero, bike showcase, and CTAs",
        features: [
          "Hero section",
          "Bikes showcase",
          "Lead capture forms",
          "App promo",
        ],
      },
    ],

    learningOutcomes: [
  "Hands-on experience building a real assignment using Next.js with the App Router",
  "Improved understanding of TypeScript fundamentals in a React project",
  "Learning how to design mobile layouts without explicit Figma references",
  "Practical use of Motion for UI animations and micro-interactions",
  "Better understanding of balancing visual richness with performance considerations",
  "Increased confidence in converting professional Figma designs into production-ready code",
],


    futureEnhancements: [
      "User authentication and profile flows",
      "In-app booking and real-time availability",
      "Advanced filtering and search for models",
      "Dark mode and theming",
    ],
  }

export default trailorRide;
