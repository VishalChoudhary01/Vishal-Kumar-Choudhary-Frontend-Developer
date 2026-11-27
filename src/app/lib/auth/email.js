import "server-only";

import nodemailer from "nodemailer";

function readSmtpConfig() {
  const host = process.env.AUTH_SMTP_HOST;
  const port = Number(process.env.AUTH_SMTP_PORT || 587);
  const user = process.env.AUTH_SMTP_USER?.trim();
  const configuredPassword = process.env.AUTH_SMTP_PASSWORD;
  const from = process.env.AUTH_EMAIL_FROM?.trim();

  if (!host || !Number.isFinite(port) || !user || !configuredPassword || !from) {
    throw new Error("Authentication email delivery is not configured.");
  }

  return {
    host,
    port,
    user,
    // Google displays App Passwords in groups; remove copied whitespace for Gmail SMTP.
    // Preserve passwords unchanged for other SMTP providers.
    pass: host.trim().toLowerCase() === "smtp.gmail.com"
      ? configuredPassword.replace(/\s/g, "")
      : configuredPassword,
    from,
    secure:
      process.env.AUTH_SMTP_SECURE === "true" ||
      port === 465,
  };
}

export function isAuthEmailConfigured() {
  try {
    readSmtpConfig();
    return true;
  } catch {
    return false;
  }
}

export async function sendAuthEmail({ to, subject, text, html }) {
  if (!to || !subject || !text) {
    throw new Error("Invalid authentication email payload.");
  }

  const config = readSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    });
  } finally {
    transporter.close();
  }
}
