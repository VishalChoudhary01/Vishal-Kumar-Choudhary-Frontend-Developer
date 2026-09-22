import { Newsreader, Manrope, Azeret_Mono,Great_Vibes } from "next/font/google";

import "./globals.css";

import { UIThemeProvider } from "./providers/UIThemeProvider";
import AppProviders from "./providers/AppProviders";
import Footer from "./components/layout/Footer";

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

const greatVibes=Great_Vibes({
  variable:"--font-logo",
  subsets:["latin"],
  weight:["400"],
  display:"swap"
})

export const metadata = {
  title: "VKr. — Frontend Developer",
  description:
    "Frontend developer building interactive digital experiences where design, motion, and engineering work as one.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable}   ${manrope.variable} ${azeretMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-full flex-col bg-background">
        <AppProviders>
          <UIThemeProvider>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </UIThemeProvider>   
        </AppProviders>
      </body>
    </html>
  );
}