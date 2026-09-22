import { GithubIcon, LinkedinIcon, GmailIcon, CloudIcon } from "@/app/components/ui/Icons";



const email = "vishal.bhumca21@gmail.com";

const subject = "Let's Discuss an Opportunity";

const body = `Hi Vishal,

I came across your portfolio and would like to connect with you.

I’m reaching out regarding a potential opportunity and would be happy to share more details.

Best regards,`;

const gmailHref =
  `https://mail.google.com/mail/?` +
  `view=cm` +
  `&to=${encodeURIComponent(email)}` +
  `&su=${encodeURIComponent(subject)}` +
  `&body=${encodeURIComponent(body)}`;

export const portfolio = {
  name: "Vishal Kumar Choudhary",
  role: "Frontend Developer",

  navigation: [
    {
      label: "About",
      href: "#about",
      /* Education + Skills belong to the same "background" family as About,
         so they live under it in the navigation group. */
      children: [
        {
          label: "Education",
          href: "#education",
        },
        {
          label: "Skills",
          href: "#skills",
        },
      ],
    },
    {
      label: "Experience",
      href: "#experience",
    },
    {
      label: "Projects",
      href: "#projects",
    },
    {
      label: "Contact",
      href: "#contact",
    },
  ],

  socialLinks: [
    {
      label: "GitHub",
      href: "https://github.com/",
      icon: FaGithub,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/",
      icon: FaLinkedin,
    },
    {
      label: "Email",
      href: gmailHref,
      icon: SiGmail,
    },
  ],

  

  resumeUrl: "/resume.pdf",

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
      logo: "/images/companylogo/bi-hub.png",
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
      logo: "/images/companylogo/cling.svg",
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
      logoIcon: FiCloud,
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

  skills: [],

  /* ────────────────────────────────────────────────────────────────────────
     PROJECTS — each project may carry a case-study `story` object that the
     /projects/[slug] detail page renders (see Project_Detail.md).

     The SHOWCASE section is a dynamic bento/mosaic gallery:
       story.showcase = [ { type, src, alt, caption, layout? }, ... ]

     - Add one entry per real screenshot. Entries render automatically.
     - One entry  → full-width feature presentation.
     - 2+ entries → auto-composed bento mosaic (or hint each tile's shape):
         layout: "feature" | "wide" | "tall" | "standard" | "full"
         feature  → large two-row tile        (hero/homepage shot)
         wide     → half-width single row     (wide section shot)
         tall     → portrait two-row tile     (mobile / stacked view)
         standard → quarter-width tile        (detail crop / section)
         full     → full-width banner
       type: "image" (default) | "video" (needs src + optional poster).
     ──────────────────────────────────────────────────────────────────────── */
  projects: [
    {
      id: "portfolio-redesign",
      number: "01",
      name: "Portfolio Redesign",
      slug: "portfolio-redesign",
      category: "web-experience",
      type: "Web Experience",
      description:
        "A scroll-driven editorial portfolio built with Next.js, Motion, and Tailwind — featuring cinematic hero choreography, interactive timelines, and a premium theme system.",
      role: "Frontend Developer",
      year: "2026",
      technologies: ["Next.js", "React", "Motion", "Tailwind CSS"],
      contribution:
        "Designed and developed the interface, animation system, responsive architecture, and reusable components from concept to production.",
      features: [
        "Cinematic scroll-driven hero choreography",
        "Interactive editorial experience timeline",
        "Premium dark/light theme system with cinematic reveal",
      ],
      media: {
        type: "image",
        src: "/images/png/laptop-me.png",
        alt: "Portfolio project — editorial design with scroll-driven hero and interactive experience timeline",
      },
      links: {
        live: null,
        github: null,
      },
      presentation: {
        mode: "editorial",
        variant: "featured",
        emphasis: "visual",
        density: "spacious",
      },
      motion: {
        entrance: "editorialReveal",
        media: "mediaReveal",
        hover: "mediaDepth",
        scroll: "softDepth",
      },
      status: "published",
      order: 1,
      featured: true,
      /* Which story sections actually exist for this project. */
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
      /* Case-study narrative — honest, evidence-based copy. */
      story: {
        context: {
          statement: "The portfolio had to prove the craft, not just describe it.",
          body: [
            "I redesigned and rebuilt my own portfolio as a scroll-driven editorial experience — the kind of work I want to be hired to build. It is a frontend case study in itself: cinematic hero choreography, an interactive experience timeline, a premium theme system, and a data-driven project archive.",
            "The challenge was to make design, motion, and engineering work as one system — a portfolio whose interface itself demonstrates the skills it claims.",
          ],
        },
        approach: [
          {
            title: "Visual direction",
            body: "I established a warm ivory light mode and a near-black dark mode around an editorial serif display face, with teal as the single accent. Typography and whitespace carry the hierarchy.",
          },
          {
            title: "Information structure",
            body: "The page is organized as a narrative: cinematic hero, editorial about section, interactive experience timeline, education archive, capability rows, and a case-study project archive.",
          },
          {
            title: "Interaction and motion",
            body: "Motion is built from a small preset vocabulary — masked word cascades, staggered reveals, a scroll-driven hero takeover — so every animation belongs to one system instead of feeling scattered.",
          },
          {
            title: "Responsive system",
            body: "Desktop, tablet, and mobile are distinct layout states rather than scaled versions of one design. Touch gets reduced depth and no hover-dependent information.",
          },
        ],
        design: {
          statement: "Editorial typography, generous whitespace, one accent.",
          body: "The design leans on scale contrast: small uppercase labels against large serif statements. Sections share a consistent two-column editorial grid with a signature-line finish, so the page reads as one system from top to bottom.",
        },
        engineering: [
          {
            title: "Component architecture",
            body: "Reusable primitives — SectionHeading, project presentation renderers, project cards — keep the archive data-driven. Project data is normalized once and rendered through a presentation dispatcher.",
          },
          {
            title: "Motion architecture",
            body: "All animation values live in preset modules (entrance, media, hover, scroll). Components reference preset names instead of scattering arbitrary values, which keeps the motion language coherent.",
          },
          {
            title: "Theme system",
            body: "Light and dark themes are tokenized as CSS variables. The provider respects prefers-color-scheme first, then applies a localStorage override after hydration without a flash.",
          },
          {
            title: "Performance and accessibility",
            body: "Client components are scoped to interaction. Reveals respect prefers-reduced-motion, all information is available without hover, and non-critical media is lazy-loaded.",
          },
        ],
        motion: [
          {
            label: "Enter",
            body: "Section labels rise letter-by-letter out of masked rows; supporting statements cascade word-by-word. The hero is choreographed as one sequence.",
          },
          {
            label: "Scroll",
            body: "The hero is a scroll-driven takeover: the title scales down while the image slides across and grows, then hands off to the editorial body.",
          },
          {
            label: "Hover",
            body: "Project media responds with a subtle camera shift and depth tilt; links and arrows animate within 200–350ms without bounce.",
          },
          {
            label: "Transition",
            body: "Category filtering and theme switching transition smoothly. Motion is felt rather than announced.",
          },
        ],
        responsive: {
          desktop: "The hero uses an asymmetric grid — content left, media right. Body sections use the two-column editorial system with a 180px label rail.",
          tablet: "Tablet keeps the editorial grid but reduces horizontal spacing and typography scale. The hero stacks once the media can no longer stay large.",
          mobile: "Everything becomes a single intentional column. Depth and parallax are reduced, hover-only content is removed, and touch targets stay comfortable.",
        },
        showcase: [
          {
            type: "image",
            src: "/images/png/laptop-me.png",
            alt: "Portfolio homepage — editorial hero, section system, and project archive",
            caption: "The portfolio homepage — editorial hero and section system.",
          },
        ],
        reflection: {
          statement: "Building the portfolio taught me how much of frontend quality is system design, not screen design.",
          worked: [
            "A small motion vocabulary created a coherent identity across many sections.",
            "Data-driven sections made adding a project a data edit rather than a rebuild.",
            "Designing reduced-motion and mobile states early prevented rework.",
          ],
          improve:
            "Next I would add real project media — actual screenshots and recordings of the work — so the showcase section carries stronger evidence than a single image.",
        },
      },
    },
    {
      id: "tetr-platform",
      number: "02",
      name: "Tetr College Platform",
      slug: "tetr-platform",
      category: "production-platform",
      type: "Production Platform",
      description:
        "Production-ready web experiences translating Figma designs into responsive interfaces with strong attention to visual accuracy, accessibility, and interaction quality.",
      role: "Associate Software Developer",
      year: "2026",
      technologies: ["HTML", "CSS", "JavaScript", "Astro", "Motion"],
      contribution:
        "Built responsive production pages from Figma specifications, implemented reusable UI patterns, and added interface animations.",
      features: [
        "Responsive production pages from Figma",
        "Reusable UI patterns and layouts",
        "Interface animations and transitions",
      ],
      media: {
        type: "image",
        src: "/images/png/laptop-me.png",
        alt: "Tetr College of Business — production web interfaces and responsive design",
      },
      links: {
        live: null,
        github: null,
      },
      presentation: {
        mode: "editorial",
        variant: "split",
        emphasis: "narrative",
        density: "comfortable",
      },
      motion: {
        entrance: "editorialReveal",
        media: "mediaReveal",
        hover: "mediaScale",
        scroll: "softDepth",
      },
      status: "published",
      order: 2,
      featured: false,
      /* Motion lives inside Engineering — no dedicated Motion section. */
      content: {
        context: true,
        approach: true,
        design: true,
        engineering: true,
        motion: false,
        responsive: true,
        showcase: true,
        reflection: true,
      },
      story: {
        context: {
          statement: "Production pages built from design specifications, at production quality.",
          body: [
            "At Tetr College of Business I developed and maintained production-ready web experiences, translating Figma designs into responsive interfaces with close attention to visual accuracy, accessibility, and interaction quality.",
            "The work was iterative — deploy, review, refine. The bar was pixel consistency with the design and reliability across every screen size.",
          ],
        },
        approach: [
          {
            title: "Design accuracy",
            body: "I translated Figma specifications into responsive pages, preserving hierarchy, spacing, and component details across breakpoints.",
          },
          {
            title: "Reusable UI patterns",
            body: "I implemented shared components so repeated interface elements stayed consistent and maintainable.",
          },
          {
            title: "Interface motion",
            body: "I added Motion-based transitions where they improved feedback, keeping them subtle and performant.",
          },
          {
            title: "Asset management",
            body: "I managed and optimized image assets for different screen sizes so pages stayed fast without sacrificing fidelity.",
          },
        ],
        design: {
          statement: "Faithful to the design system, responsive by default.",
          body: "The emphasis was visual accuracy — spacing, type scale, and component states that match the product design — while ensuring the interface held together at every breakpoint.",
        },
        engineering: [
          {
            title: "Responsive implementation",
            body: "Pages were built responsive-first, with layouts that stack and reflow deliberately across desktop, tablet, and mobile.",
          },
          {
            title: "Component patterns",
            body: "Reusable UI patterns reduced duplication and kept implementation consistent across pages.",
          },
          {
            title: "Interface animation",
            body: "Interface animations used Motion with transform and opacity only, and respected reduced-motion preferences.",
          },
          {
            title: "Performance",
            body: "Image assets were optimized and managed per screen size to keep production pages lean.",
          },
        ],
        responsive: {
          desktop: "Full multi-column layouts preserving the original design hierarchy.",
          tablet: "Reduced horizontal spacing and adjusted type scale so the design never felt compressed.",
          mobile: "Single-column composition with reordered content where the design required it — no horizontal overflow.",
        },
        showcase: [
          {
            type: "image",
            src: "/images/png/laptop-me.png",
            alt: "Production interfaces built from Figma specifications",
            caption: "Production interfaces built from Figma specifications.",
          },
        ],
        reflection: {
          statement: "Production work sharpened my judgment about what 'done' means — pixel accuracy, accessibility, and performance together.",
          worked: [
            "Working from specifications improved my ability to match a design precisely.",
            "Reusable patterns made iteration across pages faster.",
          ],
          improve:
            "I would instrument performance earlier — measuring load behavior and image weight from the first deploy rather than after the fact.",
        },
      },
    },
    {
      id: "bi-hub-dashboard",
      number: "03",
      name: "BI Hub Dashboard",
      slug: "bi-hub-dashboard",
      category: "product",
      type: "Web App",
      description:
        "Responsive frontend experiences using React, connecting interface components to REST APIs and translating product designs into functional web interfaces.",
      role: "Frontend Developer Intern",
      year: "2025",
      technologies: ["React", "Tailwind CSS", "REST API", "Swagger"],
      contribution:
        "Developed reusable React UI components, implemented responsive layouts, and integrated RESTful APIs into frontend workflows.",
      features: [
        "Reusable React component architecture",
        "REST API integration with Swagger",
        "Responsive Tailwind CSS layouts",
      ],
      media: {
        type: "image",
        src: "/images/png/laptop-me.png",
        alt: "BI Hub Solution — responsive React dashboard with API integration",
      },
      links: {
        live: null,
        github: null,
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
        scroll: "none",
      },
      status: "published",
      order: 3,
      featured: false,
      content: {
        context: true,
        approach: true,
        design: true,
        engineering: true,
        motion: false,
        responsive: true,
        showcase: true,
        reflection: true,
      },
      story: {
        context: {
          statement: "A React frontend wired to real APIs — components that fetch, display, and manage data.",
          body: [
            "As a frontend developer intern at BI Hub Solution I built responsive React interfaces that connected to REST APIs, translating product designs into functional web interfaces.",
            "The core challenge was integration: understanding endpoints through Swagger documentation and designing the frontend around real data flow and interface states.",
          ],
        },
        approach: [
          {
            title: "Component architecture",
            body: "I developed reusable React components so screens shared consistent behavior instead of duplicating markup.",
          },
          {
            title: "API integration",
            body: "I consumed RESTful endpoints — reading Swagger documentation to understand requests, responses, and error cases before wiring up the UI.",
          },
          {
            title: "Responsive layouts",
            body: "I implemented layouts with Tailwind CSS that reflow cleanly across screen sizes while keeping data readable.",
          },
          {
            title: "Design conversion",
            body: "I translated Figma designs into production-oriented interfaces, balancing fidelity with what actually works in a data-driven UI.",
          },
        ],
        design: {
          statement: "Interface-first: hierarchy, states, and clarity over decoration.",
          body: "The design work centered on information hierarchy — dense data needed clear grouping, readable tables, and obvious actions without visual noise.",
        },
        engineering: [
          {
            title: "Reusable components",
            body: "A small library of React components handled the repeated patterns — inputs, tables, panels, and states.",
          },
          {
            title: "API workflows",
            body: "Frontend workflows were built around real endpoints, with loading, success, and error states handled deliberately rather than as an afterthought.",
          },
          {
            title: "Responsive system",
            body: "Tailwind utilities provided a consistent responsive system across screens and components.",
          },
          {
            title: "Documentation-driven integration",
            body: "Swagger documentation was the source of truth for the contracts between the UI and the API.",
          },
        ],
        responsive: {
          desktop: "Multi-column data layouts with full information density.",
          tablet: "Columns compress and side panels collapse without losing hierarchy.",
          mobile: "Data stacks into readable single-column flows with touch-sized controls.",
        },
        showcase: [
          {
            type: "image",
            src: "/images/png/laptop-me.png",
            alt: "React dashboard interfaces connected to REST APIs",
            caption: "React dashboard interfaces connected to REST APIs.",
          },
        ],
        reflection: {
          statement: "The internship taught me to design for real data — states, errors, and loading are part of the interface, not edge cases.",
          worked: [
            "API-first thinking kept the frontend honest about what the product could do.",
            "Reusable components kept growth manageable as screens multiplied.",
          ],
          improve:
            "I would introduce a clearer state strategy earlier; as data flows grew, passing data between components started to require more plumbing.",
        },
      },
    },
    {
      id: "cling-multi-app",
      number: "04",
      name: "Cling Multi Application",
      slug: "cling-multi-app",
      category: "production-platform",
      type: "Production Platform",
      description:
        "Modern frontend development transforming Figma designs into responsive interfaces using Next.js and Tailwind CSS with an emphasis on reusable UI patterns.",
      role: "Software Developer Intern",
      year: "2024",
      technologies: ["Next.js", "Tailwind CSS", "Figma"],
      contribution:
        "Converted Figma designs into responsive Next.js interfaces and created reusable UI components for consistent implementation.",
      features: [
        "Responsive Next.js interfaces",
        "Reusable UI component system",
        "Maintainable frontend patterns",
      ],
      media: {
        type: "image",
        src: "/images/png/laptop-me.png",
        alt: "Cling Multi Solution — responsive Next.js interfaces and reusable components",
      },
      links: {
        live: null,
        github: null,
      },
      presentation: {
        mode: "editorial",
        variant: "minimal",
        emphasis: "narrative",
        density: "comfortable",
      },
      motion: {
        entrance: "editorialReveal",
        media: "mediaReveal",
        hover: "mediaScale",
        scroll: "none",
      },
      status: "published",
      order: 4,
      featured: false,
      /* This project omits the Design section — the approach covers conversion. */
      content: {
        context: true,
        approach: true,
        design: false,
        engineering: true,
        motion: false,
        responsive: true,
        showcase: true,
        reflection: true,
      },
      story: {
        context: {
          statement: "Next.js interfaces built from Figma, structured for reuse.",
          body: [
            "At Cling Multi Solution I worked on modern frontend development, converting Figma designs into responsive Next.js interfaces with an emphasis on reusable UI patterns.",
            "The focus was maintainability — pages that would grow without turning into copy-pasted markup.",
          ],
        },
        approach: [
          {
            title: "Design to code",
            body: "I converted Figma designs into responsive Next.js interfaces, matching the visual system across breakpoints.",
          },
          {
            title: "Reusable components",
            body: "I created reusable UI components so shared patterns stayed consistent and changes propagated in one place.",
          },
          {
            title: "Maintainable structure",
            body: "I structured pages around clear, repeatable frontend patterns instead of one-off implementations.",
          },
        ],
        engineering: [
          {
            title: "Next.js structure",
            body: "Pages were organized using Next.js conventions — componentized sections and shared layout primitives.",
          },
          {
            title: "Component system",
            body: "A core set of reusable components carried the interface, keeping implementation consistent across pages.",
          },
          {
            title: "Responsive styling",
            body: "Tailwind CSS handled the responsive layer with utilities that reflowed layouts cleanly at each breakpoint.",
          },
        ],
        responsive: {
          desktop: "Full editorial layouts with the intended hierarchy.",
          tablet: "Spacing and type scale adjust so columns never feel cramped.",
          mobile: "Sections stack into a single deliberate column — readable text, no horizontal overflow.",
        },
        showcase: [
          {
            type: "image",
            src: "/images/png/laptop-me.png",
            alt: "Responsive Next.js interfaces built from Figma",
            caption: "Responsive Next.js interfaces built from Figma.",
          },
        ],
        reflection: {
          statement: "Cling reinforced the habit of building components, not pages.",
          worked: [
            "Reusable patterns made later pages faster to build and easier to change.",
            "Working from Figma kept design decisions grounded in a real visual system.",
          ],
          improve:
            "I would set up a documented component inventory earlier so reuse became a shared convention rather than a habit.",
        },
      },
    },
  ],
};
