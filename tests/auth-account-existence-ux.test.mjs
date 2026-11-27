import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("signup confirmation describes an accepted request without claiming account creation or email delivery", async () => {
  const [signup, confirmation] = await Promise.all([
    read("../src/app/components/labs/auth/SignupForm.js"),
    read("../src/app/components/labs/auth/SignupConfirmation.js"),
  ]);

  assert.ok(signup.includes('response.status === 202 && result?.ok'));
  assert.ok(signup.includes("<SignupConfirmation"));
  assert.ok(confirmation.includes("Check your email"));
  assert.ok(confirmation.includes("If this email address can be used to create a Labs account"));
  assert.ok(confirmation.includes("Check your inbox and spam folder"));
  assert.ok(!confirmation.includes("Account created successfully"));
  assert.ok(!confirmation.includes("Email sent"));
});

test("signup confirmation preserves returnTo for sign-in and password recovery", async () => {
  const confirmation = await read("../src/app/components/labs/auth/SignupConfirmation.js");

  assert.ok(confirmation.includes('"/labs/login?returnTo=" + encodeURIComponent(returnTo)'));
  assert.ok(confirmation.includes('"/labs/forgot-password?returnTo=" + encodeURIComponent(returnTo)'));
  assert.ok(confirmation.includes("Continue to sign in"));
  assert.ok(confirmation.includes("Forgot password?"));
  assert.ok(confirmation.includes("Use another email"));
  assert.ok(confirmation.includes('setEmail("")'));
  assert.ok(confirmation.includes("setPassword(\"")") === false);
});

test("signup confirmation is keyboard accessible and respects reduced motion", async () => {
  const confirmation = await read("../src/app/components/labs/auth/SignupConfirmation.js");

  assert.ok(confirmation.includes("useReducedMotion"));
  assert.ok(confirmation.includes("reducedMotion ? false"));
  assert.ok(confirmation.includes("headingRef.current?.focus()"));
  assert.ok(confirmation.includes('tabIndex={-1}'));
  assert.ok(confirmation.includes('aria-labelledby="signup-confirmation-title"'));
});

test("signup uses a synchronous lock to prevent duplicate email registration requests", async () => {
  const signup = await read("../src/app/components/labs/auth/SignupForm.js");

  assert.ok(signup.includes("const submitLockRef = useRef(false)"));
  assert.ok(signup.includes("if (submitLockRef.current) return"));
  assert.ok(signup.includes("submitLockRef.current = true"));
  assert.ok(signup.includes("submitLockRef.current = false"));
  assert.ok(signup.includes("aria-busy={loading}"));
});

test("unknown email and incorrect password share generic credential failure guidance with signup action", async () => {
  const login = await read("../src/app/components/labs/auth/LoginForm.js");

  assert.ok(login.includes("We couldn't sign you in with those details. Check your email and password, or reset your password."));
  assert.ok(login.includes("New to Labs?"));
  assert.ok(login.includes('"/labs/signup?returnTo=" + encodeURIComponent(returnTo)'));
  assert.ok(login.includes("const isCredentialFailure ="));
  assert.ok(login.includes("setCredentialFailure(isCredentialFailure)"));
  assert.ok(!login.includes("This account does not exist"));
});

test("login keeps verification and rate-limit guidance distinct from credential failures", async () => {
  const login = await read("../src/app/components/labs/auth/LoginForm.js");

  assert.ok(login.includes("const requiresVerification = status === 403"));
  assert.ok(login.includes("const rateLimited = status === 429"));
  assert.ok(login.includes("Too many sign-in attempts."));
  assert.ok(login.includes('"/labs/verify-email?returnTo=" + encodeURIComponent(returnTo)'));
});

test("registration endpoint returns the same generic accepted response for non-delivery account collisions", async () => {
  const route = await read("../src/app/api/labs/register/route.js");

  assert.ok(route.includes("const GENERIC_RESPONSE ="));
  assert.ok(route.includes("return json(GENERIC_RESPONSE, 202)"));
  assert.ok(route.includes("if (result?.error)"));
  assert.ok(route.includes("if (deliveryFailed)"));
  assert.ok(!route.includes("EMAIL_ALREADY_EXISTS"));
  assert.ok(!route.includes("USER_ALREADY_EXISTS"));
});
