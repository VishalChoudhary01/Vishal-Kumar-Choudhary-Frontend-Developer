export const projects = [
    {
        id: "class-fuse",
        number: "01",
        name: "ClassFuse",
        slug: "class-fuse",
        category: "tool",
        categoryLabel: "Developer Tool",

        description:
            "A Tailwind CSS utility for cleaning and organizing class lists by removing duplicate and conflicting utilities and producing cleaner, more readable class strings.",

        role: "Frontend Developer",

        year: "2026",

        technologies: [
            "Next.js",
            "React",
            "JavaScript",
            "Tailwind CSS",
            "Redux Toolkit",
            "Motion",
            "Lenis",
            "next-themes",
            "React Icons",
        ],

        contribution:
            "Designed and developed the frontend interface for a Tailwind CSS utility focused on cleaning, organizing, and formatting utility class strings.",

        features: [
            "Clean and format multiline Tailwind class lists",
            "Remove duplicate utility classes",
            "Handle conflicting Tailwind utilities",
            "Organize utilities into a cleaner Tailwind class order",
            "Present cleaned class output in a developer-focused interface",
            "Support light and dark interface themes",
        ],

        media: {
            type: "image",
            src: "/projects/classfuse/classfuse_hero.webp",
            alt: "ClassFuse Tailwind CSS utility formatter interface",
        },

        links: {
            live: "https://class-fuse.vercel.app/",
            github: null,
            figma: null,
        },

        presentation: {
            mode: "product",
            variant: "interface",
            emphasis: "interface",
            density: "comfortable",
        },

        motion: {
            entrance: "productReveal",
            media: "mediaReveal",
            hover: "mediaScale",
            scroll: "softDepth",
        },

        status: "published",
        order: 1,
        featured: true,

        content: {
            context: true,
            approach: true,
            design: true,
            engineering: true,
            motion: true,
            responsive: true,
            showcase: true,
            reflection: true,
        },

        story: {
            context: {
                statement:
                    "A developer utility for cleaning up messy Tailwind class strings.",

                body: [
                    "Long utility class strings become difficult to read and maintain as classes accumulate, so ClassFuse provides a focused workflow for entering Tailwind classes, cleaning duplicate and conflicting utilities, and producing a more organized result.",
                ],
            },

            approach: [
                {
                    title: "Focused developer workflow",
                    body:
                        "The interface keeps the primary task centered around entering Tailwind classes and reviewing the resulting cleaned output instead of introducing unnecessary application flows.",
                },

                {
                    title: "Utility cleanup",
                    body:
                        "ClassFuse processes Tailwind utility strings with a focus on removing unnecessary duplicate and conflicting classes.",
                },

                {
                    title: "Readable output",
                    body:
                        "The cleaned result is presented in a format that makes long Tailwind class strings easier to inspect and reuse.",
                },

                {
                    title: "Tailwind-aware organization",
                    body:
                        "The formatter can organize utilities into a cleaner Tailwind class order, making the resulting string easier to scan.",
                },
            ],

            design: {
                statement:
                    "A focused interface where the formatting workflow stays primary.",

                body:
                    "The interface is structured around the relationship between Tailwind class input and the resulting cleaned output. The design keeps supporting controls secondary so the main formatting task remains easy to understand.",
            },

            engineering: [
                {
                    title: "Next.js and React",
                    body:
                        "ClassFuse is built with Next.js and React, providing the application structure and component-based interface used by the developer tool.",
                },

                {
                    title: "Tailwind CSS",
                    body:
                        "Tailwind CSS is used as the styling system for the application and is also central to the problem the product is designed to solve.",
                },

                {
                    title: "Redux Toolkit",
                    body:
                        "Redux Toolkit and React Redux are included in the application stack for managing shared application state.",
                },

                {
                    title: "Utility composition",
                    body:
                        "clsx and tailwind-merge are included in the project stack for composing and resolving Tailwind-related class names within the interface.",
                },

                {
                    title: "Developer experience",
                    body:
                        "Prettier with the Tailwind CSS plugin and Biome are included in the development workflow to keep the project's source formatting and code quality consistent.",
                },
            ],

            motion: {
                statement:
                    "Motion and Lenis provide the interaction layer around an otherwise focused developer utility.",

                body:
                    "Motion is included for interface animation and transitions, while Lenis provides smooth scrolling behavior. The animation layer supports the presentation of the tool without becoming the primary purpose of the interface.",
            },

            responsive: {
                desktop:
                    "The desktop layout provides sufficient space for the Tailwind input and resulting output while keeping supporting controls visible.",

                tablet:
                    "The workspace adapts to reduced horizontal space while preserving the primary input-to-output relationship.",

                mobile:
                    "The interface reorganizes around the narrower viewport so the core Tailwind formatting workflow remains usable without relying on a desktop-sized layout.",
            },

            showcase: [
                {
                    type: "image",
                    src: "/projects/classfuse/classfuse_hero.webp",
                    alt: "ClassFuse main Tailwind CSS formatter interface",
                    caption:
                        "ClassFuse — Tailwind CSS class formatting workspace.",
                },

                {
                    type: "image",
                    src: "/projects/classfuse/classfuse_input.webp",
                    alt: "ClassFuse Tailwind CSS class input interface",
                    caption:
                        "Tailwind utility classes prepared for formatting.",
                },

                {
                    type: "image",
                    src: "/projects/classfuse/classfuse_result.webp",
                    alt: "ClassFuse cleaned Tailwind CSS output",
                    caption:
                        "Cleaned and organized Tailwind utility output.",
                },
            ],

            reflection: {
                statement:
                    "Immediate input, processing, and output in one focused interface.",

                worked: [
                    "Keeping the product centered around one developer workflow makes the interface easy to understand.",

                    "Using Tailwind CSS as both the product domain and the application's styling system keeps the project closely aligned with its purpose.",

                    "Motion and smooth scrolling add interaction without replacing the utility's primary function.",
                ],

                improve:
                    "Further improvements would depend on the next product requirements, particularly around expanding formatting capabilities and refining the developer workflow.",
            },
        },
    },

    {
        id: "spendwise",
        number: "02",
        name: "Spendwise",
        slug: "spendwise",
        category: "product",
        categoryLabel: "Web App",

        description:
            "A shopping planning and price comparison web app that helps users organize what they need, compare supported product prices, calculate list totals, and keep track of their spending.",

        role: "Frontend Developer",

        year: "2026",

        technologies: [
            "Next.js",
            "React",
            "JavaScript",
            "Tailwind CSS",
            "Redux Toolkit",
            "Motion",
            "Lenis",
            "Cheerio",
            "ApexCharts",
            "Lucide React",
            "React Icons",
        ],

        contribution:
            "Designed and developed the frontend experience, including shopping lists, product workflows, price comparison, product information extraction, spending views, responsive interfaces, and interactive motion.",

        features: [
            "Shopping list creation and management",
            "Product addition through product information and URLs",
            "Product name and product information extraction",
            "Current price comparison across supported sources",
            "List total calculation and spending overview",
            "Purchase and spending tracking",
            "Responsive dashboard and list-detail experiences",
            "Interactive charts and spending visualizations",
            "Light and dark theme support",
        ],

        media: {
            type: "image",
            src: "/projects/spendwise/spendwise.webp",
            alt: "Spendwise shopping planning and price comparison interface",
        },

        links: {
            live: "https://spendwise-shop.vercel.app/",
            github: "https://github.com/VishalChoudhary01/spendwise",
            figma: null,
        },

        presentation: {
            mode: "product",
            variant: "split",
            emphasis: "interface",
            density: "comfortable",
        },

        motion: {
            entrance: "productReveal",
            media: "mediaReveal",
            hover: "mediaScale",
            scroll: "softDepth",
        },

        status: "published",
        order: 2,
        featured: false,

        content: {
            context: true,
            approach: true,
            design: true,
            engineering: true,
            motion: true,
            responsive: true,
            showcase: true,
            reflection: true,
        },

        story: {
            context: {
                statement:
                    "A shopping workspace built to plan first, compare prices, and track spending.",

                body: [
                    "Spendwise organizes products inside shopping lists instead of treating a purchase as a single product lookup, so users can plan what they need, compare available prices, calculate totals, choose an option, and track the resulting spending.",
                ],
            },

            approach: [
                {
                    title: "List-first shopping workflow",
                    body:
                        "The product organizes shopping around lists rather than isolated product searches. Users can create a list and add the products they need to that workspace.",
                },

                {
                    title: "Product information extraction",
                    body:
                        "Product URLs can be processed to extract useful product information, reducing the amount of information users need to enter manually when adding an item.",
                },

                {
                    title: "Current price comparison",
                    body:
                        "The comparison workflow works with currently available prices from supported sources, allowing users to compare the available options before making a purchase decision.",
                },

                {
                    title: "Spending visibility",
                    body:
                        "The interface connects shopping activity with spending information so users can understand list totals and keep track of what they have spent.",
                },
            ],

            design: {
                statement:
                    "Planning, comparison, and spending kept connected in one workspace.",

                body:
                    "The interface separates the planning workflow from supporting information without losing the relationship between them. Lists provide the main workspace, product details provide context for individual items, and spending views summarize the financial side of the shopping activity.",
            },

            engineering: [
                {
                    title: "Next.js and React application",
                    body:
                        "The application is built with Next.js 16 and React 19 using JavaScript, with the interface organized around reusable React components and application-specific workflows.",
                },

                {
                    title: "Redux Toolkit state management",
                    body:
                        "Redux Toolkit and React Redux are used for application state, allowing shopping-list and interface state to be managed centrally across the product experience.",
                },

                {
                    title: "Product extraction pipeline",
                    body:
                        "Cheerio is included for product-page parsing, supporting the product information extraction workflow when processing supported product URLs.",
                },

                {
                    title: "Data visualization",
                    body:
                        "ApexCharts is included for the application's spending and analytics visualizations, turning shopping data into readable summaries rather than leaving users with raw totals alone.",
                },

                {
                    title: "Responsive utility architecture",
                    body:
                        "Tailwind CSS is used for the interface styling and responsive layout system, allowing the same product workflows to adapt across different viewport sizes.",
                },
            ],

            motion: {
                statement:
                    "Motion is used to make the shopping workspace feel responsive without competing with the underlying task.",

                body:
                    "The project includes Motion and Lenis for interface and scrolling interactions. Motion handles UI transitions and component-level feedback, while Lenis provides the smooth-scrolling layer used throughout the experience.",
            },

            responsive: {
                desktop:
                    "The desktop experience uses the available horizontal space to present list information, product details, actions, and supporting spending information with clear separation.",

                tablet:
                    "Content compresses and reorganizes as the viewport becomes narrower while preserving the primary list and product-management workflow.",

                mobile:
                    "The interface prioritizes the list and product workflow on smaller screens, with compact headers, stacked content, touch-friendly actions, and mobile-specific spacing and typography.",
            },

            showcase: [
                {
                    type: "image",
                    src: "/projects/spendwise/spendwise_dashboard.webp",
                    alt: "Spendwise shopping and spending dashboard",
                    caption: "Shopping overview and spending information in the Spendwise dashboard.",
                },

                {
                    type: "image",
                    src: "/projects/spendwise/spendwise_list.webp",
                    alt: "Spendwise shopping list interface",
                    caption: "Shopping lists provide the main workspace for organizing products.",
                },

                {
                    type: "image",
                    src: "/projects/spendwise/spendwise_product.webp",
                    alt: "Spendwise product comparison interface",
                    caption: "Product information and supported price comparison within a shopping list.",
                },

                {
                    type: "image",
                    src: "/projects/spendwise/spendwise_mobile.webp",
                    alt: "Spendwise responsive mobile interface",
                    caption: "Responsive shopping workflow adapted for smaller screens.",
                },
            ],

            reflection: {
                statement:
                    "Connecting state, extraction, comparison, responsive UI, and spending views.",

                worked: [
                    "The list-first model gives the product a clear relationship between shopping planning, products, prices, and spending.",

                    "Centralized state management helps coordinate interactions across the dashboard, lists, and product workflows.",

                    "Building responsive list-detail interfaces reinforced that mobile is a deliberate layout, not a shrunken desktop.",
                ],

                improve:
                    "The next stage would be to move beyond the current client-side architecture toward persistent user accounts, multi-user data, multiple synchronized lists, and a server-backed data layer.",
            },
        },
    },

    {
        id: "system-canvas",
        number: "03",
        name: "System Canvas",
        slug: "system-canvas",
        category: "product",
        categoryLabel: "Web App",

        description:
            "A frontend workspace for exploring and working with a structured color and theme system through an interactive React interface.",

        role: "Frontend Developer",

        year: "2026",

        technologies: [
            "React",
            "Vite",
            "JavaScript",
            "Tailwind CSS",
            "Redux Toolkit",
            "React Router",
            "Motion",
            "Lenis",
            "React Icons",
        ],

        contribution:
            "Designed and developed the frontend application, including the interactive interface, theme-system workflows, state management, routing, responsive styling, and motion layer.",

        features: [
            "Interactive color and theme-system workspace",
            "Structured theme and design-token interface",
            "Light and dark theme support",
            "Client-side application state management",
            "Responsive interface",
            "Animated interface interactions",
            "Smooth scrolling experience",
        ],

        media: {
            type: "image",
            src: "/projects/systemcanvas/Systemcanvas.webp",
            alt: "System Canvas color and theme system interface",
        },

        links: {
            live: "https://system-canvas-colors.vercel.app/",
            github: null,
            figma: null,
        },

        presentation: {
            mode: "product",
            variant: "interface",
            emphasis: "interface",
            density: "comfortable",
        },

        motion: {
            entrance: "productReveal",
            media: "mediaReveal",
            hover: "mediaScale",
            scroll: "softDepth",
        },

        status: "published",
        order: 3,
        featured: false,

        content: {
            context: true,
            approach: true,
            design: true,
            engineering: true,
            motion: true,
            responsive: true,
            showcase: true,
            reflection: true,
        },

        story: {
            context: {
                statement:
                    "A structured color and theme system turned into an interactive frontend workspace.",

                body: [
                    "System Canvas is a React application built to work with a structured color and theme system through an interactive interface rather than leaving it as a static collection of design tokens.",
                ],
            },

            approach: [
                {
                    title: "System-first interface",
                    body:
                        "The interface is organized around the theme and color system itself, giving the underlying visual tokens a dedicated workspace rather than treating them as isolated values.",
                },

                {
                    title: "Centralized state",
                    body:
                        "Redux Toolkit and React Redux provide the application's state-management layer, allowing shared interface and system state to be handled centrally.",
                },

                {
                    title: "Component-driven frontend",
                    body:
                        "React provides the component architecture while Vite handles the application development and build workflow.",
                },

                {
                    title: "Interactive presentation",
                    body:
                        "Motion and Lenis are used to add movement and smooth scrolling to the experience, giving the system a more interactive presentation.",
                },
            ],

            design: {
                statement:
                    "A workspace where the color system is treated as an interface, not static values.",

                body:
                    "The design focuses on presenting color and theme information through a structured application interface where the theme system itself becomes part of the visual experience.",
            },

            engineering: [
                {
                    title: "React and Vite",
                    body:
                        "System Canvas is built with React and Vite, using a modern component-based frontend architecture and Vite's development and production build pipeline.",
                },

                {
                    title: "Tailwind CSS",
                    body:
                        "Tailwind CSS 4 provides the styling foundation, with the official Vite integration used as part of the project setup.",
                },

                {
                    title: "Redux Toolkit",
                    body:
                        "Redux Toolkit and React Redux provide centralized state management for application-level state and shared interface behavior.",
                },

                {
                    title: "Client-side routing",
                    body:
                        "React Router is included for application navigation and client-side route management.",
                },

                {
                    title: "Testing and quality tooling",
                    body:
                        "Vitest is included for automated testing, while Oxlint is used as the project's linting tool. Puppeteer Core is also included in the development toolchain for browser-related automation.",
                },
            ],

            motion: {
                statement:
                    "Motion and smooth scrolling are part of the System Canvas presentation layer.",

                body:
                    "The project uses Motion for interface animation and Lenis for smooth scrolling. These technologies provide the interaction layer around the color and theme workspace without changing the underlying system structure.",
            },

            responsive: {
                desktop:
                    "The desktop experience provides the space required for the color and theme workspace while keeping the system information visually organized.",

                tablet:
                    "The interface adapts its layout and spacing as available horizontal space decreases while retaining the primary system workflow.",

                mobile:
                    "The responsive interface reorganizes the workspace for narrower screens while preserving access to the core color and theme information.",
            },

            showcase: [
                {
                    type: "image",
                    src: "/projects/systemcanvas/systemcanvas_overview.webp",
                    alt: "System Canvas overview interface",
                    caption:
                        "System Canvas — interactive color and theme-system workspace.",
                },

                {
                    type: "image",
                    src: "/projects/systemcanvas/systemcanvas_colors.webp",
                    alt: "System Canvas color system interface",
                    caption:
                        "Structured color system presented through the application interface.",
                },

                {
                    type: "image",
                    src: "/projects/systemcanvas/systemcanvas_theme.webp",
                    alt: "System Canvas theme interface",
                    caption:
                        "Theme and interface styling within System Canvas.",
                },
            ],

            reflection: {
                statement:
                    "Design-system thinking and frontend engineering in one workspace.",

                worked: [
                    "The project combines a structured visual system with a component-driven React interface.",

                    "Centralized state management provides a foundation for handling shared application behavior.",

                    "Motion and smooth scrolling add an interactive presentation layer to the system.",
                ],

                improve:
                    "Further improvements would depend on the final product scope, particularly around expanding the system-management workflows and making the underlying design tokens more reusable across projects.",
            },
        },
    },

    {
        id: "nextjs-master",
        number: "04",
        name: "Next.js Master",
        slug: "nextjs-master",
        category: "product",
        categoryLabel: "Web App",

        description:
            "A Next.js frontend project built around reusable UI patterns, responsive layouts, centralized state, and polished interface interactions.",

        role: "Frontend Developer",

        year: "2026",

        technologies: [
            "Next.js",
            "React",
            "JavaScript",
            "Tailwind CSS",
            "Redux Toolkit",
            "React Redux",
            "Motion",
            "Lenis",
            "Lucide React",
            "React Icons",
        ],

        contribution:
            "Designed and developed the frontend application using Next.js and React, with reusable UI patterns, centralized state management, responsive Tailwind CSS styling, and Motion-based interactions.",

        features: [
            "Reusable React UI components",
            "Responsive Next.js layouts",
            "Tailwind CSS responsive styling",
            "Centralized application state with Redux Toolkit",
            "Motion-based interface interactions",
            "Smooth scrolling with Lenis",
            "Lightweight icon system with Lucide React and React Icons",
        ],

        media: {
            type: "image",
            src: "/projects/nextjs-master/nextjsmaster.webp",
            alt: "Next.js Master responsive web application interface",
        },

        links: {
            live: "https://next-js-master-jet.vercel.app/",
            github: null,
            figma: null,
        },

        presentation: {
            mode: "product",
            variant: "interface",
            emphasis: "interface",
            density: "comfortable",
        },

        motion: {
            entrance: "productReveal",
            media: "mediaReveal",
            hover: "mediaScale",
            scroll: "softDepth",
        },

        status: "published",
        order: 4,
        featured: false,

        content: {
            context: true,
            approach: true,
            design: true,
            engineering: true,
            motion: true,
            responsive: true,
            showcase: true,
            reflection: true,
        },

        story: {
            context: {
                statement:
                    "Reusable interfaces, responsive layouts, and a polished interaction layer.",

                body: [
                    "Next.js Master is a frontend application built around reusable UI patterns, centralized application state, and responsive layouts, with a dedicated animation and smooth-scrolling layer.",
                ],
            },

            approach: [
                {
                    title: "Component-driven development",
                    body:
                        "The application is built around reusable React components so interface patterns can be shared instead of repeatedly implemented as isolated markup.",
                },

                {
                    title: "Next.js application structure",
                    body:
                        "Next.js provides the application framework and routing structure while React handles the component architecture and interactive UI.",
                },

                {
                    title: "Centralized state",
                    body:
                        "Redux Toolkit and React Redux provide the state-management layer for application-level state that needs to be shared across components.",
                },

                {
                    title: "Interaction layer",
                    body:
                        "Motion and Lenis provide the animation and scrolling layer, allowing the interface to have richer transitions without changing the underlying component structure.",
                },
            ],

            design: {
                statement:
                    "Reusable components and interaction quality working together.",

                body:
                    "The interface keeps layout, responsive behavior, and interactive states within a consistent component system.",
            },

            engineering: [
                {
                    title: "Next.js and React",
                    body:
                        "The application uses Next.js 16.3.3 with React 19.2.8 as its core frontend framework and component architecture.",
                },

                {
                    title: "Tailwind CSS",
                    body:
                        "Tailwind CSS 4.3.3 provides the styling and responsive layout system used throughout the application.",
                },

                {
                    title: "Redux Toolkit",
                    body:
                        "Redux Toolkit and React Redux provide centralized state management for shared application state.",
                },

                {
                    title: "Motion",
                    body:
                        "Motion is included as the animation system for interface transitions and interactive movement.",
                },

                {
                    title: "Smooth scrolling",
                    body:
                        "Lenis is included to provide the smooth-scrolling layer used by the application.",
                },

                {
                    title: "Interface utilities",
                    body:
                        "Lucide React and React Icons provide the project's iconography while ESLint and the Next.js ESLint configuration support code-quality checks.",
                },
            ],

            motion: {
                statement:
                    "Component-level animation combined with smooth scrolling for a more polished experience.",

                body:
                    "Motion provides the animation layer while Lenis handles smooth scrolling. Together they form an interaction system around the application's React and Next.js architecture.",
            },

            responsive: {
                desktop:
                    "The desktop experience uses the available viewport width for the application's full layout and component hierarchy.",

                tablet:
                    "Layouts and spacing adapt at intermediate viewport sizes while maintaining the main content hierarchy.",

                mobile:
                    "The interface reorganizes into a compact mobile layout while retaining the primary functionality and interaction patterns.",
            },

            showcase: [
                {
                    type: "image",
                    src: "/projects/nextjs-master/nextjsmaster_overview.webp",
                    alt: "Next.js Master application overview",
                    caption:
                        "Next.js Master — application overview.",
                },

                {
                    type: "image",
                    src: "/projects/nextjs-master/nextjsmaster_interface.webp",
                    alt: "Next.js Master responsive interface",
                    caption:
                        "Reusable React interface patterns across the application.",
                },

                {
                    type: "image",
                    src: "/projects/nextjs-master/nextjsmaster_mobile.webp",
                    alt: "Next.js Master mobile interface",
                    caption:
                        "Responsive interface adapted for smaller screens.",
                },
            ],

            reflection: {
                statement:
                    "Reusable components, centralized state, responsive styling, and motion.",

                worked: [
                    "Reusable components provide a consistent foundation for the interface.",

                    "Redux Toolkit provides a centralized approach for shared application state.",

                    "Motion and Lenis add a dedicated interaction layer without changing the core frontend architecture.",
                ],

                improve:
                    "Further improvements would depend on the application's actual product requirements, particularly around expanding reusable patterns and documenting the component and state architecture as the project grows.",
            },
        },
    },
];