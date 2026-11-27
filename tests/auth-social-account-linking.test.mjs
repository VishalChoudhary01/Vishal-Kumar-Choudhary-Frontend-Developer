import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("social account linking requires an explicit action and a verified local email", async () => {
  const auth = await read("../src/app/lib/auth/auth.js");
  assert.match(auth, /accountLinking:\s*\{[\s\S]*?enabled:\s*true,[\s\S]*?disableImplicitLinking:\s*true,[\s\S]*?requireLocalEmailVerified:\s*true,[\s\S]*?allowDifferentEmails:\s*false,[\s\S]*?allowUnlinkingAll:\s*false,/);
  assert.match(auth, /requireEmailVerification:\s*true/);
  assert.match(auth, /getUserInfo:\s*getGitHubUserInfo/);
});

test("account security route requires a server session and verified email", async () => {
  const page = await read("../src/app/labs/account/security/page.js");
  assert.ok(page.includes("getCurrentAuthSession()"));
  assert.ok(page.includes("<Navbar"));
  assert.ok(page.includes("toLabsAccountUser(session.user)"));
  assert.ok(page.includes("redirect(\"/labs/login?returnTo=\""));
  assert.ok(page.includes("session.user.emailVerified !== true"));
  assert.ok(page.includes("redirect(\"/labs/verify-email?returnTo=\""));
  assert.ok(page.includes("isGoogleAuthConfigured"));
  assert.ok(page.includes("isGitHubAuthConfigured"));
});

test("Better Auth link-social endpoint rejects guests and unverified sessions server-side", async () => {
  const route = await read("../src/app/api/auth/[...all]/route.js");
  assert.ok(route.includes('pathname.endsWith("/link-social") || pathname.endsWith("/unlink-account")'));
  assert.ok(route.includes("auth.api.getSession({ headers: request.headers })"));
  assert.ok(route.includes("session.user.emailVerified !== true"));
  assert.ok(route.includes('code: "EMAIL_NOT_VERIFIED"'));
});

test("account settings explicitly links social providers and uses Better Auth account IDs to disconnect", async () => {
  const component = await read("../src/app/components/labs/LabsAccountSecurity.js");
  assert.ok(component.includes("authClient.listAccounts()"));
  assert.ok(component.includes("authClient.linkSocial({"));
  assert.ok(component.includes("linked=${provider}"));
  assert.ok(component.includes("nextAccounts.some((account) => account.providerId === linkedProvider)"));
  assert.ok(component.includes("authClient.unlinkAccount({ accountId: account.id })"));
  assert.ok(component.includes("accounts.length > 1"));
  assert.ok(component.includes("providerId === \"credential\""));
});

test("login and signup explain unlinked OAuth identities", async () => {
  const [login, signup] = await Promise.all([
    read("../src/app/labs/(auth)/login/page.js"),
    read("../src/app/labs/(auth)/signup/page.js"),
  ]);
  assert.ok(login.includes('query?.error === "account_not_linked"'));
  assert.ok(signup.includes('query?.error === "account_not_linked"'));
  assert.ok(login.includes("connect it from Account settings"));
  assert.ok(signup.includes("connect it from Account settings"));
});

test("social account settings are linked from the signed-in Labs account dropdown", async () => {
  const [account, tests] = await Promise.all([
    read("../src/app/components/labs/LabsAccountControl.js"),
    read("../tests/labs-account-control.test.mjs"),
  ]);
  assert.ok(account.includes('href="/labs/account/security"'));
  assert.ok(account.includes("Account settings"));
  assert.ok(account.includes("Settings2"));
  assert.ok(tests.includes("account dropdown preserves mobile profile trigger"));
});
