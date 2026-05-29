export default function manifest() {
  return {
    name: "Vishal Kumar Choudhary | Portfolio",
    short_name: "Vishal",
    description: "Frontend Developer Portfolio",
    start_url: "/",
    "scope": "/",
     "lang": "en-IN",
      "dir": "ltr",
    display: "standalone",
     "display_override": ["standalone"],
    background_color: "#0f172a",
    theme_color: "#0f172a",
     "categories": ["portfolio", "technology", "education"],
    icons: [
      {
        src: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    "screenshots": [
    {
      "src": "/screenshots/home.webp",
      "sizes": "1280x720",
      "type": "image/webp",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.webp",
      "sizes": "375x812",
      "type": "image/webp",
      "form_factor": "narrow"
    }
  ],

     "shortcuts": [
    {
      "name": "Projects",
      "url": "/projects",
    },
  ]
  };
}

