// desktop
import quickJsonHeroBanner from '../../../../../public/images/project carousel/quickjson/quickjsonbanner.webp';
import Hero_desktop_light from '../../../../../public/images/project carousel/quickjson/gallery/Hero_desktop_light.webp';
import initialJSON_dark from '../../../../../public/images/project carousel/quickjson/gallery/initialJSON_dark.webp';
import jsoncreation_dark from '../../../../../public/images/project carousel/quickjson/gallery/json creation_dark.webp';
import jsoncreation_light from '../../../../../public/images/project carousel/quickjson/gallery/json creation_light.webp';

// mobile
import mobile_hero_dark from '../../../../../public/images/project carousel/quickjson/gallery/mobile/mobile_hero_dark.webp';
import mobile_hero_light from '../../../../../public/images/project carousel/quickjson/gallery/mobile/mobile_hero_light.webp';
import mobileJSON_initial_dark from '../../../../../public/images/project carousel/quickjson/gallery/mobile/mobileJSON_initial_dark.webp';

import { BsCode, BsDownload } from "react-icons/bs";
import { FaDatabase, FaMobileAlt } from "react-icons/fa";

const quickJson = {
  id: 3,
  name: "JSON Builder",
  projectType: "Advanced JSON Schema Builder Web Application",
  description:
    "A powerful, interactive JSON schema builder with real-time validation, multiple export formats, and a responsive design for developers to create complex JSON structures efficiently.",
  image: quickJsonHeroBanner,
  technologies: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "React Hook Form",
    "Zod",
    "Zustand",
    "Radix UI",
    "Motion",
    "Lucide React",
  ],
  liveUrl: "https://json-builder-flame.vercel.app", 
  githubUrl: "https://github.com/VishalChoudhary01/JSON-Builder",
  category: "Developer Tools & Utilities",
  year: "2025",
  about: {
    short:
      "A modern, feature-rich JSON schema builder application designed to streamline the creation and validation of complex JSON structures with an intuitive UI and powerful export capabilities.",
  },

  longDescription:
    "JSON Builder is a comprehensive web-based application that empowers developers to create, validate, and export JSON schemas without writing code manually. Built with Next.js and React Hook Form, it provides real-time schema validation using Zod, a clean component architecture, and multiple export formats including JSON, YAML, and more.",

  // Consolidated stats
  stats: {
    developmentTime: "2 days",
    pages: "1 (Main Builder)",
    components: "15+",
    responsiveBreakpoints: "3",
    lighthousePerformance: 92,
    lighthouseAccessibility: 89,
    lighthouseBestPractices: 100,
    lighthouseSEO: 100,
    loadTime: "< 1s",
    coreWebVitals: "Excellent",
  },

  bentoGrid: [
    {
      id: 1,
      title: "Hero Section",
      description:
        "Engaging hero with app overview and call-to-action.",
      image: quickJsonHeroBanner,
      gridPosition: "md:col-span-2 md:row-span-2",
      category: "Dark Mode",
      size: "large",
    },
    {
      id: 2,
      title: "Hero Section",
      description:
        "Live JSON output with syntax highlighting and validation indicators.",
      image: Hero_desktop_light,
      gridPosition: "md:col-span-2 md:row-span-2",
      category: "Light Mode",
      size: "medium",
    },
    {
      id: 3,
      title: "Mobile Screen Hero Section",
      description: "Hero section optimized for mobile viewports.",
      image: mobile_hero_dark,
      gridPosition: "md:col-span-1 md:row-span-2",
      category: "Responsive",
      size: "medium",
    },
    {
      id: 4,
      title: "Mobile Screen Hero Section",
      description: "Hero section optimized for mobile viewports (Light).",
      image: mobile_hero_light,
      gridPosition: "md:col-span-1 md:row-span-2",
      category: "Light Mode",
      size: "medium",
    },
    {
      id: 5,
      title: "Live JSON Create Panel",
      description: "Add, edit and delete with ease.",
      image: jsoncreation_light,
      gridPosition: "md:col-span-1 md:row-span-2",
      category: "feature",
      size: "medium",
    },
    {
      id: 6,
      title: "Initial JSON Mobile Screen",
      description: "Live JSON preview optimized for mobile screens.",
      image: initialJSON_dark, 
      gridPosition: "md:col-span-1 md:row-span-1", 
      category: "responsive",
      size: "tall",
    },
    {
      id: 7,
      title: "Preview and export ",
      description: "Copy JSON ",
      image: mobileJSON_initial_dark,
      gridPosition: "md:col-span-1 md:row-span-2",
      category: "feature",
      size: "medium",
    },
    // {
    //   id: 8,
    //   title: "Dark Mode Support",
    //   description:
    //     "Full dark mode implementation for comfortable nighttime usage.",
    //   image: jsoncreation_dark,
    //   gridPosition: "md:col-span-1 md:row-span-1",
    //   category: "design",
    //   size: "medium",
    // },
  ],

  keyFeatures: [
  {
    title: "Visual JSON Schema Builder",
    description:
      "Form-driven interface for creating complex JSON structures without writing raw JSON manually.",
    highlight: "No-Code Schema Creation",
  },
  {
    title: "Live Code Preview",
    description:
      "Real-time JSON output that updates instantly as users modify schema fields.",
    highlight: "Instant Feedback",
  },
  {
    title: "Real-time Validation with Zod",
    description:
      "Integrated Zod to validate schema structure and field rules dynamically while building.",
    highlight: "Error Prevention",
  },
  {
    title: "Global State Management with Zustand",
    description:
      "Used Zustand for managing builder state, theme preferences, and schema data efficiently.",
    highlight: "Lightweight State",
  },
  {
    title: "Dark & Light Mode Support",
    description:
      "Implemented theme switching using global state for a consistent experience across the app.",
    highlight: "Theme Aware",
  },
  
],


  techStack: {
    frontend: [
      { name: "Next.js", version: "16.1.1" },
      { name: "React", version: "19.2.3" },
      { name: "TypeScript", version: "5" },
      { name: "Tailwind CSS", version: "4" },
      { name: "React Hook Form", version: "7.60.0" },
      { name: "Zod", version: "4.0.5" },
      { name: "Zustand", version: "5.0.9" },
      { name: "Radix UI", version: "2.x" },
      { name: "Motion", version: "12.23.6" },
      { name: "Lucide React", version: "0.525.0" },
      { name: "React Icons", version: "5.5.0" },
      { name: "CVA (Class Variance Authority)", version: "0.7.1" },
    ],
  },

  challenges: [
  {
    title: "Designing a Useful Tool from Scratch",
    description:
      "After creating a basic homepage earlier, I decided to build a real developer tool. Defining features, user flow, and UI for a schema builder without a reference design was challenging.",
    icon: BsCode,
  },
  {
    title: "Complex Form State Management",
    description:
      "Handling deeply nested and dynamic form fields with React Hook Form while keeping the UI responsive required careful state organization.",
    icon: BsCode,
  },
  {
    title: "First-Time Zustand Integration",
    description:
      "This was my first time using Zustand for global state, including schema data and theme management, which required learning new patterns.",
    icon: FaDatabase,
  },
  {
    title: "Real-time Validation Logic",
    description:
      "Integrating Zod validation with dynamically generated fields while showing meaningful errors in real time was technically challenging.",
    icon: FaDatabase,
  },
  {
    title: "Responsive Builder Layout",
    description:
      "Designing a complex builder interface that works smoothly on mobile and desktop required multiple layout iterations.",
    icon: FaMobileAlt,
  },
],


  developmentInfo: {
    type: "Assignment Project",
    status: "completed",
    focus: "Frontend but Saas Level Home Page Design",
  },

  pages: [
    {
      name: "Home / Builder",
      description: "Main schema builder interface with live preview",
      features: [
        "Schema field creation",
        "Real-time JSON preview",
        "Validation feedback",
        "Export functionality",
        "Field management",
        "Dark mode toggle",
      ],
    },
  ],

  learningOutcomes: [
  "Learning how to design and build a real-world developer utility from scratch",
  "Advanced form handling with React Hook Form for dynamic and nested data",
  "First-time experience using Zustand for global state and theme management",
  "Implementing real-time validation patterns using Zod",
  "Building live code preview experiences in React",
  "Understanding how to structure large React applications using atomic design",
  "Improving accessibility and keyboard navigation using Radix UI",
  "Performance optimization techniques for form-heavy applications",
],


  futureEnhancements: [
    "Template library with pre-built schemas",
    "Collaborative editing with real-time sync",
    "Version control and history tracking",
    "API integration for direct database schema generation",
    "Advanced field validation rules builder",
    "Import from existing JSON/databases",
    "Team workspaces and permission management",
    "Schema testing and mock data generation",
  ],

  features: {
    fieldTypes: [
      "String",
      "Number",
      "Boolean",
      "Array",
      "Object",
      "Date",
      "Email",
      "URL",
      "Enum",
      "Custom",
    ],
    validationRules: [
      "Required",
      "Min/Max Length",
      "Pattern Matching",
      "Custom Validators",
      "Conditional Requirements",
    ],
    exportFormats: [
      "JSON",
      "YAML",
      "SQL",
      "CSV",
      "JavaScript Object",
      "TypeScript Types",
    ],
  },

  architecture: {
    folderStructure: {
      app: "Next.js App Router pages and layouts",
      components: {
        atoms: "Basic UI elements (Button, Input, Select, Label)",
        molecules: "Composed components (Form, Card, Navbar)",
        organisms: "Complex components (SchemaBuilder)",
        templates: "Page-level components (Banner, Preview)",
      },
      contexts: "React Context for form state management",
      hooks: "Custom React hooks (useTheme)",
      lib: "Utility functions",
      store: "Zustand state stores",
    },
    componentHierarchy:
      "Atomic design pattern with progressive composition from atoms → molecules → organisms → templates",
  },
};



export default quickJson;