import "./globals.css";

import FaviconSwitcher from "./components/FaviconSwitcher";
import ClientMainProvider from "./redux/ClientMainProvider";
import DarkModeReminderProvider from "./redux/DarkModeReminderProvider";

import { Footer } from "./components";
import ScrollIndicator from "./components/atoms/UI/scrollIndicator/ScrollIndicator";
import Toast from "./components/atoms/UI/toast/Toast";

import { Poppins, Roboto, Michroma, Open_Sans, Lora,} from "next/font/google";

export const metadata = {
  title: {
    default: "Vishal Kumar Choudhary | Frontend Developer | React & Next.js",
    template: "%s | Vishal Kumar Choudhary",
  },

  description:
    "Frontend Developer portfolio of Vishal Kumar Choudhary. Specializing in React, Next.js, Redux Toolkit, Tailwind CSS, and modern UI development. Explore real-world frontend projects.",

  keywords: [
    "Vishal Kumar Choudhary",
    "Frontend Developer",
    "React Developer",
    "Next.js Developer",
    "Modern Frontend Portfolio",
    "React Projects",
    "Frontend Engineer India",
    "Redux Toolkit",
    "Tailwind CSS",
    "Framer Motion",
    "Web Developer Portfolio",
  ],

  openGraph: {
    title: "Vishal Kumar Choudhary | Frontend Developer | React & Next.js",
    description:
      "Explore modern frontend projects built with React, Next.js, Redux Toolkit, Tailwind CSS, and Framer Motion.",
    url: "https://vishal-portfolio.com",
    siteName: "Vishal Kumar Choudhary Portfolio",
    images: [
      {
        url: "https://vishal-portfolio.com/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Vishal Kumar Choudhary Frontend Developer Portfolio",
      },
    ],
    type: "website",
    locale: "en_IN",
  },

  authors: [
    {
      name: "Vishal Kumar Choudhary",
      url: "https://github.com/VishalChoudhary01",
    },
  ],

  creator: "Vishal Kumar Choudhary",
  publisher: "Vishal Kumar Choudhary",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "https://vishal-portfolio.com",
  },

  icons: {
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },

  manifest: "/manifest.json",
};


// Initialize ALL fonts
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-michroma",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
});


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dark Mode Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    const dark = localStorage.getItem("dark");
    if (dark === "true") {
      document.documentElement.classList.add("dark");
    } else if (dark === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) document.documentElement.classList.add("dark");
    }
  } catch (_) {}
})();
`,
          }}
        />

        {/* JSON-LD Structured Data - Person Schema */}
        <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Vishal Kumar Choudhary",
      url: "https://vishal-portfolio.com",
      image: "https://vishal-portfolio.com/profile-image.jpg",
      jobTitle: "Frontend Developer",
      description:
        "Frontend Developer specializing in React, Next.js, Redux Toolkit, and modern UI development.",
      alumniOf: {
        "@type": "EducationalOrganization",
        name: "Banaras Hindu University",
      },
      sameAs: [
        "https://github.com/VishalChoudhary01",
        "https://www.linkedin.com/in/vishal-kumar-choudhary-664921229/",
        "https://www.naukri.com/",
        "https://www.indeed.com/",
      ],
      knowsAbout: [
        "React",
        "Next.js",
        "JavaScript",
        "TypeScript",
        "Redux Toolkit",
        "Tailwind CSS",
        "Framer Motion",
        "Frontend Development",
        "UI/UX",
      ],
    }),
  }}
/>


        {/* JSON-LD Structured Data - Website Schema */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
      __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Vishal Kumar Choudhary Portfolio",
      url: "https://vishal-portfolio.com",
      description:
        "Official portfolio website of Vishal Kumar Choudhary, Frontend Developer specializing in React and Next.js."
    }),
  }}
/>


        {/* JSON-LD Structured Data - Professional Schema */}
        <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Vishal Kumar Choudhary Portfolio",
      url: "https://vishal-portfolio.com",
      logo: "https://vishal-portfolio.com/favicon/android-chrome-512x512.png",
      sameAs: [
        "https://github.com/VishalChoudhary01",
        "https://www.linkedin.com/in/vishal-kumar-choudhary-664921229/",
      ],
    }),
  }}
/>

      </head>
      <body
        className={`
          ${michroma.variable}
          ${openSans.variable}
          ${poppins.variable}
          ${roboto.variable}
          ${lora.variable}
          font-sans antialiased
        `}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
        >
          Skip to main content
        </a>
        <ScrollIndicator />

        <ClientMainProvider>
          <DarkModeReminderProvider />
          <Toast />
          <FaviconSwitcher />
          <main id="main-content">{children}</main>
          <Footer />
        </ClientMainProvider>
      </body>
    </html>
  );
}
