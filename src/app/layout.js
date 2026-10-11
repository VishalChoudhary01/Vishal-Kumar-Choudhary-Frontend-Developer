import { Newsreader, Manrope, Azeret_Mono } from "next/font/google"

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
  weight: ["400", "500", "600"],
  display: "swap",
});

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

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
        {/* Theme-aware favicon */}
        <link
          id="theme-favicon"
          rel="icon"
          type="image/svg+xml"
          href="/icon0.svg"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const favicon = document.getElementById("theme-favicon");

                if (!favicon) return;

                const media = window.matchMedia(
                  "(prefers-color-scheme: dark)"
                );

                const updateFavicon = () => {
                  favicon.href = media.matches
                    ? "/icon0.svg"
                    : "/favicon.svg";
                };

                updateFavicon();

                media.addEventListener("change", updateFavicon);
              })();
            `,
          }}
        />
      </head>

      <body className="flex min-h-full flex-col bg-background">
        <AppProviders>
          <UIThemeProvider>
            <div className="flex-1">{children}</div>
            <Footer />
          </UIThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}