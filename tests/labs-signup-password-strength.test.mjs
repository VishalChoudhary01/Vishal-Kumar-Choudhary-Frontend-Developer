import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const { assessPasswordStrength } = await import("../src/app/lib/auth/password-strength.mjs");

test("signup password strength appears only while the password field has focus", async () => {
  const signup = await read("../src/app/components/labs/auth/SignupForm.js");

  assert.ok(signup.includes("const [passwordFocused, setPasswordFocused] = useState(false)"));
  assert.ok(signup.includes("onFocus={() => setPasswordFocused(true)}"));
  assert.ok(signup.includes("setPasswordFocused(false)"));
  assert.ok(signup.includes("visible={passwordFocused}"));
  assert.ok(signup.includes('describedBy={passwordFocused ? "password-strength-meter" : undefined}'));
});

test("password strength sits inline with the password label without changing form layout height", async () => {
  const meter = await read("../src/app/components/labs/auth/PasswordStrengthMeter.js");

  assert.ok(meter.includes("inline-flex min-w-0 items-center gap-1.5"));
  assert.ok(meter.includes("text-[10px] font-semibold leading-none"));
  assert.ok(meter.includes("key={guidance}"));
  assert.ok(meter.includes("aria-live=\"polite\""));
  assert.ok(meter.includes("max-w-[170px] truncate"));
  assert.ok(meter.includes("check.passed ? 1 : 0"));
  assert.ok(!meter.includes("absolute"));
  assert.ok(!meter.includes("pointer-events-none"));
  assert.ok(meter.includes("AnimatePresence"));
  assert.ok(meter.includes("initial={reducedMotion ? false : { opacity: 0, y: 3 }}"));
  assert.ok(meter.includes("exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 2 }}"));
  assert.ok(meter.includes('role="meter"'));
  assert.ok(meter.includes("aria-valuenow={score}"));
  assert.ok(!meter.includes('height: "auto"'));
  assert.ok(!meter.includes("grid-cols-2"));
  assert.ok(!meter.includes("check.label"));
});

test("password field supports the focused strength meter as an additional accessible description", async () => {
  const field = await read("../src/app/components/labs/auth/AuthField.js");

  assert.ok(field.includes("describedBy"));
  assert.ok(field.includes("min-h-4"));
  assert.ok(field.includes("sm:min-h-5"));
  assert.ok(field.includes("labelAccessory"));
  assert.ok(field.includes("const descriptionIds = [errorId || helperId, describedBy]"));
  assert.ok(field.includes("aria-describedby={descriptionIds}"));
});

test("password guidance advances one unmet requirement at a time", () => {
  assert.equal(assessPasswordStrength("").guidance, "Use 8+ characters");
  assert.equal(assessPasswordStrength("abc").guidance, "Use 8+ characters");

  const minimumPassed = assessPasswordStrength("abcdefgh");
  assert.equal(minimumPassed.guidance, "For extra strength: 12+ characters");
  assert.equal(minimumPassed.nextRequirementIsRequired, false);

  assert.equal(
    assessPasswordStrength("abcdefgh1234").guidance,
    "Mix uppercase + lowercase",
  );
  assert.equal(
    assessPasswordStrength("Abcdefgh1234").guidance,
    "Add at least one symbol",
  );
  assert.equal(
    assessPasswordStrength("Abcdefgh1234!").guidance,
    "All strength checks passed",
  );
});

test("only the minimum eight-character rule is marked as required", () => {
  assert.equal(assessPasswordStrength("abc").nextRequirementIsRequired, true);
  assert.equal(assessPasswordStrength("abcdefgh").nextRequirementIsRequired, false);
});
