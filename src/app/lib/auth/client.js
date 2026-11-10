"use client";

import { createAuthClient } from "better-auth/react";

// Use the current origin for same-origin auth requests, including Vercel previews.
export const authClient = createAuthClient();
