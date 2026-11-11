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
  assert.ok(modal.includes("max-w-[360px]"));
  assert.ok(modal.includes("sm:max-w-[392px]"));
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
  assert.ok(login.includes("text-[1.5rem]"));
  assert.ok(login.includes("sm:text-[1.65rem]"));
  assert.ok(signup.includes("text-[1.6rem]"));
  assert.ok(signup.includes("sm:text-[1.85rem]"));
  assert.ok(login.includes("space-y-2 sm:space-y-2.5"));
  assert.ok(signup.includes("space-y-2 sm:space-y-2.5"));
  assert.ok(field.includes("h-9 w-full"));
  assert.ok(field.includes("sm:h-10"));
  assert.ok(submit.includes("h-10"));
  assert.ok(submit.includes("sm:h-[42px]"));
  assert.ok(social.includes("h-9 w-full"));
  assert.ok(social.includes("sm:h-9"));
  assert.ok(signup.includes("<PasswordStrengthMeter password={password} />"));
});


test("signup requires the shared Privacy Policy acknowledgment before email or social registration", async () => {
  const signup = await read("../src/app/components/labs/auth/SignupForm.js");

  assert.ok(signup.includes('href="/privacy"'));
  assert.ok(signup.includes('target="_blank"'));
  assert.ok(signup.includes('rel="noopener noreferrer"'));
  assert.ok(signup.includes('name="privacyPolicyAccepted"'));
  assert.ok(signup.includes("required"));
  assert.ok(signup.includes('id="privacy-policy-acceptance"'));
  assert.ok(signup.includes("if (!privacyAccepted)"));
  assert.ok(signup.includes("disabled={loading || !registrationEnabled || !privacyAccepted}"));
  assert.ok(signup.includes("disabled={loading || !privacyAccepted}"));
  assert.ok(signup.includes("Please accept the Privacy Policy to create an account."));
});


test("password visibility uses animated eye and eye-closed icons with accessible state and reduced motion", async () => {
  const field = await read("../src/app/components/labs/auth/AuthField.js");

  assert.ok(field.includes("@animateicons/react/lucide/eye-icon"));
  assert.ok(field.includes("@animateicons/react/lucide/eye-closed-icon"));
  assert.ok(field.includes("AnimatePresence"));
  assert.ok(field.includes("motion.span"));
  assert.ok(field.includes("useReducedMotion"));
  assert.ok(field.includes("key={visible ? \"password-visible\" : \"password-hidden\"}"));
  assert.ok(field.includes("type={inputType}"));
  assert.ok(field.includes('aria-label={visible ? "Hide password" : "Show password"}'));
  assert.ok(field.includes("aria-pressed={visible}"));
  assert.ok(field.includes("duration={0.62}"));
  assert.ok(field.includes("isAnimated={!reducedMotion}"));
});

test("page and modal authentication surfaces are compact on mobile and retain desktop sizing", async () => {
  const [frame, modal, login, signup, forgot, reset, verify, meter] = await Promise.all([
    read("../src/app/components/labs/auth/AuthFrame.js"),
    read("../src/app/components/labs/auth/LabsAuthModal.js"),
    read("../src/app/components/labs/auth/LoginForm.js"),
    read("../src/app/components/labs/auth/SignupForm.js"),
    read("../src/app/components/labs/auth/ForgotPasswordForm.js"),
    read("../src/app/components/labs/auth/ResetPasswordForm.js"),
    read("../src/app/components/labs/auth/VerifyEmailPanel.js"),
    read("../src/app/components/labs/auth/PasswordStrengthMeter.js"),
  ]);

  assert.ok(frame.includes("max-w-[360px]"));
  assert.ok(frame.includes("sm:max-w-[408px]"));
  assert.ok(modal.includes("max-w-[360px]"));
  assert.ok(modal.includes("sm:max-w-[392px]"));

  for (const source of [forgot, reset, verify]) {
    assert.match(source, /space-y-3 sm:space-y-4/);
  }
  assert.ok(login.includes("space-y-2 sm:space-y-2.5"));
  assert.ok(signup.includes("space-y-2 sm:space-y-2.5"));

  assert.ok(meter.includes("px-2.5 py-2 sm:space-y-2"));
});


test("Labs auth scroll areas hide scrollbar chrome while preserving internal scrolling", async () => {
  const [modal, frame, css] = await Promise.all([
    read("../src/app/components/labs/auth/LabsAuthModal.js"),
    read("../src/app/components/labs/auth/AuthFrame.js"),
    read("../src/app/globals.css"),
  ]);

  assert.ok(modal.includes("overflow-y-auto auth-scrollbar-hidden"));
  assert.ok(modal.includes("max-h-[calc(100dvh-1rem)]"));
  assert.ok(modal.includes("sm:max-h-[calc(100dvh-2rem)]"));
  assert.ok(frame.includes("overflow-y-auto auth-scrollbar-hidden"));
  assert.ok(css.includes(".auth-scrollbar-hidden"));
  assert.ok(css.includes("scrollbar-width: none"));
  assert.ok(css.includes("-ms-overflow-style: none"));
  assert.ok(css.includes(".auth-scrollbar-hidden::-webkit-scrollbar"));
  assert.ok(css.includes("display: none !important"));
});

test("login and signup use tighter vertical rhythm without reducing auth control tap targets", async () => {
  const [login, signup, field, social, meter] = await Promise.all([
    read("../src/app/components/labs/auth/LoginForm.js"),
    read("../src/app/components/labs/auth/SignupForm.js"),
    read("../src/app/components/labs/auth/AuthField.js"),
    read("../src/app/components/labs/auth/SocialAuthButtons.js"),
    read("../src/app/components/labs/auth/PasswordStrengthMeter.js"),
  ]);

  assert.ok(login.includes("mb-2 text-center sm:mb-2.5"));
  assert.ok(signup.includes("mb-2 text-center sm:mb-2.5"));
  assert.ok(login.includes("space-y-2 sm:space-y-2.5"));
  assert.ok(signup.includes("space-y-2 sm:space-y-2.5"));
  assert.ok(field.includes("h-9 w-full"));
  assert.ok(field.includes("sm:h-10"));
  assert.ok(social.includes("mt-2.5 sm:mt-3"));
  assert.ok(social.includes("sm:h-9"));
  assert.ok(meter.includes("sm:px-3 sm:py-2.5"));
});
