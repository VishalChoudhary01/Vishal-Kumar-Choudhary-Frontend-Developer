export const projects = [



{
    id: "class-fuse",
    number: "01",
    name: "ClassFuse",
    slug: "class-fuse",
    category: "tool",
    categoryLabel: "Developer Tool",

    description:
        "A component-first Tailwind CSS formatter that transforms complete React components into cleaner, consistently formatted code while preserving their original functionality.",

    role: "Frontend Developer",

    year: "2026",

    technologies: [
        "Next.js",
        "React",
        "JavaScript",
        "Tailwind CSS v4",
        "Redux Toolkit",
        "Motion",
        "Lenis",
        "next-themes",
        "Prettier",
        "Prettier Tailwind Plugin",
        "React Icons",
    ],

    contribution:
        "Designed and developed ClassFuse from its product experience to its formatting workflow, building a complete developer tool with JSX/TSX parsing, Tailwind-aware class cleanup, a focused editor workspace, formatting history, and a responsive product landing page.",

    features: [
        "Format complete React component source instead of manually cleaning individual class strings",
        "Support both JSX and TSX through dedicated parser selection",
        "Reorder supported Tailwind CSS utilities into a consistent format",
        "Remove duplicate utility classes and normalize unnecessary whitespace",
        "Keep formatting scoped to supported static class and className values",
        "Preserve component structure, imports, props, hooks, event handlers, and application logic",
        "Preserve dynamic expressions and component-specific configurations, including Motion props",
        "Review original source and formatted output in a focused editor workspace",
        "Handle unsupported or mismatched source input without replacing the original code",
        "Keep recent formatting sessions available through private history",
        "Support account-based access and a dedicated workspace experience",
        "Provide light and dark themes",
        "Deliver responsive layouts across desktop, tablet, and mobile",
        "Use purposeful motion and interaction feedback throughout the product",
    ],

    media: {
        type: "image",
        src: "/projects/classfuse/classfuse_hero.webp",
        alt: "ClassFuse developer tool showing its Tailwind CSS component formatting experience",
    },

    links: {
        live: "https://class-fuse.vercel.app/",
        github: "https://github.com/VishalChoudhary01/classFuse",
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
                "Formatting a React component should not mean manually fixing every Tailwind CSS class.",

            body: [
                "Tailwind CSS makes styling interfaces fast, but component source can become difficult to scan when utility classes are inconsistent, duplicated, spread across multiple lines, or arranged without a predictable order.",

                "Cleaning individual class strings is useful, but real development happens inside complete components. Developers also need to work around imports, JSX structure, props, conditional rendering, event handlers, hooks, and dynamic expressions.",

                "ClassFuse addresses this broader problem with a component-first formatting workflow. Developers can provide complete JSX or TSX source, format supported Tailwind class values, and review cleaner output without intentionally changing how their component works.",
            ],
        },

        approach: [
            {
                title: "Component-first formatting",
                body:
                    "Rather than limiting the experience to isolated class strings, ClassFuse works with complete React component source. This makes the workflow more relevant to everyday development tasks.",
            },

            {
                title: "Preserve what matters",
                body:
                    "Formatting should improve readability without rewriting application behavior. The formatter keeps component logic, imports, props, hooks, handlers, and dynamic expressions intact while applying cleanup to supported static class values.",
            },

            {
                title: "Dedicated JSX and TSX parsing",
                body:
                    "Separate parser configurations support JSX and TSX input. Developers can choose the appropriate source format instead of relying on a single parser configuration for every component.",
            },

            {
                title: "Predictable Tailwind cleanup",
                body:
                    "Tailwind-aware formatting organizes supported utility classes, removes duplicates, and normalizes unnecessary whitespace to make className values easier to scan and maintain.",
            },

            {
                title: "A focused review workflow",
                body:
                    "The workspace keeps the original source and formatted result central to the experience. Developers can inspect the transformation before reusing the cleaned component.",
            },

            {
                title: "Reliable failure handling",
                body:
                    "Unsupported or mismatched input should not silently replace the original source. The formatting workflow reports failures while keeping the user's original code intact.",
            },
        ],

        design: {
            statement:
                "A focused developer workspace where code remains the primary visual element.",

            body:
                "The product design follows a clear hierarchy between the source editor, formatting actions, and resulting output. Typography, spacing, contrast, and restrained surface treatments help developers concentrate on their code rather than decorative interface elements. The same visual language carries across the landing page, formatter workspace, and supporting application screens. Light and dark themes maintain consistent readability and semantic contrast.",
        },

        engineering: [
            {
                title: "Next.js application architecture",
                body:
                    "Built with Next.js App Router, React, and JavaScript. The application separates its landing experience, formatter workspace, supporting pages, and server-side formatting functionality into maintainable parts.",
            },

            {
                title: "JSX and TSX source parsing",
                body:
                    "Dedicated parser configurations handle the two supported React source formats. Parser selection keeps source interpretation explicit and helps prevent mismatched input from being processed as the wrong syntax.",
            },

            {
                title: "Component-safe formatting",
                body:
                    "The formatter operates on complete component source while limiting Tailwind cleanup to supported static class and className values. Dynamic expressions, component logic, hooks, handlers, imports, and unrelated props are preserved.",
            },

            {
                title: "Tailwind-aware class organization",
                body:
                    "Tailwind CSS formatting uses its dedicated ordering integration to produce consistent utility sequences. Duplicate utilities and unnecessary whitespace are cleaned up without turning the formatter into a general application-code refactoring tool.",
            },

            {
                title: "Workspace state and history",
                body:
                    "Redux Toolkit supports predictable application state across the workspace. Recent formatting sessions are retained in private history, allowing users to revisit previous source and formatted results.",
            },

            {
                title: "Account and application experience",
                body:
                    "The application includes account access and supporting workspace routes, bringing the formatter into a more complete product experience rather than leaving it as an isolated utility.",
            },

            {
                title: "Theme-aware interface",
                body:
                    "Theme management supports light and dark experiences while keeping editor readability, semantic colors, and interface contrast consistent.",
            },
        ],

        motion: {
            statement:
                "Motion that explains the product, supports the workflow, and gives the interface a distinct identity.",

            body:
                "Motion is used as part of the product experience rather than as decoration. The landing page introduces the formatting problem and demonstrates the transformation through coordinated visual sequences. Within the interface, transitions and interaction feedback remain short and purposeful so that the code stays readable and the primary task remains uninterrupted.",

            principles: [
                {
                    title: "Progressive product storytelling",
                    body:
                        "The landing page introduces the problem, demonstrates the formatting experience, and guides visitors toward the tool through connected section transitions and carefully paced reveals.",
                },

                {
                    title: "Transformation-focused demonstrations",
                    body:
                        "Curated code examples communicate the difference between cluttered and organized Tailwind utilities through visual progression, keeping the transformation understandable without pretending that the demonstration is a live formatter execution.",
                },

                {
                    title: "Purposeful interaction feedback",
                    body:
                        "Buttons, navigation, icons, and interactive elements use restrained hover, focus, and press feedback. Animations reinforce interaction states rather than competing with the content.",
                },

                {
                    title: "Layered visual composition",
                    body:
                        "The landing page uses controlled depth, overlapping visual elements, and carefully arranged content layers to create a more engaging product presentation without unnecessary decoration.",
                },

                {
                    title: "Scroll-driven transitions",
                    body:
                        "Motion connects important landing-page sections through subtle entrance reveals, controlled parallax, and progressive visual changes. The movement remains intentional rather than continuously animating every element.",
                },

                {
                    title: "Performance and accessibility",
                    body:
                        "Animations respect reduced-motion preferences and avoid unnecessary looping or excessive movement. Responsive behavior and readable content remain priorities across screen sizes.",
                },
            ],
        },

        responsive: {
            desktop:
                "A spacious developer workspace gives the source editor, formatting controls, and resulting output enough room to remain clear and easy to compare. The landing page uses wider content compositions and layered product demonstrations without allowing sections to become unnecessarily stretched.",

            tablet:
                "The layout adjusts editor proportions, navigation, section spacing, and supporting content for narrower viewports. Primary controls remain accessible and the source-to-output relationship stays understandable.",

            mobile:
                "A vertically organized experience prioritizes the source editor, formatting actions, and output. Navigation, controls, typography, and interactive elements adapt to smaller screens while animations remain restrained and readable.",
        },

        showcase: [
            {
                type: "image",
                src: "/projects/classfuse/gallery/feature.webp",
                alt: "ClassFuse landing page demonstrating the transformation from cluttered Tailwind CSS utilities to an organized className format.",
                caption:
                    "The formatting problem and how ClassFuse makes Tailwind utility classes easier to read.",
            },
            {
                type: "image",
                src: "/projects/classfuse/gallery/classfuse_tool.webp",
                alt: "ClassFuse formatter workspace showing component source input and formatted React code output.",
                caption:
                    "A component-first workspace for formatting complete React source.",
            },
            {
                type: "image",
                src: "/projects/classfuse/gallery/duplication indication and easy to clean double click.webp",
                alt: "ClassFuse editor showing duplicate Tailwind utility indication and the formatting cleanup workflow.",
                caption:
                    "Identify duplicate utilities and clean up supported Tailwind class values.",
            },
        ],

        reflection: {
            statement:
                "A small formatting task becomes a more useful developer tool when the complete component workflow is considered.",

            worked: [
                "Moving from isolated class-string cleanup to complete component formatting made the product more relevant to real React development workflows.",

                "Keeping formatting scoped to supported static class values helped establish a clear boundary between code formatting and application logic.",

                "Dedicated JSX and TSX parser selection made source handling more explicit and improved the overall formatting workflow.",

                "A focused source-and-output workspace made it easier to understand, inspect, and reuse formatting results.",

                "A consistent design system, responsive layouts, and restrained motion helped connect the landing page with the actual product experience.",

                "Treating error handling and preservation of original source as part of the product experience made reliability a core design consideration.",
            ],

            improve:
                "Future opportunities include deeper editor integrations, additional developer workflow integrations, and broader language and syntax support while maintaining the core principle: improve code readability without unexpectedly changing component behavior.",
        },
    },
}

,

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
    {
        id: "trailorride",
        number: "04",
        name: "Trailor Ride",
        slug: "trailorride",
        category: "landing-page",
        categoryLabel: "Landing Page",

        description:
            "A modern motorcycle marketplace landing page built with Next.js and TypeScript, combining immersive visuals, responsive layouts, and custom motion interactions to create a clear, engaging brand experience.",

        role: "Frontend Developer",
        year: "2025",

        technologies: [
            "Next.js",
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Motion",
            "Lenis",
            "React Icons",
        ],

        contribution:
            "Implemented the landing page from desktop design references using Next.js and TypeScript. Independently designed and developed the tablet and mobile layouts, added custom animations and scroll-based interactions with Motion, refined reusable UI components, and replaced placeholder Lorem Ipsum content with meaningful copy aligned with the Trailor Ride experience.",

        features: [
            "Responsive motorcycle marketplace landing page",
            "Tablet and mobile layouts independently designed from desktop references",
            "Reusable React components and responsive Tailwind CSS styling",
            "Custom Motion-based interactions and scroll animations",
            "Smooth scrolling with Lenis",
            "Meaningful brand-focused content replacing placeholder copy",
        ],

        media: {
            type: "image",
            src: "/projects/trailorride/trailorride.webp",
            alt: "Trailor Ride motorcycle marketplace landing page",
        },

        links: {
            live: "https://trailor-trade.vercel.app",
            github: "https://github.com/VishalChoudhary01/Trailor-Trade-",
            figma: "https://www.figma.com/design/Z3IQPsEokQ9c2ho1n1wDTC/NextJS-Assignment--Part-1--by-webbywolf--Community---Copy-?node-id=31-6&t=CpdVgMzHMfwUGzZB-1",
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
                    "A motorcycle marketplace experience shaped around clear storytelling, responsive design, and engaging interactions.",

                body: [
                    "Trailor Ride is a motorcycle-focused landing page created from a desktop Figma design reference. The implementation translates the supplied visual direction into a working Next.js experience while adapting the layout for tablet and mobile screens.",
                    "Beyond matching the desktop reference, the work involved making responsive design decisions independently, refining the content, and adding motion details that support the browsing experience.",
                ],
            },

            approach: [
                {
                    title: "Translate the desktop design",
                    body:
                        "Used the supplied Figma reference as the visual foundation, translating its page structure, typography, imagery, and content hierarchy into reusable React components.",
                },
                {
                    title: "Design the missing breakpoints",
                    body:
                        "The supplied reference focused on desktop. Tablet and mobile layouts were independently designed and implemented to preserve the content hierarchy and usability at narrower widths.",
                },
                {
                    title: "Make the content meaningful",
                    body:
                        "Replaced placeholder Lorem Ipsum with readable, brand-focused copy so the page communicates a coherent motorcycle marketplace experience.",
                },
                {
                    title: "Add purposeful interaction",
                    body:
                        "Introduced Motion-based transitions and scroll interactions to make the experience feel more engaging while keeping the content and primary actions clear.",
                },
            ],

            design: {
                statement:
                    "A desktop-led visual direction adapted into a coherent responsive experience.",

                body:
                    "The implementation follows the supplied Figma direction for the desktop layout, including its blue action accents, typography hierarchy, visual sections, and image-led composition. Tablet and mobile layouts were designed to maintain that identity while adapting spacing, stacking, and content flow to smaller screens.",
            },

            engineering: [
                {
                    title: "Next.js and TypeScript",
                    body:
                        "Built the frontend with Next.js and TypeScript, using React components to keep the page structure modular and maintainable.",
                },
                {
                    title: "Reusable UI components",
                    body:
                        "Structured repeated page patterns as reusable components to make the implementation easier to refine and keep consistent.",
                },
                {
                    title: "Responsive styling",
                    body:
                        "Used Tailwind CSS to implement desktop, tablet, and mobile layouts, including the responsive decisions that were not supplied in the original design reference.",
                },
                {
                    title: "Motion interactions",
                    body:
                        "Used Motion for interface transitions and scroll-based animation, adding feedback and pacing without making animation the focus of the content.",
                },
                {
                    title: "Smooth scrolling",
                    body:
                        "Integrated Lenis to provide the smooth-scrolling behavior used by the landing page.",
                },
            ],

            motion: {
                statement:
                    "Custom motion details give the page a more engaging rhythm.",

                body:
                    "Motion is used to support the page's visual storytelling through entrance transitions, scroll-linked reveals, and interactive feedback. The effects complement the responsive layout rather than replacing or delaying access to the content.",
            },

            responsive: {
                desktop:
                    "The desktop implementation follows the supplied Figma composition, including its wide hero, image-led sections, and multi-column content layouts.",

                tablet:
                    "Tablet layouts were designed independently, adjusting widths, spacing, and section composition so the desktop content remains clear and balanced.",

                mobile:
                    "Mobile layouts were also designed independently, reorganizing desktop sections into a compact vertical flow with readable typography and accessible actions.",
            },

            showcase: [
                {
                    type: "image",
                    src: "/projects/trailorride/trailorride.webp",
                    alt: "Trailor Ride landing page overview",
                    caption:
                        "Trailor Ride — responsive motorcycle marketplace landing page.",
                },
            ],

            reflection: {
                statement:
                    "Turning a desktop-only reference into a complete responsive landing page.",

                worked: [
                    "The desktop reference provided a clear visual foundation for implementation.",
                    "Designing tablet and mobile layouts independently extended the work beyond direct desktop translation.",
                    "Replacing placeholder content made the page feel more coherent and aligned with its subject.",
                    "Motion interactions added visual polish while preserving the page's core browsing flow.",
                ],

                improve:
                    "The next improvements could include richer project-specific showcase captures across breakpoints and documenting additional interaction details to make the responsive and motion decisions easier to review.",
            },
        },
    },
];