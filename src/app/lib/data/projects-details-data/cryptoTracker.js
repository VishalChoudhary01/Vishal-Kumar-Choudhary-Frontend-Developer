
// Desktop Screens
import crypto_banner from "../../../../../public/images/project carousel/crypto-tracker/cryptoBanner.webp";
import cryptoTrending from '../../../../../public/images/project carousel/crypto-tracker/gallery/trending.webp';
import savedCoins from '../../../../../public/images/project carousel/crypto-tracker/gallery/savedCoins.webp';
import DetailCoinModal from '../../../../../public/images/project carousel/crypto-tracker/gallery/DetailCoinModal.webp';
import searchSuggestion from '../../../../../public/images/project carousel/crypto-tracker/gallery/SearchSuggestion.webp';

// Mobile screens
import crypto_mobile_home from "../../../../../public/images/project carousel/crypto-tracker/gallery/mobile/mobilehome.webp";
import crypto_mobile_trending from "../../../../../public/images/project carousel/crypto-tracker/gallery/mobile/mobiletreding.webp";

// Icons
import { RiSparkling2Line } from "react-icons/ri";
import { ImDatabase } from "react-icons/im";

const cryptoTracker = {
  id: 1,
  name: "Crypto Tracker",
  projectType: "Cryptocurrency Price Dashboard ",
  description:
    "A responsive dashboard that lists cryptocurrencies, provides trending coins, allows saving favorites, and displays simple charts for price trends.",
  image: crypto_banner,
  technologies: [
    "Vite",
    "React",
    "Tailwind CSS",
    "Recharts",
    "Redux Toolkit",
    "React Router",
    "Axios",
    "React Icons",
    "Motion",
  ],
  liveUrl: "https://crypto-tracker-two-olive.vercel.app/",
  githubUrl: "https://github.com/VishalChoudhary01/Crypto-Tracker",
  category: "Finance & Dashboard",
  year: "2024",

  longDescription:
    "Crypto Tracker is a client-side dashboard built with Vite and React that fetches crypto market data, displays it in a searchable table with charts, provides a trending view, and supports saving coins to a local store.",
  about: {
    short:
      "Crypto Tracker is a personal frontend project focused on building a responsive cryptocurrency dashboard using live market data, with emphasis on clean UI, state management, and data visualization.",
  },
  stats: {
    developmentTime: "7 days",
    pages: "3",
    components:
      "6+ ",
    responsiveBreakpoints: "3",
    lighthousePerformance: 68, 
    lighthouseAccessibility: 85,
    lighthouseBestPractices: 100,
    lighthouseSEO: 91,
    loadTime: "135ms",
    coreWebVitals: "Unknown",
  },

  bentoGrid: [
    {
      id: 1,
      title: "Coin Table (Home)",
      description:
        "Main table listing live coin prices, 24h changes, and quick actions (save/view).",
      image: crypto_banner,
      gridPosition: "md:col-span-2 md:row-span-2",
      category: "data",
      size: "medium",
    },
    {
      id: 2,
      title: "Search & Filters",
      description:
        "Searchbar with suggestions and debounced input for smooth UX.",
      image: searchSuggestion,
      gridPosition: "md:col-span-1 md:row-span-1",
      category: "utility",
      size: "medium",
    },
    {
      id: 3,
      title: "Trending",
      description:
        "Trending coins view highlighting movers and short charts.",
      image: cryptoTrending,
      gridPosition: "md:col-span-1 md:row-span-1",
      category: "showcase",
      size: "medium",
    },
    {
      id: 4,
      title: "Mobile Home View",
      description: "Mobile-optimized home view with responsive layout and touch interactions.",
      image: crypto_mobile_home,
      gridPosition: "md:col-span-1 md:row-span-2",
      category: "persistence",
      size: "tall",
    },
    {
      id: 5,
      title: "Details Modal",
      description:
        "Modal with coin details and Recharts visual for selected coin.",
      image: DetailCoinModal,
      gridPosition: "md:col-span-1 md:row-span-1",
      category: "details",
      size: "wide",
    },
    {
      id: 6,
      title: "Mobile Trending View",
      description:
        "Mobile-optimized home view with responsive layout and touch interactions.",
      image: crypto_mobile_trending,
      gridPosition: "md:col-span-1 md:row-span-2",
      category: "data",
      size: "tall",
    },
    {
      id: 7,
      title: "Saved Coins Panel",
      description:
        "User-saved coins persisted in Redux for quick access.",
      image: savedCoins,
      gridPosition: "md:col-span-1 md:row-span-1",
      category: "data",
      size: "tall",
    },
  ],

 keyFeatures: [
  {
    title: "Live Crypto Market Data",
    description:
      "Integrated public crypto APIs to fetch live prices, market changes, and trending coins with structured data presentation.",
    highlight: "API-Driven UI",
  },
  {
    title: "Debounced Search Experience",
    description:
      "Implemented debounced search suggestions to reduce unnecessary API calls and improve typing performance.",
    highlight: "Optimized Search",
  },
  {
    title: "Caching & Data Persistence",
    description:
      "Cached API responses and persisted selected data in local storage to ensure the app remains usable even during API rate limits.",
    highlight: "Reliable Data Access",
  },
  {
    title: "Data Visualization with Recharts",
    description:
      "Visualized coin price trends using Recharts to display clean, responsive mini line charts inside tables and modals.",
    highlight: "Interactive Charts",
  },
],



  techStack: {
    frontend: [
      { name: "Vite", version: "^6.2.0" },
      { name: "React", version: "^19.0.0" },
      { name: "Tailwind CSS", version: "^4.0.15" },
      { name: "Recharts", version: "^2.15.1" },
      { name: "Redux Toolkit", version: "^2.6.1" },
      { name: "React Router", version: "^7.4.0" },
      { name: "Axios", version: "^1.8.4" },
      { name: "Motion", version: "^12.6.3" },
      { name: "React Icons", version: "^5.5.0" },
    ],
  },

  challenges: [
  {
    title: "Handling Large API Responses",
    description:
      "Crypto APIs return large datasets, which required careful rendering and component optimization to maintain UI performance.",
    icon: RiSparkling2Line,
  },
  {
    title: "API Rate Limits & Access Denial",
    description:
      "Frequent requests to the public CoinGecko API caused temporary access denial, requiring caching and reduced refetching strategies.",
    icon: RiSparkling2Line,
  },
  {
    title: "Rendering Charts with Dynamic Data",
    description:
      "Integrating Recharts with frequently changing API data required handling loading states, empty values, and responsive resizing.",
    icon: ImDatabase,
  },
],



  developmentInfo: {
    type: "Personal Project",
    status: "Completed",
    focus: "UI, data visualization, frontend state management",
  },

  pages: [
    {
      name: "Home",
      description: "Coin table with search, sorting, and quick actions.",
      features: [
        "Coin table",
        "Search bar",
        "Save coin action",
        "Details modal",
      ],
    },
    {
      name: "Trending",
      description: "Lists trending movers with compact charts and links.",
      features: ["Trending list", "Mini charts"],
    },
    {
      name: "Saved Coins",
      description: "Shows user-saved coins with quick navigation to details.",
      features: ["Saved list", "Remove/save actions"],
    },
  ],

  learningOutcomes: [
  "Working with real-world public APIs and large datasets",
  "Understanding how API rate limits affect frontend applications",
  "Implementing caching strategies to reduce redundant API calls",
  "Using debounced search to improve UX and performance",
  "Building reusable UI components for data-heavy applications",
  "Learning data visualization fundamentals using Recharts",
],



  futureEnhancements: [
    "Add user authentication and cloud-synced favorites",
    "Improve caching and server-side aggregation for rate limits",
    "Add dark mode and theming support",
    "Convert to PWA for offline access and notifications",
  ],
};

export default cryptoTracker;