export const skillsCategories = [
    {
        id: "frontend-engineering",
        number: "01",
        title: "Frontend Engineering",
        context:
            "Production interfaces · component architecture · performance",
        primary: [
            {
                name: "React",
                icon: "react",
                note: "Reusable UI · Component architecture",
            },
            {
                name: "Next.js",
                icon: "nextjs",
                note: "Production pages · Routing · Performance",
            },
            {
                name: "JavaScript",
                icon: "javascript",
                note: "Core language · Interactivity",
            },
        ],
        supporting: [
            "Astro",
        ],
    },

    {
        id: "ui-styling",
        number: "02",
        title: "UI & Styling",
        context:
            "Responsive systems · rapid, consistent implementation",
        primary: [
            {
                name: "Tailwind CSS",
                icon: "tailwind",
                note: "Responsive systems · Rapid UI implementation",
            },
            {
                name: "CSS",
                icon: null,
                note: "Modern layout · Theming",
            },
            {
                name: "Responsive Design",
                icon: null,
                note: "Fluid layouts · Breakpoints",
            },
        ],
        supporting: [
            "Component Architecture",
            "Design Systems",
            "Reusable UI",
        ],
    },

    {
        id: "state-data",
        number: "03",
        title: "State, Data & Integration",
        context:
            "Structured state · data flows between UI and APIs",
        primary: [
            {
                name: "Redux Toolkit",
                icon: "redux",
                note: "Global state · Async flows",
            },
            {
                name: "REST APIs",
                icon: null,
                note: "Data fetching · Integration",
            },
            {
                name: "JSON",
                icon: "json",
                note: "Data exchange · Serialization",
            },
        ],
        supporting: [
            "Swagger",
            "API Integration",
            "Data Handling",
            "Zod",
        ],
    },

    {
        id: "forms-interaction",
        number: "04",
        title: "Forms & Interaction",
        context:
            "Interactive interfaces · validated forms · smooth UI transitions",
        primary: [
            {
                name: "React Hook Form",
                icon: "react-hook-form",
                note: "Validated forms · Form state",
            },
            {
                name: "Motion",
                icon: null,
                note: "Transitions · Micro-interactions",
            },
            {
                name: "Lenis",
                icon: null,
                note: "Smooth scrolling",
            },
        ],
        supporting: [
            "Form Validation",
            "Micro-interactions",
            "Scroll Choreography",
        ],
    },

    {
        id: "creative-engineering",
        number: "05",
        title: "Creative Engineering",
        context:
            "Physics-driven interfaces · playful interaction",
        primary: [
            {
                name: "Matter.js",
                icon: null,
                note: "Physics-driven interfaces",
            },
        ],
        supporting: [
            "Physics-based Interaction",
            "Interactive UI",
            "Experimental Motion",
        ],
    },
];