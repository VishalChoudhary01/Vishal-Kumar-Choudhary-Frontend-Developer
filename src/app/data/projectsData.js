export const projects = [

{
    id: "class-fuse",
    number: "01",
    name: "ClassFuse",
    slug: "class-fuse",
    category: "tool",
    categoryLabel: "Developer Tool",

    description:
        "A focused Tailwind CSS utility that transforms messy class strings into cleaner, more readable, and consistently organized code.",

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
        "Designed and developed a polished developer tool focused on simplifying Tailwind CSS cleanup through an intuitive workspace, responsive interface, and thoughtful interaction design.",

    features: [
        "Clean and format multiline Tailwind class lists",
        "Improve readability of utility class strings",
        "Organize classes into a consistent format",
        "Present input and results in a focused workspace",
        "Provide a simple paste, format, review, and reuse workflow",
        "Support light and dark interface themes",
        "Deliver responsive layouts across desktop, tablet, and mobile",
        "Use purposeful motion to improve interaction feedback",
    ],

    media: {
        type: "image",
        src: "/projects/classfuse/classfuse_hero.webp",
        alt: "ClassFuse Tailwind CSS utility formatter interface",
    },

    links: {
        live: "https://class-fuse.vercel.app/",
       
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
                "Making Tailwind CSS class cleanup simpler and more intuitive.",

            body: [
                "Working with long utility class strings can become tedious when code contains inconsistent formatting, unnecessary repetition, or difficult-to-scan class lists. These small issues can interrupt an otherwise smooth development workflow.",

                "ClassFuse brings the cleanup experience into one focused workspace, helping developers turn cluttered class strings into cleaner, more readable output without unnecessary complexity.",

                "The product focuses on a simple idea: make everyday code cleanup feel effortless while keeping the interface clear, responsive, and comfortable to use.",
            ],
        },

        approach: [
            {
                title: "A focused workflow",
                body:
                    "The experience centers on entering class strings, processing them, and reviewing the result. Essential actions remain easy to discover so developers can concentrate on their code.",
            },

            {
                title: "Clarity over complexity",
                body:
                    "The interface avoids unnecessary steps and visual distractions. The relationship between the original input and the resulting output remains at the heart of the experience.",
            },

            {
                title: "Readable results",
                body:
                    "The formatting experience emphasizes consistency and readability, helping developers inspect and reuse utility class strings with greater confidence.",
            },

            {
                title: "Thoughtful interaction",
                body:
                    "Small interaction details provide feedback at the right moments, making the workflow feel responsive without adding friction to the core task.",
            },
        ],

        design: {
            statement:
                "A refined developer workspace built around clarity and focus.",

            body:
                "The visual direction balances a premium developer-tool aesthetic with practical usability. Clear typography, considered spacing, restrained surfaces, and strong contrast keep the code prominent. Supporting controls remain secondary, creating an interface that feels organized without becoming visually heavy.",
        },

        engineering: [
            {
                title: "Modern React architecture",
                body:
                    "Built with Next.js and React, ClassFuse uses a component-based approach to create a maintainable and responsive application experience.",
            },

            {
                title: "Utility-first styling",
                body:
                    "Tailwind CSS provides the styling foundation, supporting consistent interface patterns and a cohesive visual language throughout the application.",
            },

            {
                title: "Reliable application experience",
                body:
                    "The application stack includes tools for managing interface state and keeping interactions predictable as users work with their input and results.",
            },

            {
                title: "Developer-focused tooling",
                body:
                    "The development workflow incorporates modern tools that support consistent code quality and a maintainable codebase.",
            },

            {
                title: "Theme-aware interface",
                body:
                    "Light and dark themes allow the workspace to adapt to different preferences while preserving a consistent visual hierarchy and comfortable readability.",
            },
        ],

        motion: {
            statement:
                "A cinematic product story that brings the code-cleanup experience to life.",

            body:
                "Motion helps communicate the transformation from cluttered input to cleaner output. The project presentation can combine editor-style typing, subtle processing highlights, disappearing text effects, and connected scroll-driven scenes to make the product experience more tangible.",

            principles: [
                {
                    title: "Editor-style typing",
                    body:
                        "Progressively reveal code inside a developer-inspired editor, using a subtle cursor and clear typography to establish the problem and draw attention to the content.",
                },

                {
                    title: "Processing feedback",
                    body:
                        "Use a restrained shimmer or highlight to suggest activity before transitioning to the completed result. Keep the effect brief and visually consistent with the interface.",
                },

                {
                    title: "Text transformation",
                    body:
                        "Use a subtle dissolve or smoke-inspired effect to illustrate code cleanup, allowing the visual transition to communicate change without overwhelming the code itself.",
                },

                {
                    title: "Scroll-driven storytelling",
                    body:
                        "Connect the introduction, workspace demonstration, transformation, and final result through progressive reveals, subtle parallax, and carefully paced scroll transitions.",
                },

                {
                    title: "Purposeful animation",
                    body:
                        "Use Motion for coordinated transitions and scroll-linked effects, with lightweight visual treatments where appropriate. Preserve readability, responsive behavior, and a reduced-motion experience.",
                },
            ],
        },

        responsive: {
            desktop:
                "A spacious workspace gives the main input and output areas room to breathe, while the project presentation can use cinematic layouts and connected visual storytelling.",

            tablet:
                "The layout adapts to narrower screens while maintaining a clear hierarchy and an intuitive relationship between the main workspace elements.",

            mobile:
                "A compact, vertically organized experience prioritizes the main task and essential controls. Visual effects and scroll transitions remain restrained to preserve usability and performance.",
        },

        showcase: [

            {
                type: "image",
                src: "/projects/classfuse/gallery/feature.webp",
                alt: "ClassFuse landing page demonstrating how Tailwind CSS utilities are deduplicated and reordered into a clean, consistent class string.",
                caption:
                    "How ClassFuse cleans up and organizes Tailwind CSS utility classes.",
            },
            {
                type: "image",
                src: "/projects/classfuse/gallery/classfuse_tool.webp",
                alt: "ClassFuse Tailwind CSS cleanup tool showing a multiline input editor and a one-line output panel.",
                caption:
                    "The ClassFuse workspace for cleaning and formatting Tailwind CSS classes.",
            },
            {
                type: "image",
                src: "/projects/classfuse/gallery/duplication indication and easy to clean double click.webp",
                alt: "ClassFuse code editor displaying Tailwind CSS utilities with duplicate removal, consistent class ordering, and a duplicate count indicator.",
                caption:
                    "Remove duplicate utilities, restore Tailwind class order, and see how many duplicates were removed.",
            },
        ],

        reflection: {
            statement:
                "Making a small developer task feel clearer, faster, and more enjoyable.",

            worked: [
                "Keeping the experience focused on a single developer task makes the product straightforward to understand.",

                "A restrained visual system helps maintain readability while giving the interface a distinctive identity.",

                "Thoughtful interaction feedback and motion make the workflow feel more polished without distracting from the code.",

                "A connected product narrative communicates the value of the experience more effectively than a feature list alone.",
            ],

            improve:
                "There is room to refine the overall developer experience, improve the clarity of transformation feedback, and explore additional ways to integrate code cleanup into everyday development workflows.",
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
        "A shopping planning and price comparison web app that helps people organize shopping lists, compare available prices, estimate costs, and make more informed purchasing decisions.",

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
        "Designed and developed the frontend experience for a shopping platform centered on list management, product information extraction, supported price comparison, and spending visibility. Focused on responsive interfaces, reusable components, state management, and interactive user experiences.",

    features: [
        "Shopping list creation and management",
        "Product addition through product information and URLs",
        "Product information extraction from supported product pages",
        "Current price comparison across supported sources",
        "Shopping list totals and budget planning",
        "Purchase tracking and spending visibility",
        "Duplicate protection across shopping workflows",
        "Responsive dashboard and list-detail interfaces",
        "Spending visualizations",
        "Light and dark theme support",
    ],

    media: {
        type: "image",
        src: "/projects/spendwise/spendwise.webp",
        alt: "Spendwise shopping planning and price comparison interface",
    },

    links: {
        live: "https://spendwise-shop.vercel.app/",
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
                "Plan your shopping. Compare your options. Spend with more confidence.",

            body: [
                "Shopping across local stores and online marketplaces can make it difficult to compare prices, organize purchases, and stay within a budget. Without a clear plan, people may overlook better-value options or lose track of what they still need to buy.",

                "Spendwise brings shopping lists, product information, price comparison, and spending visibility into one workspace. The experience is designed to help users organize their needs, evaluate available options, and understand expected costs before making purchasing decisions.",
            ],
        },

        approach: [
            {
                title: "Start with a shopping list",
                body:
                    "A list-first workflow gives users a central place to organize intended purchases. Instead of managing product decisions separately, they can keep related items together and review their shopping plans in one place.",
            },

            {
                title: "Make product information useful",
                body:
                    "Users can add product information through supported URLs. The extraction workflow helps turn available product-page information into structured data that can be used within the shopping experience.",
            },

            {
                title: "Compare available prices",
                body:
                    "Supported price information helps users evaluate purchasing options before choosing a product. Comparisons are based on available data rather than a promise of universal retailer coverage or continuous price monitoring.",
            },

            {
                title: "Keep shopping organized",
                body:
                    "List totals, item management, and spending-related views connect individual products with the wider shopping plan. The interface helps users review their intended purchases and available information without making everyday shopping unnecessarily complicated.",
            },
        ],

        design: {
            statement:
                "Make shopping information easier to understand and act on.",

            body:
                "The interface centers on shopping lists and their products. Clear visual hierarchy helps users distinguish product details, prices, totals, and primary actions. Dashboard and list-detail views organize related information into a consistent experience, with responsive layouts that remain practical on smaller screens.",
        },

        engineering: [
            {
                title: "Next.js and React",
                body:
                    "Built with Next.js 16, React 19, and JavaScript. The application uses reusable components and structured UI workflows to organize shopping-related screens and interactions.",
            },

            {
                title: "Centralized state management",
                body:
                    "Redux Toolkit and React Redux coordinate application state across shopping lists, product workflows, and interface interactions, helping keep related UI behavior consistent.",
            },

            {
                title: "Product information extraction",
                body:
                    "Cheerio supports parsing supported product pages to extract useful information from URLs. The extraction process accounts for differences between supported page structures instead of assuming every retailer provides identical data.",
            },

            {
                title: "Price and spending visualization",
                body:
                    "The application brings available product prices and shopping totals into the decision-making workflow. ApexCharts supports data visualization where applicable, helping present shopping-related information in a more readable format.",
            },

            {
                title: "Responsive interface architecture",
                body:
                    "Tailwind CSS provides the styling and responsive layout system. The interface adapts across desktop, tablet, and mobile screens while keeping essential shopping information and actions accessible.",
            },
        ],

        motion: {
            statement:
                "Motion should improve feedback, not compete with the task.",

            body:
                "Motion supports interface transitions and component-level feedback, while Lenis provides the smooth-scrolling layer used in the experience. The intention is to make interactions feel connected and responsive without distracting users from shopping lists, product information, or price comparisons.",
        },

        responsive: {
            desktop:
                "A structured layout uses available screen space to present shopping lists, product information, and supporting summaries with clear visual separation.",

            tablet:
                "Content reorganizes as the viewport narrows, preserving the primary shopping workflows and a clear hierarchy of information.",

            mobile:
                "Compact headers, carefully structured content, accessible actions, and responsive spacing help users work with their shopping lists while on the move.",
        },

        showcase: [
            

            {
                type: "image",
                src: "/projects/spendwise/gallery/price-checker.webp",
                alt: "Spendwise product overview showing shopping organization, price comparison, purchase progress, and duplicate-item protection.",
                caption:
                    "An overview of Spendwise's shopping workflow, combining list planning, supported price comparisons, and purchase tracking.",
            },
            {
                type: "image",
                src: "/projects/spendwise/gallery/dashboard.webp",
                alt: "Spendwise shopping lists dashboard displaying shopping statistics, product counts, pending items, and saved lists.",
                caption:
                    "A centralized dashboard for reviewing shopping lists, monitoring item counts, and accessing planned purchases.",
            },
            {
                type: "image",
                src: "/projects/spendwise/gallery/dewali-list.webp",
                alt: "Spendwise shopping list detail page showing individual products, estimated total cost, purchase status, and item filters.",
                caption:
                    "A detailed shopping list view for reviewing products, comparing available prices, and managing pending and purchased items.",
            },


        ],

        reflection: {
            statement:
                "Building a connected shopping experience around planning, product information, and informed decisions.",

            worked: [
                "A list-first workflow connects shopping plans and product information within one interface.",

                "Centralized state management helps coordinate interactions across shopping lists and product workflows.",

                "Product extraction introduces practical data-handling challenges because supported retailers expose information in different ways.",

                "Responsive design keeps the core shopping experience usable across different screen sizes.",
            ],

            improve:
                "The next stage is to strengthen data reliability, improve the consistency of product extraction, and continue refining the shopping workflow based on real usage. I would also evaluate the architecture as the application's data and user requirements grow, while keeping performance, maintainability, and usability central to future improvements.",
        },
    },
}
,

    {
        id: "system-canvas",
        number: "03",
        name: "System Canvas",
        slug: "system-canvas",
        category: "product",
        categoryLabel: "Web App",

        description:
            "A frontend workspace for exploring a structured design-token system, with a visual reference for light and dark themes, interface surfaces, typography, borders, shadows, form controls, and semantic states.",

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
            "Designed and developed the frontend application, including the interactive color and theme workspace, design-token presentation, shared application state, responsive interface, routing, and motion layer.",

        features: [
            "Interactive color and design-token workspace",
            "Light and dark theme color references",
            "Semantic color-token organization",
            "Background, foreground, and layered surface colors",
            "Primary, secondary, and muted text color references",
            "Border, divider, and focus-ring color references",
            "Shadow and elevation references",
            "Form input, placeholder, and validation-state references",
            "Success, warning, error, and informational color references",
            "Button and interactive-state references",
            "Component-level theme previews",
            "Responsive interface",
            "Animated interface interactions",
            "Smooth scrolling experience",
        ],

        media: {
            type: "image",
            src: "/projects/systemcanvas/Systemcanvas.webp",
            alt: "System Canvas design-token workspace showing color and theme-system interfaces",
        },

        links: {
            live: "https://system-canvas-colors.vercel.app/",
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
                    "A visual workspace for understanding how a design-token system shapes an entire interface.",

                body: [
                    "System Canvas is a React application built to make a structured color and theme system easier to explore through an interactive frontend workspace.",
                    "The project brings foundational design tokens and interface-level styling into one visual environment, helping designers and frontend engineers inspect how colors and semantic roles are organized across a product.",
                    "Its scope includes light and dark theme references alongside interface foundations such as surfaces, typography, borders, shadows, form controls, focus states, and semantic feedback colors, where supported by the application.",
                ],
            },

            approach: [
                {
                    title: "System-first interface",
                    body:
                        "The workspace organizes visual tokens by their role in an interface, making it easier to understand the relationship between foundational colors, semantic tokens, and component-level styling.",
                },

                {
                    title: "Light and dark theme comparison",
                    body:
                        "The theme workspace presents light and dark color references so designers and engineers can inspect how the visual system adapts between different appearance modes.",
                },

                {
                    title: "Semantic token organization",
                    body:
                        "Color references are organized around interface responsibilities, including foregrounds, surfaces, text, borders, interactive elements, and semantic feedback states, rather than treating every color as an unrelated value.",
                },

                {
                    title: "Component-oriented exploration",
                    body:
                        "The workspace connects design-system concepts with practical interface examples, helping users understand how tokens can be applied to controls, forms, and other UI elements.",
                },

                {
                    title: "Interactive presentation",
                    body:
                        "Motion and Lenis provide the animation and scrolling layer for the application, supporting a more engaging way to explore the workspace.",
                },
            ],

            design: {
                statement:
                    "A design-token workspace that connects color foundations with real interface decisions.",

                body:
                    "The design centers on presenting theme information in a structured, readable interface. Instead of showing colors as isolated swatches, the workspace helps users relate color roles to the surfaces, text, borders, controls, and states that make up a complete UI. Light and dark themes are treated as coordinated visual systems, with attention to hierarchy, consistency, and readability.",
            },

            engineering: [
                {
                    title: "React and Vite",
                    body:
                        "React provides the component-based application architecture, while Vite supports the development server and production build workflow.",
                },

                {
                    title: "Tailwind CSS",
                    body:
                        "Tailwind CSS provides the utility-first styling foundation for responsive layouts and interface components, with theme tokens supporting consistent styling across the application.",
                },

                {
                    title: "Design-token architecture",
                    body:
                        "The workspace is structured around reusable color and theme references. The intent is to make visual decisions easier to inspect and maintain rather than scattering unrelated color values throughout interface components.",
                },

                {
                    title: "Light and dark theme foundations",
                    body:
                        "The theme presentation covers the relationship between background and foreground colors, layered surfaces, text hierarchy, borders, and interactive states across light and dark appearances.",
                },

                {
                    title: "Interface states and form controls",
                    body:
                        "The system explores how design tokens can be applied to form fields, placeholders, focus indicators, validation feedback, and semantic states such as success, warning, error, and information.",
                },

                {
                    title: "Redux Toolkit",
                    body:
                        "Redux Toolkit and React Redux provide centralized state management for shared application state and interface behavior.",
                },

                {
                    title: "Client-side routing",
                    body:
                        "React Router supports client-side navigation between application views.",
                },

                {
                    title: "Testing and quality tooling",
                    body:
                        "Vitest is included for automated testing, Oxlint for linting, and Puppeteer Core in the development toolchain for browser-related automation.",
                },
            ],

            motion: {
                statement:
                    "Motion supports exploration without distracting from the design system itself.",

                body:
                    "Motion is used for interface transitions and animated presentation, while Lenis provides smooth scrolling. The motion layer supports the workspace experience without making animation the focus of the color and theme information.",
            },

            responsive: {
                desktop:
                    "The desktop workspace provides room to inspect theme references, semantic color groups, and component examples together, making broader comparisons easier.",

                tablet:
                    "The layout adapts to reduced horizontal space while preserving the hierarchy of theme information and the primary workspace controls.",

                mobile:
                    "The workspace reorganizes for narrow screens, prioritizing readable token references, accessible controls, and the core theme-exploration workflow.",
            },

            showcase: [
                {
                    type: "image",
                    src: "/projects/systemcanvas/gallery/feature.webp",
                    alt: "System Canvas theme comparison interface displaying Light and Dark semantic previews with matching component roles and theme-specific values.",
                    caption:
                        "Compare Light and Dark themes side by side while keeping semantic roles and component structure consistent.",
                },

                {
                    type: "image",
                    src: "/projects/systemcanvas/gallery/export conditioal css tailwind css conditial dark.webp",
                    alt: "System Canvas export panel showing Tailwind CSS v4 options and generated design tokens alongside the theme workspace.",
                    caption:
                        "Configure export options and generate theme-aware CSS variables and design tokens for your project.",
                },

                {
                    type: "image",
                    src: "/projects/systemcanvas/gallery/dark-workspace.webp",
                    alt: "System Canvas design-token workspace showing editable color tokens and synchronized Light and Dark interface previews.",
                    caption:
                        "Edit semantic color tokens and compare how interface components appear across Light and Dark themes.",
                },
            ],

            reflection: {
                statement:
                    "Bringing design-token thinking and frontend implementation into one workspace.",

                worked: [
                    "The project connects a structured visual system with a component-driven React interface.",

                    "Presenting theme references in a dedicated workspace creates a clearer way to inspect design decisions.",

                    "Reusable tokens provide a foundation for keeping interface styling consistent across components and appearance modes.",

                    "Motion and smooth scrolling enhance the experience while keeping the workspace content central.",
                ],

                improve:
                    "Further development could expand the workspace into a more comprehensive design-system reference, with clearer token documentation, side-by-side light and dark comparisons, reusable component previews, and more detailed demonstrations of focus, hover, disabled, validation, and semantic states. Any additional capabilities should be described only once they are implemented and verified in the application.",
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
                    src: "/projects/nextjs-master/gallery/feature.webp",
                    alt: "Next.js Master application overview",
                    caption:
                        "Next.js Master — application overview.",
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