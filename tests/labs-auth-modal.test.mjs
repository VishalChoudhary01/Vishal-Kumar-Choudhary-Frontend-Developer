import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Labs auth routes render over the existing Labs page through a parallel route slot", async () => {
  const [layout, slotLayout, fallback, login, signup, forgot, reset, verify] = await Promise.all([
    read("../src/app/labs/layout.js"),
    read("../src/app/labs/@authModal/layout.js"),
    read("../src/app/labs/@authModal/default.js"),
    read("../src/app/labs/@authModal/(.)login/page.js"),
    read("../src/app/labs/@authModal/(.)signup/page.js"),
    read("../src/app/labs/@authModal/(.)forgot-password/page.js"),
    read("../src/app/labs/@authModal/(.)reset-password/page.js"),
    read("../src/app/labs/@authModal/(.)verify-email/page.js"),
  ]);

  assert.ok(layout.includes("{children}") && layout.includes("{authModal}"));
  assert.ok(slotLayout.includes("<LabsAuthModal>{children}</LabsAuthModal>"));
  assert.ok(fallback.includes("return null"));
  for (const page of [login, signup, forgot, reset, verify]) {
    assert.ok(page.includes('export const dynamic = "force-dynamic"'));
    assert.ok(page.includes("export default "));
  }
});

test("Labs auth modal keeps the Labs page visible through a translucent blurred backdrop", async () => {
  const modal = await read("../src/app/components/labs/auth/LabsAuthModal.js");
  assert.ok(modal.includes("bg-[rgba(2,8,6,0.18)]"));
  assert.ok(modal.includes("backdrop-blur-[4px]"));
  assert.ok(modal.includes("max-w-[392px]"));
  assert.ok(modal.includes("bg-surface-elevated/90"));
  assert.ok(modal.includes('aria-modal="true"'));
  assert.ok(modal.includes('event.key === "Escape"'));
  assert.ok(modal.includes("router.back()"));
  assert.ok(modal.includes("VKrLogo compact"));
});

test("auth modal entry, exit and route transitions use Motion and reduced-motion fallback", async () => {
  const modal = await read("../src/app/components/labs/auth/LabsAuthModal.js");
  assert.ok(modal.includes("AnimatePresence"));
  assert.ok(modal.includes("exit={reducedMotion"));
  assert.ok(modal.includes('mode="wait"'));
  assert.ok(modal.includes("useReducedMotion"));
  assert.ok(modal.includes("transition={panelTransition}"));
});

test("login and signup stay compact while retaining social login and password guidance", async () => {
  const [login, signup, field, submit, social] = await Promise.all([
    read("../src/app/components/labs/auth/LoginForm.js"),
    read("../src/app/components/labs/auth/SignupForm.js"),
    read("../src/app/components/labs/auth/AuthField.js"),
    read("../src/app/components/labs/auth/AuthSubmit.js"),
    read("../src/app/components/labs/auth/SocialAuthButtons.js"),
  ]);
  assert.ok(login.includes("text-[1.7rem]"));
  assert.ok(signup.includes("text-[1.7rem]"));
  assert.ok(login.includes("space-y-3"));
  assert.ok(signup.includes("space-y-3"));
  assert.ok(field.includes("h-10 w-full"));
  assert.ok(submit.includes("h-[42px]"));
  assert.ok(social.includes("h-10 w-full"));
  assert.ok(signup.includes("<PasswordStrengthMeter password={password} />"));
});
