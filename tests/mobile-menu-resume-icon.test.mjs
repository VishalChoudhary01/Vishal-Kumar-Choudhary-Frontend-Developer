import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("mobile resume CTA uses the animated download icon without changing its download target", async () => {
  const [menu, button, icon] = await Promise.all([
    read("../src/app/components/layout/MobileMenu.js"),
    read("../src/app/components/common/ProjectResumeButton.js"),
    read("../src/app/components/ui/DownloadIcon.js"),
  ]);

  assert.ok(menu.includes('import { DownloadIcon } from "../ui/DownloadIcon";'));
  assert.ok(menu.includes('href={RESUME_PDF}'));
  assert.ok(menu.includes('label="Download Resume"'));
  assert.ok(menu.includes('download="vishal_kumar_choudhary_frontend_developer.pdf"'));
  assert.ok(menu.includes('ariaLabel="Download resume (PDF)"'));
  assert.ok(menu.includes('icon={DownloadIcon}'));
  assert.ok(menu.includes("animateIconOnHover"));
  assert.ok(menu.includes('variant="nav"'));

  assert.ok(button.includes("animateIconOnHover = false"));
  assert.ok(button.includes("leadingIconRef.current?.startAnimation?.()"));
  assert.ok(button.includes("leadingIconRef.current?.stopAnimation?.()"));
  assert.ok(button.includes("onFocus: startLeadingIconAnimation"));
  assert.ok(button.includes("onBlur: stopLeadingIconAnimation"));
  assert.ok(button.includes("ref: leadingIconRef"));

  assert.ok(icon.includes("forwardRef"));
  assert.ok(icon.includes("useImperativeHandle"));
  assert.ok(icon.includes("startAnimation"));
  assert.ok(icon.includes("stopAnimation"));
  assert.ok(icon.includes("useReducedMotion"));
  assert.ok(icon.includes('LazyMotion features={domMin} strict'));
  assert.ok(icon.includes('m.g variants={arrowVariants}'));
  assert.ok(icon.includes("trayVariants"));
});

test("download icon returns to its resting state when hover or focus ends", async () => {
  const icon = await read("../src/app/components/ui/DownloadIcon.js");

  assert.ok(icon.includes('controls.start("animate")'));
  assert.ok(icon.includes('controls.start("normal")'));
  assert.ok(icon.includes("onMouseEnter={handleEnter}"));
  assert.ok(icon.includes("onMouseLeave={handleLeave}"));
  assert.ok(icon.includes("reduced || !isAnimated"));
});
