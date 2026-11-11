import "server-only";

import { headers } from "next/headers";

import { auth, isAuthRuntimeConfigured } from "./auth";

export async function getCurrentAuthSession(requestHeaders) {
  if (!isAuthRuntimeConfigured()) {
    return null;
  }

  const sessionHeaders = requestHeaders || await headers();
  return auth.api.getSession({
    headers: sessionHeaders,
  });
}
