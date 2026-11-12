import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceAccess = await readFile(
  new URL("../src/app/components/labs/detail/LabSourceAccess.js", import.meta.url),
  "utf8",
);

const sharedButton = await readFile(
  new URL("../src/app/components/common/ProjectResumeButton.js", import.meta.url),
  "utf8",
);

test("protected source content is rendered only inside the loaded authorized-source state", () => {
  const authorizedBranch = sourceAccess.indexOf('state === "loaded" && source ? (');
  const editor = sourceAccess.indexOf("<LabCodeEditor");

  assert.notEqual(authorizedBranch, -1);
  assert.notEqual(editor, -1);
  assert.ok(editor > authorizedBranch, "Monaco reader must stay inside the loaded-source branch");
  assert.match(sourceAccess, /readOnly\s*\n/);
  assert.match(sourceAccess, /keepCurrentModel=\{false\}/);
});

test("reader model identity is scoped to the experiment, published version and selected path", () => {
  assert.match(sourceAccess, /scope="reader"/);
  assert.match(sourceAccess, /experimentSlug=\{slug\}/);
  assert.match(sourceAccess, /versionId=\{String\(source\.version\)\}/);
  assert.match(sourceAccess, /filePath=\{selectedSourceFile\.path\}/);
  assert.match(sourceAccess, /language=\{selectedSourceFile\.language\}/);
});

test("copy uses exact authorized source content and retains the code_copy event", () => {
  assert.match(sourceAccess, /navigator\.clipboard\.writeText\(file\.content\)/);
  assert.match(sourceAccess, /eventType:\s*"code_copy"/);
  assert.match(sourceAccess, /sourceVersion:\s*source\.version/);
  assert.match(sourceAccess, /filePath:\s*file\.path/);
});

test("session invalidation clears source state so the read-only editor unmounts", () => {
  assert.match(sourceAccess, /sourceRef\.current = null;\s*setSource\(null\);/);
  assert.match(sourceAccess, /setState\("unauthenticated"\)/);
});

test("the old plain pre/code renderer is not left alongside Monaco", () => {
  assert.doesNotMatch(sourceAccess, /<pre[\s\S]*?<code>/);
});


test("protected source actions use animated eye, copy and lock icons with reduced-motion support", () => {
  assert.ok(sourceAccess.includes("@animateicons/react/lucide/copy-icon"));
  assert.ok(sourceAccess.includes("@animateicons/react/lucide/eye-icon"));
  assert.ok(sourceAccess.includes("@animateicons/react/lucide/lock-icon"));
  assert.ok(sourceAccess.includes("useReducedMotion"));
  assert.ok(sourceAccess.includes("isAnimated={!prefersReducedMotion}"));
  assert.ok(sourceAccess.includes("<EyeIcon"));
  assert.ok(sourceAccess.includes("<AnimatedCopy"));
  assert.ok(sourceAccess.includes("<LockIcon"));
});


test("guest source gate uses shared CTAs with animated sign-in and account-creation icons", () => {
  assert.ok(sourceAccess.includes("@animateicons/react/lucide/log-in-icon"));
  assert.ok(sourceAccess.includes("@animateicons/react/lucide/user-round-plus-icon"));
  assert.ok(sourceAccess.includes("@animateicons/react/lucide/mail-check-icon"));
  assert.ok(sourceAccess.includes('import ProjectResumeButton from "@/app/components/common/ProjectResumeButton";'));
  assert.ok(sourceAccess.includes("function AnimatedSourceAction"));
  assert.ok(sourceAccess.includes("Icon={LogInIcon}"));
  assert.ok(sourceAccess.includes("Icon={UserRoundPlusIcon}"));
  assert.ok(sourceAccess.includes("Icon={MailCheckIcon}"));
  assert.ok(sourceAccess.includes("<EyeIcon size={19}"));
  assert.ok(sourceAccess.includes("icon={Icon}"));
  assert.ok(sourceAccess.includes("animateIconOnHover={isAnimated}"));
  assert.ok(sourceAccess.includes('surface={primary ? "brand" : "glass"}'));
  assert.ok(sourceAccess.includes('size="xs"'));

  // The shared button starts and stops the supplied animated icon on hover and focus.
  assert.ok(sharedButton.includes("leadingIconRef.current?.startAnimation?.()"));
  assert.ok(sharedButton.includes("leadingIconRef.current?.stopAnimation?.()"));
  assert.ok(sharedButton.includes("onMouseEnter: () =>"));
  assert.ok(sharedButton.includes("onMouseLeave: stopLeadingIconAnimation"));
  assert.ok(sharedButton.includes("onFocus: startLeadingIconAnimation"));
  assert.ok(sharedButton.includes("onBlur: stopLeadingIconAnimation"));
  assert.ok(sharedButton.includes("if (!animateIconOnHover) return"));
  assert.doesNotMatch(sourceAccess, /<Link/);
});
