# Portfolio 2026 - Hooks, Functionality & Logic Binding Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [React Hooks Implementation](#react-hooks-implementation)
3. [State Management (Redux)](#state-management-redux)
4. [Animation Framework (Motion/Framer Motion)](#animation-framework)
5. [Dark Mode Implementation](#dark-mode-implementation)
6. [Toast Notification System](#toast-notification-system)
7. [Component Patterns](#component-patterns)
8. [Performance Optimizations](#performance-optimizations)

---

## 📌 Project Overview

**Tech Stack:**

- **Framework:** Next.js 16
- **UI Library:** React 19
- **State Management:** Redux Toolkit
- **Animation:** Motion (Framer Motion v12.26.2)
- **Styling:** Tailwind CSS v4
- **Icons:** React Icons v5.5.0
- **Email:** Nodemailer v7.0.12
- **Validation:** Zod v4.3.5

---

## 🎣 React Hooks Implementation

### 1. **useState** - State Management

#### **WorkExperience Component**

```javascript
// src/app/components/organisms/work-experience/WorkExperience.js
const [activeId, setActiveId] = useState(experiences[0].id);
```

**Purpose:** Manages which work experience item is currently active/selected.
**Binding:** Updates UI styling and displays corresponding content.

---

#### **Tech Stack Component**

```javascript
// src/app/components/organisms/techStacks/Tech.js
const [hoveredSkill, setHoveredSkill] = useState(null);
const [isDarkMode, setIsDarkMode] = useState(false);
const [isMobile, setIsMobile] = useState(false);
const [isMounted, setIsMounted] = useState(false);
```

**Purpose:**

- `hoveredSkill` - Tracks which tech skill is currently hovered
- `isDarkMode` - Local state mirror of Redux dark mode (for MutationObserver)
- `isMobile` - Responsive state tracking window size
- `isMounted` - Hydration fix (prevents SSR mismatch)

**Binding:**

```javascript
// Conditional rendering based on hover
const getHoveredSkillColor = () => {
  if (!hoveredSkill) return null;
  return isDarkMode
    ? hoveredSkill.darkGradientColor
    : hoveredSkill.gradientColor;
};
```

---

#### **Project Carousel Component**

```javascript
// src/app/components/organisms/projectCarousel/CarouselProjects.js
const [items, setItems] = useState(slideData);
const [previewCount, setPreviewCount] = useState(3);
const [isMobile, setIsMobile] = useState(false);
```

**Purpose:**

- `items` - Manages carousel slide order (rotates for infinite effect)
- `previewCount` - Number of preview items shown (responsive: 0 mobile, 2 tablet, 3 desktop)
- `isMobile` - Viewport detection

---

#### **GlowingCard Component**

```javascript
// src/app/components/molecules/cards/GlowingCard.js
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
const [isHovered, setIsHovered] = useState(false);
```

**Purpose:** Tracks cursor position for glow effect that follows mouse movement.

**Binding:**

```javascript
const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  setMousePosition({
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  });
};

// Used in motion div
<motion.div
  style={{
    left: mousePosition.x,
    top: mousePosition.y,
    background: `radial-gradient(circle, ${color}, transparent 40%)`,
  }}
/>;
```

---

#### **Navbar Component**

```javascript
// src/app/components/organisms/navbar/Navbar.js
const [isScrolled, setIsScrolled] = useState(false);
const [mounted, setMounted] = useState(false);
```

**Purpose:**

- `isScrolled` - Detects scroll position for navbar styling
- `mounted` - Hydration state (Next.js SSR fix)

---

#### **Contact Form**

```javascript
// src/app/components/organisms/ContactSection.js
const [copied, setCopied] = useState(false);
const [formData, setFormData] = useState({
  name: "",
  email: "",
  message: "",
  category: "freelance",
});
```

**Purpose:** Manages form input data and email copy state.

---

### 2. **useEffect** - Side Effects & Lifecycle

#### **ExperienceList - Auto-scroll on Mobile**

```javascript
// src/app/components/organisms/work-experience/ExperienceList.js
const containerRef = useRef(null);
const itemRefs = useRef({});

useEffect(() => {
  if (!containerRef.current || window.innerWidth >= 768) return;

  const activeItemRef = itemRefs.current[activeId];
  if (!activeItemRef) return;

  // Calculate smooth scroll to center active item
  const container = containerRef.current;
  const containerWidth = container.clientWidth;
  const itemWidth = activeItemRef.clientWidth;
  const itemLeft = activeItemRef.offsetLeft;

  const scrollTo = itemLeft - containerWidth / 2 + itemWidth / 2;

  container.scrollTo({
    left: scrollTo,
    behavior: "smooth",
  });
}, [activeId]); // Dependency: when activeId changes, scroll
```

**What it does:** Automatically scrolls horizontal mobile list to show active work experience item in center.

---

#### **Tech Component - Dark Mode Observer**

```javascript
// src/app/components/organisms/techStacks/Tech.js
useEffect(() => {
  setIsMounted(true);

  const checkDarkMode = () =>
    setIsDarkMode(document.documentElement.classList.contains("dark"));

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkDarkMode();
  checkMobile();

  // Monitor DOM class changes for dark mode
  const observer = new MutationObserver(checkDarkMode);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("resize", checkMobile);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", checkMobile);
  };
}, []);
```

**What it does:**

- Tracks when dark mode class is added/removed from `<html>` element
- Updates component state when theme changes
- Updates responsive state on window resize
- Cleans up listeners on unmount

---

#### **Toast Component - Auto-hide**

```javascript
// src/app/components/atoms/UI/toast/Toast.js
useEffect(() => {
  if (visible) {
    const timer = setTimeout(() => {
      dispatch(hideToast());
    }, 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }
}, [visible, dispatch]);
```

**What it does:** Automatically hides toast notification after 3 seconds when it becomes visible.

---

#### **Project Carousel - Window Resize Handling**

```javascript
// src/app/components/organisms/projectCarousel/CarouselProjects.js
useEffect(() => {
  const handleResize = () => {
    const width = window.innerWidth;
    setIsMobile(width < 768);

    // Responsive preview count
    if (width < 768) {
      setPreviewCount(0);
    } else if (width < 1024) {
      setPreviewCount(2);
    } else {
      setPreviewCount(3);
    }
  };

  handleResize(); // Call on mount
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

**What it does:** Updates carousel layout based on screen size. When window resizes, it adjusts how many preview cards show.

---

#### **Project Carousel - Auto-slide**

```javascript
useEffect(() => {
  startAutoSlide();
  return () => clearInterval(intervalRef.current);
}, [startAutoSlide]);
```

**What it does:** Starts automatic carousel rotation. Cleans up interval on unmount.

---

#### **Project Carousel - Page Visibility (Smart Pause)**

```javascript
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      clearInterval(intervalRef.current); // Pause when tab is hidden
    } else {
      startAutoSlide(); // Resume when tab is visible
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibility);
}, []);
```

**What it does:** Pauses carousel animation when user switches tabs. Resumes when they return. **Performance optimization!**

---

#### **Navbar - Optimized Scroll Detection**

```javascript
// src/app/components/organisms/navbar/Navbar.js
useEffect(() => {
  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);
```

**What it does:**

- Detects when user scrolls more than 400px down the page
- Uses `requestAnimationFrame` to throttle scroll events (better performance)
- Updates navbar styling (transform, size, border-radius)

---

#### **Ticker Tech - Mount Animation**

```javascript
// src/app/components/organisms/tickerTech/TickerTrack.js
useEffect(() => {
  const t = setTimeout(() => setIsMounted(true), 0);
  return () => clearTimeout(t);
}, []);
```

**What it does:** Delays mounted state to next tick. Prevents hydration mismatch in Next.js.

---

#### **Ticker Tech - Infinite Scroll Animation**

```javascript
useEffect(() => {
  if (!isMounted) return;

  const scroller = scrollerRef.current;
  if (!scroller || !scroller.firstChild) return;

  // Calculate card width
  const cardStyle = window.getComputedStyle(scroller.firstChild);
  const cardWidth =
    scroller.firstChild.offsetWidth +
    parseFloat(cardStyle.marginLeft) +
    parseFloat(cardStyle.marginRight);

  scroller.style.width = `${cardWidth * techTickerItems.length * TRIPLET_COPIES}px`;

  let animationId;
  let scrollPosition = 0;
  const speed = 0.3;
  const singleSetWidth = cardWidth * techTickerItems.length;

  scrollPosition = -singleSetWidth;

  const animate = () => {
    scrollPosition -= speed;

    // Seamless reset
    if (Math.abs(scrollPosition) >= singleSetWidth * 2) {
      scrollPosition = -singleSetWidth;
    }

    scroller.style.transform = `translateX(${scrollPosition}px)`;
    animationId = requestAnimationFrame(animate);
  };

  const startDelay = setTimeout(() => {
    scroller.style.transform = `translateX(${scrollPosition}px)`;
    animationId = requestAnimationFrame(animate);
  }, 100);

  return () => {
    clearTimeout(startDelay);
    cancelAnimationFrame(animationId);
  };
}, [isMounted]);
```

**What it does:** Creates infinite scrolling ticker animation using:

- `requestAnimationFrame` for smooth 60fps animation
- Smart position reset for seamless looping
- Dynamic width calculation based on card dimensions

---

#### **Navbar - Hydration Fix**

```javascript
useEffect(() => {
  setMounted(true);
}, []);
```

**What it does:** Waits for client-side hydration before rendering. Prevents hydration mismatch errors.

---

#### **SideMenu - Escape Key Handler**

```javascript
// src/app/components/molecules/menu/SideMenu.js
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === "Escape" && isSidebarOpen) {
      dispatch(closeSidebar());
    }
  };

  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape);
}, [isSidebarOpen, dispatch]);
```

**What it does:** Closes mobile sidebar when user presses ESC key. Better UX!

---

#### **Navbar - Prevent Background Scroll**

```javascript
useEffect(() => {
  if (!mounted) return;
  document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
}, [isSidebarOpen, mounted]);
```

**What it does:** Locks background scroll when sidebar is open, preventing weird scrolling behavior.

---

### 3. **useRef** - DOM Access & Persistent Values

#### **ExperienceList - Item Tracking**

```javascript
// src/app/components/organisms/work-experience/ExperienceList.js
const containerRef = useRef(null);
const itemRefs = useRef({});

// Later, ref assignment
<motion.div
  ref={(el) => (itemRefs.current[exp.id] = el)}
  // ...
>
```

**Purpose:** Stores references to DOM elements without causing re-renders. Used to calculate scroll positions.

---

#### **Project Carousel - Interval Reference**

```javascript
// src/app/components/organisms/projectCarousel/CarouselProjects.js
const intervalRef = useRef(null);

const startAutoSlide = useCallback(() => {
  intervalRef.current = setInterval(() => {
    nextSlide();
  }, 14000); // Auto-advance every 14 seconds
}, [nextSlide]);

const resetAutoSlide = useCallback(() => {
  clearInterval(intervalRef.current);
  startAutoSlide();
}, [startAutoSlide]);
```

**Purpose:** Keeps reference to interval ID so it can be cleared and reset without state updates.

---

#### **Ticker Tech - Scroller Reference**

```javascript
// src/app/components/organisms/tickerTech/TickerTrack.js
const scrollerRef = useRef(null);

// Used to manipulate DOM
scroller.style.width = `${cardWidth * techTickerItems.length * TRIPLET_COPIES}px`;
scroller.style.transform = `translateX(${scrollPosition}px)`;
```

**Purpose:** Direct DOM manipulation for smooth animations without React re-renders.

---

#### **Dark Mode Reminder - Timer Tracking**

```javascript
// src/app/hooks/useDarkModeReminder.js
const hasShownInitialToast = useRef(false);
const timers = useRef([]);

// Track which toast has been shown (doesn't trigger re-renders)
if (!hasShownInitialToast.current) {
  dispatch(showToast(messages[0]));
  hasShownInitialToast.current = true;
}

// Store multiple timer IDs
[90000, 180000].forEach((delay, i) => {
  const timer = setTimeout(() => {
    dispatch(showToast(messages[i + 1]));
  }, delay);
  timers.current.push(timer);
});

// Cleanup
return () => {
  timers.current.forEach(clearTimeout);
  timers.current = [];
};
```

**Purpose:** Persist state between renders without triggering re-renders. Perfect for tracking if toast was shown!

---

### 4. **useCallback** - Memoized Functions

#### **Project Carousel - Slide Navigation**

```javascript
// src/app/components/organisms/projectCarousel/CarouselProjects.js
const nextSlide = useCallback(() => {
  setItems((prev) => {
    const newArray = [...prev];
    const first = newArray.shift(); // Remove first
    return [...newArray, first]; // Add to end (rotate)
  });
}, []);

const prevSlide = useCallback(() => {
  setItems((prev) => {
    const newArray = [...prev];
    const last = newArray.pop(); // Remove last
    return [last, ...newArray]; // Add to start
  });
}, []);

const startAutoSlide = useCallback(() => {
  intervalRef.current = setInterval(() => {
    nextSlide();
  }, 14000);
}, [nextSlide]);

const resetAutoSlide = useCallback(() => {
  clearInterval(intervalRef.current);
  startAutoSlide();
}, [startAutoSlide]);
```

**Purpose:** Prevents function recreation on every render. Prevents infinite loops when passed as dependency.

---

## 🏪 State Management (Redux)

### Store Structure

```javascript
// src/app/redux/store.js
export const store = configureStore({
  reducer: {
    theme: themeReducer, // Dark mode state
    ui: uiReducer, // UI state (sidebar open/close)
    toast: toastReducer, // Toast notifications
  },
});
```

---

### 1. **Theme Slice** - Dark Mode Management

```javascript
// src/app/redux/featuresSlice/themeSlice.js
const initialState = {
  DarkMode: false,
  ready: false, // Hydration flag
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.DarkMode = !state.DarkMode;
    },
    setDarkMode: (state, action) => {
      state.DarkMode = action.payload;
      state.ready = true; // Hydration complete
    },
  },
});
```

**Usage Pattern:**

```javascript
// src/app/hooks/useDarkMode.js
const useDarkMode = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.DarkMode);

  // Sync Redux with DOM on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    dispatch(setDarkMode(isDark));
  }, [dispatch]);

  const toggleMode = () => {
    dispatch(toggleDarkMode());
    const next = !isDarkMode;

    // Update DOM directly
    document.documentElement.classList.toggle("dark", next);

    // Persist to localStorage
    localStorage.setItem("dark", next.toString());
  };

  return { isDarkMode, toggleMode };
};
```

**Dark Mode Flow:**

1. User clicks theme toggle
2. `toggleMode()` called
3. Redux state updated via `dispatch(toggleDarkMode())`
4. DOM `<html>` element class updated
5. localStorage saved for persistence
6. All components subscribed to Redux re-render with new `isDarkMode` value
7. CSS classes dynamically applied (dark: prefix in Tailwind)

---

### 2. **Toast Slice** - Notification System

```javascript
// src/app/redux/featuresSlice/toastSlice.js
const initialState = {
  visible: false,
  message: "",
  iconType: null, // 'moon', 'star', 'eye'
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.visible = true;
      state.message = action.payload.text;
      state.iconType = action.payload.iconType;
    },
    hideToast: (state) => {
      state.visible = false;
      state.message = "";
      state.iconType = null;
    },
  },
});
```

---

### 3. **UI Slice** - Sidebar State

```javascript
// src/app/redux/featuresSlice/UISlice.js (inferred)
// Manages:
// - isSidebarOpen: boolean
// - Other UI flags
```

**Usage:**

```javascript
// src/app/components/organisms/navbar/Navbar.js
const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);
```

---

## 🎨 Animation Framework

### Motion Library (Framer Motion v12)

The project uses `motion` package (Framer Motion) for smooth animations.

---

### 1. **Toast Animation Pattern**

```javascript
// src/app/components/atoms/UI/toast/Toast.js
<motion.div
  initial={{
    opacity: 0,
    y: -40,
    scale: 0.9
  }}
  animate={{
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 1
    }
  }}
  exit={{
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }}
>
```

**Breakdown:**

- `initial` - Starting state (hidden, up, small)
- `animate` - Final state (visible, in place, full size)
- `exit` - When removed (fading up)
- `transition` - Spring physics for bouncy feel
- Used inside `<AnimatePresence>` for exit animations

---

### 2. **Work Experience Card Animation**

```javascript
// src/app/components/organisms/work-experience/ExperienceCard.js
<motion.div
  initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
  transition={{ duration: 0.5 }}
>
```

**Binding with state change:**

```javascript
<AnimatePresence mode="wait">
  <motion.p
    key={activeTab}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
  >
    {content}
  </motion.p>
</AnimatePresence>
```

**When `activeTab` changes:**

1. Current motion.p with `exit` animation fades & slides up
2. AnimatePresence waits for exit to complete
3. New motion.p renders with `initial` → `animate` (fade in, slide down)

---

### 3. **Experience List - Hover Animation**

```javascript
// src/app/components/organisms/work-experience/ExperienceList.js
<motion.div
  whileHover={{ x: isActive ? 0 : 4 }}
  transition={{ duration: 0.25, ease: "easeOut" }}
>
```

**Effect:** Inactive items slide 4px right on hover (active items don't move).

---

### 4. **Mobile Sidebar Animation**

```javascript
// src/app/components/molecules/menu/SideMenu.js
<AnimatePresence>
  {isSidebarOpen && (
    <>
      {/* Backdrop fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-black/40 backdrop-blur-sm"
      />

      {/* Sidebar slide-in */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
      >
```

**Flow:**

- When `isSidebarOpen` is true, sidebar slides in from right
- Backdrop fades in simultaneously
- When false, both animate out

---

### 5. **Glow Card - Cursor Tracking**

```javascript
// src/app/components/molecules/cards/GlowingCard.js
<motion.div
  className="radial-gradient"
  style={{
    left: mousePosition.x,
    top: mousePosition.y,
    background: `radial-gradient(circle, ${color}, transparent 40%)`,
  }}
  initial={{ opacity: 0 }}
  animate={{ opacity: isHovered ? 1 : 0 }}
  transition={{ duration: 0.5 }}
/>
```

**Effect:**

- Glowing circle follows cursor
- Fade in/out on hover
- Smooth opacity transition

---

### 6. **Carousel Slide Navigation**

```javascript
// No explicit motion used - state management handles it
// Items array rotates, Motion components inside re-render
<DesktopSlideItem
  item={item}
  isMain={index === 0}
  // Motion animations inside this component
/>
```

---

### 7. **Tech Stack - Blur Backdrop**

```javascript
// src/app/components/organisms/techStacks/Tech.js
<AnimatePresence>
  {hoveredSkill && !isMobile && skillColor && (
    <motion.div
      key="blur-backdrop"
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(3px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        background: isDarkMode
          ? `linear-gradient(135deg, ${skillColor}05 0%, rgba(0, 0, 0, 0.3) 100%)`
          : `linear-gradient(135deg, ${skillColor}08 0%, rgba(255, 255, 255, 0.3) 100%)`,
      }}
    />
  )}
</AnimatePresence>
```

**Effect:** When skill is hovered, background blurs and tints with skill's color.

---

### 8. **Navbar Transform Animation**

```javascript
// src/app/components/organisms/navbar/Navbar.js
<motion.nav
  initial={false}
  animate={{
    width: isScrolled ? "95%" : "100%",
    height: isScrolled ? "55px" : "64px",
    top: isScrolled ? "2%" : "0",
    left: "50%",
    translateX: "-50%",
    borderRadius: isScrolled ? "999px" : "0px",
  }}
  transition={{ duration: 0.4, ease: "easeInOut" }}
>
```

**Effect:** When scrolled >400px:

- Width changes from full to 95%
- Height changes from 64px to 55px
- Position moves down 2%
- Border radius becomes rounded (999px)
- All smooth with 0.4s duration

---

## 🌓 Dark Mode Implementation

### **Complete Dark Mode Flow**

```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks Theme Toggle Button                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. toggleMode() hook called                             │
│    - dispatch(toggleDarkMode())                         │
│    - Update Redux state                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. DOM Updated                                          │
│    - document.documentElement.classList.toggle("dark")  │
│    - <html class="dark">                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Persistence                                          │
│    - localStorage.setItem("dark", "true")               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Tech Component Observer Detects Change               │
│    - MutationObserver triggers on class change          │
│    - setIsDarkMode(true/false)                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. All Components Re-render                             │
│    - useSelector(state.theme.DarkMode)                 │
│    - Tailwind dark: classes apply                       │
│    - CSS variables update                               │
└─────────────────────────────────────────────────────────┘
```

---

### **Dark Mode Color Binding Example**

#### Light Mode Colors (CSS Variables):

```css
--grad-primary: #00aaff;
--grad-secondary: #00ff88;
```

#### Dark Mode Colors (CSS Variables):

```css
--darkgrad-primary: #00ddff;
--darkgrad-secondary: #00ffaa;
```

#### Component Usage:

```javascript
// Toast Component
const cardBgColor = isDarkMode
  ? "var(--darkgrad-primary)"
  : "var(--grad-primary)";

// Or Tailwind Classes
<div className={`${isDarkMode ? 'dark:bg-darkgrad-primary' : 'bg-grad-primary'}`}>
```

#### Light Mode Toast:

```
┌─────────────────────────────────┐
│ 📨 Email copied to clipboard    │
│ ─────────────────────────────── │ ← Blue gradient border
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Progress bar
└─────────────────────────────────┘
```

#### Dark Mode Toast:

```
┌─────────────────────────────────┐
│ ✨ Dark mode = less strain      │ ← Different text color
│ ─────────────────────────────── │ ← Cyan gradient border
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Progress bar (cyan)
└─────────────────────────────────┘
```

---

### **Dark Mode Reminder Hook**

```javascript
// src/app/hooks/useDarkModeReminder.js
export default function useDarkModeReminder() {
  const dispatch = useDispatch();
  const { DarkMode: isDarkMode, ready } = useSelector((state) => state.theme);

  const hasShownInitialToast = useRef(false);
  const timers = useRef([]);

  useEffect(() => {
    // ❌ Do NOTHING until theme is synced
    if (!ready) return;

    // ❌ Dark mode → never show toast
    if (isDarkMode) {
      hasShownInitialToast.current = false;
      return;
    }

    // ✅ Light mode → show toasts
    const messages = [
      { iconType: "moon", text: "Please switch to dark mode !!" },
      { iconType: "star", text: "Switch to dark for a better experience." },
      { iconType: "eye", text: "Dark mode = less strain, more vibes." },
    ];

    if (!hasShownInitialToast.current) {
      dispatch(showToast(messages[0])); // Immediate
      hasShownInitialToast.current = true;

      [90000, 180000].forEach((delay, i) => {
        const timer = setTimeout(() => {
          dispatch(showToast(messages[i + 1])); // After 1.5min, 3min
        }, delay);
        timers.current.push(timer);
      });
    }

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [isDarkMode, ready, dispatch]);
}
```

**Key Points:**

- Only shows toasts in **light mode**
- Waits for theme to be `ready` (hydration)
- Shows 3 different messages at intervals (0s, 90s, 180s)
- Cleans up timers on cleanup
- `hasShownInitialToast` prevents showing multiple times

---

## 🍞 Toast Notification System

### **Toast Architecture**

```
┌──────────────────────────────────────────┐
│ User Action (form submit, copy email)   │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ dispatch(showToast({                     │
│   text: "Email copied",                  │
│   iconType: "star"                       │
│ }))                                      │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Redux State Updated                      │
│ { visible: true, message, iconType }    │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Toast Component Re-renders               │
│ <AnimatePresence>                        │
│   {visible && <motion.div>...</>}        │
│ </AnimatePresence>                       │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Animation & useEffect                    │
│ - Spring animation (enter)               │
│ - setTimeout 3s                          │
│ - dispatch(hideToast())                  │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Exit Animation & Redux Update            │
│ { visible: false }                       │
└──────────────────────────────────────────┘
```

---

### **Toast Usage Examples**

#### **Example 1: Email Copy (ContactSection)**

```javascript
const handleCopyEmail = async () => {
  try {
    // 1️⃣ Copy to clipboard
    await navigator.clipboard.writeText(email);

    // 2️⃣ Show toast
    dispatch(
      showToast({
        text: `Email copied to clipboard`,
        iconType: "star",
      }),
    );

    // 3️⃣ Update UI
    setCopied(true);

    // 4️⃣ Open Gmail after delay
    setTimeout(() => {
      setCopied(false);
    }, 1500);

    setTimeout(() => {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`,
        "_blank",
        "noopener,noreferrer",
      );
    }, 900);
  } catch (error) {
    dispatch(
      showToast({
        text: "Failed to copy email",
        iconType: "eye",
      }),
    );
  }
};
```

**Timeline:**

- 0ms: Copy email → Show toast
- 900ms: Open Gmail
- 1500ms: Hide copy icon

---

#### **Example 2: Dark Mode Reminders (useDarkModeReminder)**

```javascript
// Light mode detected
dispatch(
  showToast({
    iconType: "moon",
    text: "Please switch to dark mode !!",
  }),
);

// After 90 seconds
dispatch(
  showToast({
    iconType: "star",
    text: "Switch to dark for a better experience.",
  }),
);

// After 180 seconds (3 minutes)
dispatch(
  showToast({
    iconType: "eye",
    text: "Dark mode = less strain, more vibes.",
  }),
);
```

---

### **Toast Component - Full Breakdown**

```javascript
// src/app/components/atoms/UI/toast/Toast.js

// 1. Get Redux state
const { visible, message, iconType } = useSelector((state) => state.toast);

// 2. Get dark mode from hook
const { isDarkMode } = useDarkMode();

// 3. Icon mapping
const getIconComponent = (type) => {
  switch (type) {
    case "moon":
      return <GiMoon className="inline mr-2" />;
    case "star":
      return <WiStars className="inline mr-2" />;
    case "eye":
      return <PiEyesFill className="inline mr-2" />;
    default:
      return null;
  }
};

// 4. Auto-hide after 3 seconds
useEffect(() => {
  if (visible) {
    const timer = setTimeout(() => {
      dispatch(hideToast());
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [visible, dispatch]);

// 5. Render with animations
return (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 500 },
        }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed md:top-[11%] md:right-4 top-[10%] right-0 z-9999"
      >
        {/* Content */}
        <p
          className={
            isDarkMode ? "dark:text-darkgrad-primary" : "text-grad-primary"
          }
        >
          {getIconComponent(iconType)}
          {message}
        </p>

        {/* Progress bar */}
        <motion.div
          className="h-1 bg-gradient-to-r from-grad-primary to-grad-secondary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
        />
      </motion.div>
    )}
  </AnimatePresence>
);
```

---

## 🧩 Component Patterns

### **Pattern 1: State + useEffect + Redux Dispatch**

```javascript
const [hoveredSkill, setHoveredSkill] = useState(null);
const { isDarkMode } = useDarkMode(); // Hook → Redux
const dispatch = useDispatch();

useEffect(() => {
  // Side effect when state changes
  if (hoveredSkill) {
    dispatch(someAction(hoveredSkill));
  }
}, [hoveredSkill, dispatch]);
```

---

### **Pattern 2: useRef for DOM Imperatives**

```javascript
const scrollerRef = useRef(null);

useEffect(() => {
  // Direct DOM manipulation
  scrollerRef.current.style.transform = `translateX(${position}px)`;
}, []);

return <div ref={scrollerRef}>{/* content */}</div>;
```

---

### **Pattern 3: useCallback + useEffect + useRef**

```javascript
const intervalRef = useRef(null);

const startAutoSlide = useCallback(() => {
  intervalRef.current = setInterval(() => {
    nextSlide();
  }, 14000);
}, [nextSlide]);

useEffect(() => {
  startAutoSlide();
  return () => clearInterval(intervalRef.current);
}, [startAutoSlide]);
```

---

### **Pattern 4: Mobile Responsive with useState**

```javascript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  handleResize();
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

if (isMobile) {
  return <MobileComponent />;
} else {
  return <DesktopComponent />;
}
```

---

### **Pattern 5: Redux Selector + Hook Abstraction**

```javascript
// Custom hook
const useDarkMode = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.DarkMode);

  const toggleMode = () => {
    dispatch(toggleDarkMode());
    // Side effects
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("dark", (!isDarkMode).toString());
  };

  return { isDarkMode, toggleMode };
};

// Used in component
const { isDarkMode, toggleMode } = useDarkMode();
```

---

### **Pattern 6: Motion + Conditional Rendering**

```javascript
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

---

## ⚡ Performance Optimizations

### **1. requestAnimationFrame for Scroll Events**

```javascript
// ❌ Bad: Triggers many times per second
window.addEventListener("scroll", () => {
  setIsScrolled(window.scrollY > 400);
});

// ✅ Good: Throttles to 60fps
let ticking = false;
const onScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      setIsScrolled(window.scrollY > 400);
      ticking = false;
    });
    ticking = true;
  }
};
window.addEventListener("scroll", onScroll);
```

---

### **2. Page Visibility API for Carousel**

```javascript
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      clearInterval(intervalRef.current); // Pause when tab is hidden
    } else {
      startAutoSlide(); // Resume when tab is visible
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibility);
}, []);
```

**Benefit:** Stops animation when user isn't looking at page (saves CPU/battery).

---

### **3. Memoized Callbacks**

```javascript
// Without useCallback: Function recreated every render
const nextSlide = () => {
  /* ... */
};

// With useCallback: Same function reference (unless deps change)
const nextSlide = useCallback(() => {
  /* ... */
}, []);
```

**Benefit:** Prevents unnecessary re-renders when passing to child components.

---

### **4. requestAnimationFrame for Smooth Animations**

```javascript
const animate = () => {
  scrollPosition -= speed;
  scroller.style.transform = `translateX(${scrollPosition}px)`;
  animationId = requestAnimationFrame(animate);
};
animationId = requestAnimationFrame(animate);
```

**Benefit:** Smooth 60fps animations synchronized with browser refresh rate.

---

### **5. will-change CSS Property**

```javascript
<div ref={scrollerRef} className="flex will-change-transform">
  {/* Content */}
</div>
```

**Benefit:** Hints browser to GPU-accelerate the transform animations.

---

### **6. MutationObserver for Dark Mode**

```javascript
const observer = new MutationObserver(() => {
  setIsDarkMode(document.documentElement.classList.contains("dark"));
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
```

**Benefit:** Responds to theme changes without polling every render.

---

### **7. Hydration State Management**

```javascript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) {
  return <SkeletonLoader />; // Server matches this, then updates
}
```

**Benefit:** Prevents hydration mismatch errors in Next.js.

---

### **8. Cleanup in useEffect**

```javascript
useEffect(() => {
  const listener = () => {
    /* ... */
  };
  window.addEventListener("scroll", listener);

  // Cleanup prevents memory leaks
  return () => window.removeEventListener("scroll", listener);
}, []);
```

**Benefit:** Prevents multiple listeners, memory leaks, and stale closures.

---

## 📊 Data Flow Summary

### **Dark Mode Data Flow**

```
[Theme Toggle Button]
  → useDarkMode hook
  → dispatch(toggleDarkMode())
  → Redux store updates
  → document.documentElement class updated
  → useSelector updates in all subscribed components
  → CSS dark: classes apply
  → MutationObserver detects change
  → Local state updates
```

### **Toast Notification Flow**

```
[User Action]
  → dispatch(showToast({text, iconType}))
  → Redux state updated
  → Toast component re-renders
  → Motion animation plays
  → useEffect timer starts
  → After 3s dispatch(hideToast())
  → Exit animation plays
```

### **Carousel Rotation Flow**

```
[Component Mounts]
  → useEffect startAutoSlide()
  → interval saves to ref
  → every 14s nextSlide() called
  → items state rotates
  → new slides render
  → if user interacts: resetAutoSlide()
  → if tab hidden: clear interval
  → on unmount: clear interval
```

### **Responsive Layout Flow**

```
[Window Resize]
  → handleResize() called
  → setIsMobile/setPreviewCount
  → Component re-renders with new layout
  → CSS media queries apply
  → Motion animations adjust
```

---

## 🎯 Key Takeaways

| Concept                   | Purpose                     | Example                                               |
| ------------------------- | --------------------------- | ----------------------------------------------------- |
| **useState**              | Track component state       | `activeId`, `formData`, `isHovered`                   |
| **useEffect**             | Side effects & lifecycle    | Scroll events, auto-animations, cleanup               |
| **useRef**                | Persist values & DOM access | Interval IDs, element refs, form refs                 |
| **useCallback**           | Memoize functions           | `nextSlide()`, `startAutoSlide()`                     |
| **useSelector**           | Read Redux state            | `isDarkMode`, `isSidebarOpen`, toast data             |
| **useDispatch**           | Dispatch Redux actions      | `dispatch(showToast())`, `dispatch(toggleDarkMode())` |
| **motion**                | Smooth animations           | Enter/exit, hover effects, scroll animations          |
| **AnimatePresence**       | Exit animations             | Toast notifications, sidebar animations               |
| **MutationObserver**      | DOM change detection        | Dark mode class changes                               |
| **requestAnimationFrame** | Smooth 60fps animation      | Scroll detection, ticker animation                    |
| **localStorage**          | Persistent storage          | Dark mode preference                                  |

---

## 🔗 Related Files

- Dark Mode: `src/app/hooks/useDarkMode.js`, `src/app/redux/featuresSlice/themeSlice.js`
- Toast: `src/app/components/atoms/UI/toast/Toast.js`, `src/app/redux/featuresSlice/toastSlice.js`
- Carousel: `src/app/components/organisms/projectCarousel/CarouselProjects.js`
- Work Experience: `src/app/components/organisms/work-experience/`
- Tech Stack: `src/app/components/organisms/techStacks/Tech.js`
- Navbar: `src/app/components/organisms/navbar/Navbar.js`
- Sidebar: `src/app/components/molecules/menu/SideMenu.js`

---

**Created:** January 2026  
**Framework:** Next.js 16 + React 19 + Redux + Motion  
**Purpose:** Complete documentation of hooks, state management, and animations
