import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Labs collection prerenders resolved server auth and owner state into the Navbar", async () => {
  const [page, detailPage, shell, navbar] = await Promise.all([
    read("../src/app/labs/page.js"),
    read("../src/app/labs/[slug]/page.js"),
    read("../src/app/components/labs/LabsPageShell.js"),
    read("../src/app/components/layout/Navbar.js"),
  ]);
  assert.ok(page.includes("initialAuthUser={toLabsAccountUser(session?.user)}"));
  assert.ok(page.includes("initialSessionResolved={sessionResolved}"));
  assert.ok(page.includes("initialIsOwner="));
  assert.ok(page.includes("getLabsOwnerAccessStatus"));
  assert.ok(detailPage.includes("initialAuthUser={initialAuthUser}"));
  assert.ok(detailPage.includes("initialSessionResolved={initialSessionResolved}"));
  assert.ok(detailPage.includes("initialIsOwner={initialIsOwner}"));
  assert.ok(shell.includes("initialIsOwner={initialIsOwner}"));
  assert.ok(navbar.includes("initialIsOwner={initialIsOwner}"));
});

test("guest sign-in and create-account CTAs are desktop-only", async () => {
  const account = await read("../src/app/components/labs/LabsAccountControl.js");
  assert.ok(account.includes("hidden shrink-0 items-center gap-1.5 lg:flex"));
  assert.ok(account.includes("hidden h-8 w-[112px]"));
  assert.ok(account.includes("Sign in"));
  assert.ok(account.includes("Create account"));
  assert.ok(account.includes("initialSessionResolved && initialUser"));
  assert.ok(account.includes("isPending"));
});

test("account menu displays optional provider name and avatar with a safe fallback", async () => {
  const account = await read("../src/app/components/labs/LabsAccountControl.js");
  assert.ok(account.includes("getLabsAccountDisplayName"));
  assert.ok(account.includes("<LabsWorkspaceAvatar"));
  assert.ok(account.includes("session.user"));
  assert.ok(account.includes("getLabsAccountDisplayName(session.user)"));
  assert.ok(account.includes("{displayName}"));
});


test("account and owner menus share the compact responsive dropdown surface", async () => {
  const [account, owner, dropdown, destinations] = await Promise.all([
    read("../src/app/components/labs/LabsAccountControl.js"),
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
    read("../src/app/components/labs/LabsWorkspaceDestinations.js"),
  ]);
  assert.ok(account.includes("<LabsWorkspaceDropdown"));
  assert.ok(owner.includes("<LabsWorkspaceDropdown"));
  assert.ok(account.includes("activeWorkspaceId === destination.id"));
  assert.ok(dropdown.includes("rounded-[4px]"));
  assert.ok(dropdown.includes("rounded-[3px]"));
  assert.ok(dropdown.includes("rounded-[2px]"));
  assert.ok(dropdown.includes("max-h-[min(70dvh,520px)]"));
  assert.equal((destinations.match(/href: \"\/admin\//g) || []).length, 4);
});

test("account dropdown preserves mobile profile trigger, owner destinations and sign-out", async () => {
  const account = await read("../src/app/components/labs/LabsAccountControl.js");
  assert.ok(account.includes("max-w-[min(196px,calc(100vw-5.5rem))]"));
  assert.ok(account.includes("Owner workspace"));
  assert.ok(account.includes("LABS_WORKSPACE_DESTINATIONS.map"));
  assert.ok(account.includes("Sign out"));
  assert.ok(account.includes("Verify email"));
  assert.ok(account.includes("aria-controls=\"labs-account-menu\""));
});


test("mobile account trigger is avatar-only and keeps the owner dropdown inside the viewport", async () => {
  const [account, dropdown, navbar] = await Promise.all([
    read("../src/app/components/labs/LabsAccountControl.js"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
    read("../src/app/components/layout/Navbar.js"),
  ]);
  assert.ok(account.includes("size-10 max-w-[min(196px,calc(100vw-5.5rem))]"));
  assert.ok(account.includes('hidden min-w-0 flex-1 lg:block'));
  assert.ok(account.includes('hidden size-6 shrink-0 place-items-center'));
  assert.ok(account.includes('scrolled ? "lg:rounded-full" : "lg:rounded-[3px]"'));
  assert.ok(account.includes("mobileTop={scrolled ? 66 : 68}"));
  assert.ok(dropdown.includes("max-lg:fixed"));
  assert.ok(dropdown.includes("max-lg:left-3 max-lg:right-3"));
  assert.ok(dropdown.includes("max-lg:top-[var(--mobile-menu-top)]"));
  assert.ok(navbar.includes('"top-0.5 mx-2.5 h-[56px] rounded-full"'));
});

test("account sign-out action uses its animated icon and respects reduced motion", async () => {
  const account = await read("../src/app/components/labs/LabsAccountControl.js");
  const icon = await read("../src/app/components/ui/LogOutAnimatedIcon.js");
  assert.ok(account.includes('import LogOutAnimatedIcon from "@/app/components/ui/LogOutAnimatedIcon"'));
  assert.ok(account.includes("onMouseEnter={() => signOutIconRef.current?.startAnimation?.()}"));
  assert.ok(account.includes("onFocus={() => signOutIconRef.current?.startAnimation?.()}"));
  assert.ok(account.includes("isAnimated={!prefersReducedMotion}"));
  assert.ok(icon.includes("startAnimation"));
  assert.ok(icon.includes("stopAnimation"));
});
