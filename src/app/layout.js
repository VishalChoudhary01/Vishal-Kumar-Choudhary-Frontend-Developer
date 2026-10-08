import { Newsreader, Manrope, Azeret_Mono, Great_Vibes } from "next/font/google";

import "./globals.css";

import { UIThemeProvider } from "./providers/UIThemeProvider";
import AppProviders from "./providers/AppProviders";
import Footer from "./components/layout/Footer";
import { buildSiteUrl } from "./lib/seo/urls";
import { SITE_TITLE, SITE_DESCRIPTION } from "./lib/seo/metadata";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

/*
 * Root metadata — site-wide defaults (title/description fallbacks,
 * metadataBase so any relative URL resolves against the canonical origin).
 * Page-level metadata (homepage, project pages) overrides these.
 */
export const metadata = {
  metadataBase: new URL(buildSiteUrl()),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${manrope.variable} ${azeretMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-full flex-col bg-background">
        <AppProviders>
          <UIThemeProvider>
            {/* Pages own their own <main> landmark — this must not be a second one. */}
            <div className="flex-1">{children}</div>
            <Footer />
          </UIThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
