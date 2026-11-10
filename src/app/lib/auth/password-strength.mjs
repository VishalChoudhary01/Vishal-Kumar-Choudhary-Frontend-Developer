const RULES = Object.freeze([
  { id: "minimum", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "longer", label: "12+ characters", test: (value) => value.length >= 12 },
  { id: "case", label: "Uppercase and lowercase", test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: "number", label: "A number", test: (value) => /\d/.test(value) },
  { id: "symbol", label: "A symbol", test: (value) => /[^A-Za-z0-9]/.test(value) },
]);

export function assessPasswordStrength(password = "") {
  const value = typeof password === "string" ? password : "";
  const checks = RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(value),
  }));
  const score = checks.filter((check) => check.passed).length;

  let label = "Start typing";
  if (value.length > 0 && value.length < 8) label = "Too short";
  else if (value.length >= 8 && score <= 1) label = "Weak";
  else if (score <= 3) label = "Fair";
  else if (score === 4) label = "Good";
  else if (score === 5) label = "Strong";

  return {
    score,
    maximum: checks.length,
    label,
    checks,
  };
}
