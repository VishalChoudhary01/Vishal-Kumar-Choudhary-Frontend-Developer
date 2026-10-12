import { CloudIcon } from "@/app/components/ui/Icons";
import {body,email,subject} from "./contactEmail";
import {navigationData,aboutData,educationData,socialData,skillsCategories,projects} from "./index"

const gmailHref =
    `https://mail.google.com/mail/?` +
    `view=cm` +
    `&to=${encodeURIComponent(email)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

export const portfolio = {
    name: "Vishal Kumar Choudhary",

    role: "Frontend Developer",

    /* ────────────────────────────────────────────────────────────────────────
       ABOUT
       ──────────────────────────────────────────────────────────────────────── */

    about: aboutData,

    /* ────────────────────────────────────────────────────────────────────────
       NAVIGATION
       ──────────────────────────────────────────────────────────────────────── */

    navigation: navigationData,

    /* ────────────────────────────────────────────────────────────────────────
       SOCIAL LINKS
       ──────────────────────────────────────────────────────────────────────── */

    socialLinks:socialData,

    /* ────────────────────────────────────────────────────────────────────────
       RESUME
       ──────────────────────────────────────────────────────────────────────── */

    resumeUrl: "/resume.pdf",

    /* ────────────────────────────────────────────────────────────────────────
       EXPERIENCE
       ──────────────────────────────────────────────────────────────────────── */

    experience: [
        {
            id: "tetr-college",
            number: "01",
            company: "Tetr College of Business",
            role: "Associate Software Developer",
            date: "February 2026 – May 2026",
            logo: "/images/companylogo/tetr.svg",

            overview:
                "Developed and maintained production-ready web experiences, translating Figma designs into responsive interfaces with strong attention to visual accuracy, accessibility, and interaction quality.",

            build: [
                "Built responsive production pages from Figma specifications.",
                "Implemented reusable UI patterns and responsive layouts.",
                "Added interface animations and transitions using Motion.",
                "Managed and optimized image assets for different screen sizes.",
                "Worked across production deployments and iterative frontend improvements.",
            ],

            impact: [
                "Delivered polished production pages with consistent visual implementation across screen sizes.",
                "Improved frontend performance while maintaining a reliable user experience.",
            ],

            metadata: {
                stack: "HTML · CSS · JavaScript · Astro · Motion",
                focus: "Responsive UI · Design Accuracy",
            },
        },

        {
            id: "bi-hub",
            number: "02",
            company: "BI Hub Solution",
            role: "Frontend Developer Intern",
            date: "August 2025 – October 2025",
            logo: "/images/companylogo/bi_hub_solution.webp",

            overview:
                "Built responsive frontend experiences using React, connecting interface components to REST APIs and translating product designs into functional, maintainable web interfaces.",

            build: [
                "Developed reusable React UI components.",
                "Implemented responsive layouts using Tailwind CSS.",
                "Integrated RESTful APIs into frontend workflows.",
                "Used Swagger documentation to understand and consume API endpoints.",
                "Converted Figma designs into production-oriented interfaces.",
            ],

            impact: [
                "Delivered a functional frontend with integrated API workflows.",
                "Improved the connection between product interfaces and backend services while maintaining responsive UI behavior.",
            ],

            metadata: {
                stack: "React · Tailwind CSS · REST API · Swagger",
                focus: "API Integration · Responsive UI",
            },
        },

        {
            id: "cling-multi",
            number: "03",
            company: "Cling Multi Solution Pvt. Ltd.",
            role: "Software Developer Intern",
            date: "September 2024 – December 2024",
            logo: "/images/companylogo/cling_multi_solutions_logo.webp",

            overview:
                "Worked on modern frontend development, transforming Figma designs into responsive interfaces using Next.js and Tailwind CSS with an emphasis on reusable UI patterns.",

            build: [
                "Converted Figma designs into responsive Next.js interfaces.",
                "Created reusable UI components for consistent implementation.",
                "Structured pages around maintainable frontend patterns.",
                "Used Tailwind CSS for responsive styling and layout.",
            ],

            impact: [
                "Improved development consistency through accurate design implementation.",
                "Established reusable frontend components as a stronger foundation for future pages.",
            ],

            metadata: {
                stack: "Next.js · Tailwind CSS · Figma",
                focus: "Reusable UI · Design Systems",
            },
        },

        {
            id: "cloudily-scripts",
            number: "04",
            company: "Cloudily Scripts Pvt Ltd",
            role: "Web Developer",
            date: "June 2024 – June 2024",
            logo: null,
            logoIcon: CloudIcon,

            overview:
                "Worked on frontend development for financial tools, building responsive interfaces and interactive calculator experiences with Vue.js and Tailwind CSS.",

            build: [
                "Built responsive interfaces using Vue.js.",
                "Implemented interactive financial calculators.",
                "Developed frontend functionality using JavaScript.",
                "Styled responsive layouts with Tailwind CSS.",
            ],

            impact: [
                "Delivered interactive financial tools with a focus on usability, responsive design, and accurate frontend behavior.",
            ],

            metadata: {
                stack: "Vue.js · JavaScript · Tailwind CSS",
                focus: "Financial UI · Interactive Tools",
            },
        },
    ],

    /* ────────────────────────────────────────────────────────────────────────
       EDUCATION
       ──────────────────────────────────────────────────────────────────────── */

    education: [
        {
            id: "mca-bhu",
            year: "2023",
            degree: "MCA",
            institution: "Banaras Hindu University",
        },

        {
            id: "bca-anc",
            year: "2020",
            degree: "BCA",
            institution: "Anugrah Narayan College",
        },

        {
            id: "isc-commerce",
            year: "2017",
            degree: "I.Sc",
            institution: "College of Commerce, Art & Science",
        },

        {
            id: "matric-st-xaviers",
            year: "2015",
            degree: "Matric",
            institution: "St. Xavier's High School",
        },
    ],

    /* ────────────────────────────────────────────────────────────────────────
       SKILLS
       ──────────────────────────────────────────────────────────────────────── */

    skills: skillsCategories,

    /* ────────────────────────────────────────────────────────────────────────
       PROJECTS
       Each project may carry a case-study `story` object that the
       /projects/[slug] detail page renders.

       The SHOWCASE section is a dynamic bento/mosaic gallery:
         story.showcase = [ { type, src, alt, caption, layout? }, ... ]

       - Add one entry per real screenshot.
       - One entry → full-width feature presentation.
       - 2+ entries → auto-composed bento mosaic.
       - layout: "feature" | "wide" | "tall" | "standard" | "full"
       - type: "image" (default) | "video"
       ──────────────────────────────────────────────────────────────────────── */

    projects: projects,
};