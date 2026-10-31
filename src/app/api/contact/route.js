import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildContactEmail } from "@/app/lib/contactEmail";

/**
 * POST /api/contact
 *
 * Sends portfolio contact messages through the owner's Gmail account using
 * authenticated Gmail SMTP. Credentials must stay in server-side environment
 * variables and must never be exposed to the browser.
 *
 * Required environment variables:
 *   GMAIL_USER          Gmail address used to send messages
 *   GMAIL_APP_PASSWORD  Google App Password (not the normal account password)
 *   CONTACT_TO_EMAIL   Inbox that receives portfolio messages
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MIN_LENGTH = 2;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1200;

const PROJECT_TYPE_LABELS = {
  "landing-page": "Landing Page",
  "web-app": "Web App",
  product: "Product",
  experiment: "Experiment",
  other: "Other",
};

function validate(payload) {
  const errors = {};

  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "").trim();
  const projectType = String(payload?.projectType || "").trim();
  const message = String(payload?.message || "").trim();

  if (!name) errors.name = "This field is required";
  else if (name.length < NAME_MIN_LENGTH)
    errors.name = `Name must be at least ${NAME_MIN_LENGTH} characters`;

  if (!email) errors.email = "This field is required";
  else if (!EMAIL_REGEX.test(email))
    errors.email = "Please enter a valid email address";

  if (!projectType) errors.projectType = "This field is required";
  else if (!PROJECT_TYPE_LABELS[projectType])
    errors.projectType = "Please choose a valid project type";

  if (!message) errors.message = "This field is required";
  else if (message.length < MESSAGE_MIN_LENGTH)
    errors.message = `Message must be at least ${MESSAGE_MIN_LENGTH} characters`;
  else if (message.length > MESSAGE_MAX_LENGTH)
    errors.message = `Message must be under ${MESSAGE_MAX_LENGTH} characters`;

  return { errors, values: { name, email, projectType, message } };
}

export async function POST(request) {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!user || !appPassword) {
    return NextResponse.json(
      { error: "Email service is not configured yet." },
      { status: 503 },
    );
  }

  if (!to) {
    return NextResponse.json(
      { error: "A receiving email address is not configured yet." },
      { status: 503 },
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 },
    );
  }

  const { errors, values } = validate(payload);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const { subject, text, html } = buildContactEmail({
    name: values.name,
    email: values.email,
    projectType: values.projectType,
    projectLabel: PROJECT_TYPE_LABELS[values.projectType],
    message: values.message,
  });

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user,
        pass: appPassword.replace(/\\s/g, ""),
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: {
        name: "Portfolio Contact",
        address: user,
      },
      to,
      replyTo: values.email,
      subject,
      text,
      html,
    });

    transporter.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Gmail SMTP send failed:", err?.message || err);
    return NextResponse.json(
      { error: "Unable to send right now. Please try again." },
      { status: 500 },
    );
  }
}
