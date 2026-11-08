function safeHttpsUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function toLabsAccountUser(user) {
  if (!user || typeof user.id !== "string" || !user.id) return null;
  return {
    id: user.id,
    name: typeof user.name === "string" ? user.name.trim().slice(0, 120) : "",
    email: typeof user.email === "string" ? user.email.trim().slice(0, 254) : "",
    image: safeHttpsUrl(user.image),
    emailVerified: user.emailVerified === true,
  };
}

export function getLabsAccountDisplayName(user) {
  const name = typeof user?.name === "string" ? user.name.trim() : "";
  if (name) return name;
  const email = typeof user?.email === "string" ? user.email.trim() : "";
  if (email.includes("@")) return email.slice(0, email.indexOf("@"));
  return "Account";
}

export function getLabsAccountInitials(value) {
  const words = typeof value === "string" ? value.trim().split(/\s+/).filter(Boolean) : [];
  if (!words.length) return "A";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
