import { Resend } from "resend";

/**
 * Resend client — created lazily so importing this module never throws
 * when the API key is missing (e.g. local builds before setup).
 */

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Resolve the verified "from" address.
 *
 * While no domain is added/verified in Resend you can only send from
 * "onboarding@resend.dev" (test mode). Once your own domain is verified,
 * set RESEND_FROM_EMAIL to something like "Contact <hello@yourdomain.com>".
 */
export function getFromEmail() {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "onboarding@resend.dev"
  );
}
