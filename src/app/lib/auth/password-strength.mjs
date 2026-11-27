const MINIMUM_LENGTH = 8;

const RULES = Object.freeze([
  {
    id: "minimum",
    label: "At least 8 characters",
    test: (value) => value.length >= MINIMUM_LENGTH,
  },
  {
    id: "uppercase",
    label: "A capital letter",
    guidance: "Missing a capital letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "A lowercase letter",
    guidance: "Missing a lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "A number",
    guidance: "Missing a number",
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: "symbol",
    label: "A special character",
    guidance: "Missing a special character",
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
  },
]);

export function assessPasswordStrength(password = "") {
  const value = typeof password === "string" ? password : "";
  const checks = RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    guidance: rule.guidance || "",
    passed: rule.test(value),
  }));
  const score = checks.filter((check) => check.passed).length;
  const nextRequirement = checks.find((check) => !check.passed) || null;
  const missingCharacters = Math.max(0, MINIMUM_LENGTH - value.length);

  let label = "Start typing";
  let tone = "neutral";

  if (value && missingCharacters > 0) {
    label = "Too short";
    tone = "weak";
  } else if (score <= 2) {
    label = value ? "Weak" : "Start typing";
    tone = value ? "weak" : "neutral";
  } else if (score === 3) {
    label = "Fair";
    tone = "fair";
  } else if (score === 4) {
    // Four passed checks still means one requirement is missing. Avoid
    // announcing "Good" while the guidance is asking for another requirement.
    label = "Almost there";
    tone = "good";
  } else {
    label = "Strong";
    tone = "strong";
  }

  const guidance = !value
    ? ""
    : nextRequirement?.id === "minimum"
      ? `Add ${missingCharacters} more ${missingCharacters === 1 ? "character" : "characters"}`
      : nextRequirement?.guidance || "All requirements met";

  return {
    score,
    maximum: checks.length,
    label,
    tone,
    checks,
    guidance,
    nextRequirementId: nextRequirement?.id || null,
    nextRequirementIsRequired: nextRequirement?.id === "minimum",
  };
}
