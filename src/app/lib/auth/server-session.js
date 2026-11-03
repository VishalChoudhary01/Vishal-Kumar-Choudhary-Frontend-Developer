import "server-only";

import { headers } from "next/headers";

import { auth, isAuthRuntimeConfigured } from "./auth";

export async function getCurrentAuthSession() {
  if (!isAuthRuntimeConfigured()) {
    return null;
  }

  return auth.api.getSession({
    headers: await headers(),
  });
}
