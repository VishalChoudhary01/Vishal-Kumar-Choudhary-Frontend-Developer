import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getLabsHeroActions, LABS_COLLECTION_ANCHOR } from "../src/app/lib/labs/hero-cta.mjs";

const componentSource = await readFile(
  new URL("../src/app/components/labs/LabsIntroduction.js", import.meta.url),
  "utf8",
);
const pageSource = await readFile(
  new URL("../src/app/labs/page.js", import.meta.url),
  "utf8",
);
const artworkSource = await readFile(
  new URL("../src/app/components/labs/landing/LabsHeroArtwork.js", import.meta.url),
  "utf8",
);
const staticArtworkSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/StaticParticleSphereArtwork.js", import.meta.url),
  "utf8",
);
const particleRendererSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/LabsParticleSphere.js", import.meta.url),
  "utf8",
);
const orbitSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-orbits.js", import.meta.url),
  "utf8",
);

test("guest hero actions offer account creation and sign in with a Labs return destination", () => {
  assert.deepEqual(getLabsHeroActions({ authState: "guest" }), [
    {
      label: "Create account",
      href: "/labs/signup?returnTo=%2Flabs",
      variant: "primary",
    },
    {
      label: "Sign in",
      href: "/labs/login?returnTo=%2Flabs",
      variant: "secondary",
    },
  ]);
});

test("signed-in unverified users are prompted to verify, not to sign in or register", () => {
  const actions = getLabsHeroActions({ authState: "unverified" });

  assert.deepEqual(actions.map(({ label }) => label), [
    "Verify email",
    "Explore experiments",
  ]);
  assert.equal(actions[0].href, "/labs/verify-email?returnTo=%2Flabs");
  assert.equal(actions[1].href, LABS_COLLECTION_ANCHOR);
});

test("verified users get discovery actions and only a safe internal featured link", () => {
  const actions = getLabsHeroActions({
    authState: "verified",
    featuredHref: "/labs/magnetic-interaction",
  });

  assert.deepEqual(actions.map(({ label }) => label), [
    "Explore experiments",
    "Explore featured experiment",
  ]);
  assert.equal(actions[1].href, "/labs/magnetic-interaction");

  const unsafeActions = getLabsHeroActions({
    authState: "verified",
    featuredHref: "https://example.com",
  });
  assert.equal(unsafeActions.length, 1);
});

test("unknown auth state is neutral and never exposes guest auth actions", () => {
  const actions = getLabsHeroActions({ authState: "unknown" });

  assert.deepEqual(actions, [
    {
      label: "Explore experiments",
      href: LABS_COLLECTION_ANCHOR,
      variant: "primary",
    },
  ]);
});

test("hero stats use an in-view one-time MotionValue animation and reduced-motion fallback", () => {
  assert.match(componentSource, /useInView\(statRef, \{ once: true/);
  assert.match(componentSource, /useMotionValue\(value\)/);
  assert.match(componentSource, /useTransform\(count/);
  assert.match(componentSource, /animate\(count, value/);
  assert.match(componentSource, /prefersReducedMotion \|\| value <= 0/);
});

test("Labs route resolves authentication on the server and treats unavailable auth as unknown", () => {
  assert.match(pageSource, /getCurrentAuthSession/);
  assert.match(pageSource, /isAuthRuntimeConfigured/);
  assert.match(pageSource, /authState = "unknown"/);
  assert.match(pageSource, /session\.user\.emailVerified === true \? "verified" : "unverified"/);
});

test("hero artwork is decorative, lazy-loads Three.js and respects reduced motion", () => {
  assert.match(artworkSource, /aria-hidden="true"/);
  assert.match(artworkSource, /useReducedMotion/);
  assert.match(artworkSource, /dynamic\(/);
  assert.match(artworkSource, /ssr:\s*false/);
  assert.match(artworkSource, /<LabsParticleSphere\s+onRendererStateChange=\{handleRendererStateChange\}\s*\/>/);
  assert.match(artworkSource, /!reducedMotion\s*&&\s*isInView/);
  assert.match(artworkSource, /webglReady/);
  assert.match(artworkSource, /loading:\s*\(\)\s*=>\s*null/);
  assert.match(staticArtworkSource, /getParticleCameraDistance/);
  assert.match(staticArtworkSource, /ResizeObserver/);
  assert.match(particleRendererSource, /hasReportedFirstFrame/);
  assert.match(particleRendererSource, /onRendererStateChangeRef/);
  assert.match(particleRendererSource, /style\.opacity = "0"/);
  assert.match(staticArtworkSource, /data-static-particle-sphere=""/);
  assert.ok(staticArtworkSource.includes("dark:bg-[radial-gradient"));
  assert.ok(staticArtworkSource.includes("rgba(52,143,131,0.08)"));
  assert.ok(staticArtworkSource.includes("rgba(52,143,131,0.045)"));
  assert.ok(staticArtworkSource.includes("dark:border-[#8ce8dc]/12"));
  assert.ok(staticArtworkSource.includes("dark:fill-[#fbfffe]"));
  assert.ok(staticArtworkSource.includes("dark:fill-[#edfffb]"));
  assert.ok(staticArtworkSource.includes("fill-[#0b5548]"));
  assert.ok(staticArtworkSource.includes("fill-[#0d5d53] dark:fill-[#4eaaa2]"));
  assert.ok(staticArtworkSource.includes("w-[40%]"));
  assert.ok(staticArtworkSource.includes("circle_at_50%_50%"));
  assert.ok(!staticArtworkSource.includes("circle_at_38%_32%"));
  assert.ok(staticArtworkSource.includes("fill-[#0a8a7c]"));
  assert.ok(staticArtworkSource.includes("fill-[#0b5148] dark:fill-[#75dcd1]"));
  assert.ok(staticArtworkSource.includes("depthBrightness = 0.84 + normalizedDepth * 0.28"));
  assert.ok(staticArtworkSource.includes("baseOpacity * depthBrightness"));
  assert.ok(staticArtworkSource.includes("0.72 + seed * 0.18"));
  assert.ok(staticArtworkSource.includes("const surfaceRadius = (0.28 + data.sizes[index] * 0.22) * 1.15"));
  assert.ok(staticArtworkSource.includes("dark:opacity-[0.98]"));
  assert.ok(staticArtworkSource.includes("dark:fill-[#ccfff7]"));
  assert.ok(staticArtworkSource.includes("particle.radius * 2.8"));
  assert.ok(staticArtworkSource.includes("particle.bright ? ("));
  assert.ok(staticArtworkSource.includes("L ${particle.x + particle.radius * 2.8}"));
  assert.ok(staticArtworkSource.includes('inner: isInner'));
});

test("initial artwork reuses the particle sphere and shows its translucent center shell", () => {
  assert.match(artworkSource, /StaticParticleSphereArtwork/);
  assert.match(staticArtworkSource, /createSphereParticleData/);
  assert.match(staticArtworkSource, /particles\.map/);
  assert.match(staticArtworkSource, /orbits\.map/);
  assert.match(staticArtworkSource, /<svg/);
  assert.match(orbitSource, /export const ORBIT_SPECS/);
  assert.ok(staticArtworkSource.includes("dark:bg-[radial-gradient"));
  assert.ok(staticArtworkSource.includes("rounded-full border"));
  assert.ok(staticArtworkSource.includes("dark:bg-[radial-gradient"));
  assert.match(staticArtworkSource, /data-static-particle-sphere=""/);
});

test("hero artwork is visible at rest, fills its grid column and animates slowly", () => {
  assert.ok(componentSource.includes("lg:min-h-[calc(100svh-78px)]"));
  assert.ok(componentSource.includes("lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]"));
  assert.ok(componentSource.includes("min-w-0 w-full lg:justify-self-stretch"));
  assert.ok(artworkSource.includes("aspect-[1.08/1]"));
  assert.ok(artworkSource.includes("max-w-[39rem]"));
  assert.ok(artworkSource.includes("useInView"));
  assert.ok(artworkSource.includes("margin: \"140px 0px\""));
  assert.doesNotMatch(artworkSource, /Interaction field|VKr \/ Labs|Explore · Build · Refine|Creative systems/);
});

test("Labs hero typography and container scale from mobile through desktop", () => {
  assert.ok(componentSource.includes("px-4 pb-9 pt-[calc(60px+1.75rem)]"));
  assert.ok(componentSource.includes("text-[clamp(2.55rem,8vw,3.25rem)]"));
  assert.ok(componentSource.includes("sm:text-[clamp(3.2rem,6.2vw,6.35rem)]"));
  assert.ok(componentSource.includes("text-[13px] leading-6"));
});


test("portfolio hero uses the shared Project CTA treatment for Labs across all motion modes", async () => {
  const [cinematicHero, mobileIntro, reducedMotionHero, sharedButton] = await Promise.all([
    readFile(new URL("../src/app/components/sections/hero_comp/CinematicHero.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/sections/hero_comp/MobileIntro.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/sections/hero_comp/ReducedMotionHero.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/common/ProjectResumeButton.js", import.meta.url), "utf8"),
  ]);

  for (const source of [cinematicHero, mobileIntro, reducedMotionHero]) {
    assert.ok(source.includes('import ProjectResumeButton from "@/app/components/common/ProjectResumeButton";'));
    assert.ok(source.includes('import { FlaskConicalIcon } from "@/app/components/common/FlaskConicalIcon";'));
    assert.ok(source.includes('<ProjectResumeButton href="/labs" label="Explore Labs" icon={FlaskConicalIcon} animateIconOnHover />'));
    assert.doesNotMatch(source, /ExploreLabsButton/);
  }

  assert.ok(sharedButton.includes("icon: Icon = ArrowUpRight"));
  assert.ok(sharedButton.includes("rounded-full"));
  assert.ok(sharedButton.includes("tone.circle"));
  assert.ok(sharedButton.includes("circleVariants"));
  assert.ok(sharedButton.includes("useReducedMotion"));
});

test("FlaskConical icon animation is controlled by the complete hero button hover and focus", async () => {
  const [buttonSource, iconSource] = await Promise.all([
    readFile(new URL("../src/app/components/common/ProjectResumeButton.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/common/FlaskConicalIcon.js", import.meta.url), "utf8"),
  ]);

  assert.ok(buttonSource.includes("animateIconOnHover = false"));
  assert.ok(buttonSource.includes("leadingIconRef.current?.startAnimation?.()"));
  assert.ok(buttonSource.includes("leadingIconRef.current?.stopAnimation?.()"));
  assert.ok(buttonSource.includes("onMouseEnter: () =>"));
  assert.ok(buttonSource.includes("onMouseLeave: stopLeadingIconAnimation"));
  assert.ok(buttonSource.includes("onFocus: startLeadingIconAnimation"));
  assert.ok(buttonSource.includes("onBlur: stopLeadingIconAnimation"));
  assert.ok(buttonSource.includes("ref: leadingIconRef"));
  assert.ok(buttonSource.includes("duration: 0.9"));
  assert.ok(buttonSource.includes("isAnimated: true"));
  assert.ok(buttonSource.includes("strokeWidth: 1.8"));
  assert.ok(buttonSource.includes("...(animateIconOnHover"));
  assert.ok(iconSource.includes('initial="normal"'));
  assert.doesNotMatch(iconSource, /animate="animate"|whileHover=/);

  assert.ok(iconSource.includes("useImperativeHandle"));
  assert.ok(iconSource.includes("controls.start(\"animate\")"));
  assert.ok(iconSource.includes("controls.start(\"normal\")"));
  assert.ok(iconSource.includes("isControlled.current"));
  assert.ok(iconSource.includes("useReducedMotion"));
  assert.ok(iconSource.includes("LazyMotion features={domMin} strict"));
  assert.ok(iconSource.includes("rotate: [0, -10, 8, -5, 0]"));
});
