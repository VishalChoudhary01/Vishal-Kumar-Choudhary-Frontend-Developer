# Vishal Kumar Choudhary — Frontend Developer Portfolio

## Overview

This is a personal frontend developer portfolio built with Next.js. The site presents professional experience, skills, education, selected projects, and a contact form, with individual case-study pages for each featured project.

## Features

- Homepage sections for the introduction, about, education, skills, experience, projects, and contact.
- Four project case studies with project-specific metadata and image galleries.
- Desktop navigation, a mobile menu, and a light/dark theme toggle.
- Motion-based interface transitions, Lenis smooth scrolling, and a Three.js portfolio mascot.
- Contact form backed by a server-side API route and Gmail SMTP.
- Responsive layouts and project media presentation.
- Per-page metadata, canonical URLs, Open Graph and Twitter cards, JSON-LD, `robots.txt`, and a generated sitemap.

## Technology Stack

### Application

- **Next.js 16 App Router** and **React 19** provide server-rendered pages, static project routes, and API routes.
- **JavaScript and JSX** are used throughout the application.
- **Tailwind CSS 4** supplies utility styling through the Tailwind PostCSS plugin.

### Interaction and UI

- **Motion** (`motion/react`) powers interface and scroll-linked animations.
- **Lenis** provides smooth scrolling.
- **next-themes** manages the light and dark themes.
- **Three.js** renders the portfolio mascot.
- **Lucide React** and **React Icons** provide interface and brand icons.
- **clsx** and **tailwind-merge** are combined by the shared `cn` class-name utility.

### SEO, email, and development tools

- Next.js Metadata API plus project utilities generate metadata and JSON-LD; `scripts/validate-seo.cjs` checks project SEO data.
- **Nodemailer** sends contact messages through Gmail SMTP in the contact API route. A Resend helper and dependency are also present, but the contact route uses Nodemailer.
- **ESLint** and `eslint-config-next` provide linting. React Compiler is enabled in the Next.js configuration.
- **Puppeteer Core** and **axe-core** support local browser verification and accessibility scripts; **Tailwind CSS** and its PostCSS plugin are development dependencies.

## Project Structure

```text
final/
├── implemention Doc/           # Local implementation specifications and notes
├── performance doc/            # Performance and architecture audits
├── public/
│   ├── images/                 # Profile and company imagery
│   ├── mp3/                    # Interface sound assets
│   ├── projects/               # Project cover and gallery media
│   └── resume/                 # Downloadable resume
├── scripts/                    # SEO validation and local verification tools
├── src/
│   └── app/
│       ├── api/                # Contact and development source-context routes
│       ├── components/
│       │   ├── common/         # Shared interface elements
│       │   ├── errors/         # Error and diagnostic UI
│       │   ├── layout/         # Navigation and footer
│       │   ├── mascot/         # Three.js mascot
│       │   ├── motion/         # Reusable motion components
│       │   ├── project-detail/ # Project case-study presentation
│       │   ├── sections/       # Homepage sections
│       │   ├── seo/            # Structured-data component
│       │   └── ui/             # Shared UI controls
│       ├── data/               # Portfolio, project, and section data
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # SEO, scrolling, motion, and utility modules
│       ├── projects/[slug]/    # Static project detail route
│       ├── providers/          # App, theme, motion, menu, and loader providers
│       ├── store/              # Shared UI state
│       ├── globals.css         # Global styles and Tailwind import
│       ├── layout.js           # Root layout and site metadata
│       ├── page.js             # Homepage metadata and structured data
│       ├── robots.js           # Generated robots rules
│       └── sitemap.js          # Generated sitemap
├── eslint.config.mjs
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── jsconfig.json
└── README.md
```

The documentation directory is spelled `implemention Doc` in the current repository. Both documentation folders are local-only and are excluded by `.gitignore`. The root also contains [the performance optimization report](PERFORMANCE-OPTIMIZATION-REPORT.md).

## Getting Started

Install the locked dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The homepage can run without email credentials. To enable contact submissions, the current `/api/contact` implementation expects `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `CONTACT_TO_EMAIL` in the local environment. `NEXT_PUBLIC_SITE_URL` sets the canonical site origin and has a code-defined fallback.

**Environment configuration note:** `.env.example` currently lists `RESEND_API_KEY`, optional `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`, and `NEXT_PUBLIC_SITE_URL`. The contact API currently uses Gmail SMTP instead of Resend, so the example does not list the two required Gmail variables. Keep credentials in an untracked local environment file and do not commit them.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Run SEO validation, then create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run validate:seo` | Validate project SEO data. |

## Routes

- `/` — portfolio homepage.
- `/projects/class-fuse` — ClassFuse case study.
- `/projects/spendwise` — Spendwise case study.
- `/projects/system-canvas` — System Canvas case study.
- `/projects/nextjs-master` — Next.js Master case study.
- `/api/contact` — contact form submission endpoint.
- `/api/source-snapshot` — development-only source context endpoint; it returns 404 in production.
- `/robots.txt` and `/sitemap.xml` — generated by the App Router.

Project detail pages are generated from the canonical project data. Unknown project slugs return a 404.

## Performance and SEO

The Next.js configuration enables the React Compiler, configures responsive image sizes and AVIF/WebP formats, and sets cache and security-related response headers. SEO metadata and structured data are generated from shared project and site data; the SEO validator is also part of the production build command.

Performance audits and historical project notes are available in [`performance doc/`](performance%20doc/) and [`PERFORMANCE-OPTIMIZATION-REPORT.md`](PERFORMANCE-OPTIMIZATION-REPORT.md). These documents describe analysis and baselines; this README makes no claim about current Lighthouse scores or Core Web Vitals.

## Maintenance Notes

- Preserve existing layout, responsive behavior, theme handling, and motion/scroll interactions when making UI changes.
- Follow the existing JavaScript/JSX and Tailwind CSS conventions.
- Keep `package.json` and `package-lock.json` in sync; avoid unrequested dependency changes.
- Run `npm run lint`, `npm run validate:seo`, and `npm run build` before submitting changes.
