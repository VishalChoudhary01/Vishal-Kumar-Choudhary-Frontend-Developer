# Contact Form and Email Delivery — End-to-End Engineering

**Status:** Current implementation reverse-engineered from `feat/labs-platform-integration`.  
**Public section:** Homepage `#contact`  
**Section component:** `src/app/components/sections/ContactSection.js`  
**Form state/orchestration:** `src/app/components/sections/contact_comp/ContactForm.js`  
**Field UI:** `ContactFormFields.js`, `contact_form/ContactField.js`, `contact_form/ContactProjectType.js`  
**Client validation:** `contactForm.validation.js`  
**Client HTTP adapter:** `contactForm.api.js`  
**Server endpoint:** `src/app/api/contact/route.js`  
**Email template builder:** `src/app/lib/contactEmail.js`  
**Transport:** Nodemailer over Gmail SMTP (server-side only)  
**Success UI:** `src/app/components/ui/SuccessModal.js`  
**Related sounds:** `/mp3/confirmation-002.mp3` when success modal opens.

This guide documents the real component tree, client state, validation, JSON request/response, server-side checks, email content, SMTP configuration, success/error paths, privacy boundary and safe extension rules. It does not describe a database-backed contact inbox or a confirmation email to the sender; neither is implemented in the audited code.

---

## 1. Executive summary

The contact form is a public homepage section. It is a client-controlled React form whose submission is handled by a dedicated Next.js Route Handler.

The flow is:

```text
Homepage
  → ContactSection (#contact)
    → ContactIntro
    → ContactForm
      → ContactFormFields
        → controlled React fields
        → client validation
      → submitContactForm()
        → POST /api/contact (JSON)
          → server configuration check
          → parse request JSON
          → independent server validation
          → buildContactEmail()
            → plain-text email
            → HTML email (escaped user fields)
          → Nodemailer transporter
            → Gmail SMTP (smtp.gmail.com:465, TLS)
              → CONTACT_TO_EMAIL
          → { ok: true } or a mapped error
      → client success state
        → SuccessModal
          → confirmation-002.mp3
```

The server sends one notification email to the configured receiving inbox. The visitor's email is placed in `Reply-To`, so replying from the receiving mailbox targets the visitor. The sender's mailbox is the configured `GMAIL_USER`.

There is no contact-message MongoDB collection, no separate confirmation email sent to the visitor, and no API-based contact-history UI in the inspected implementation.

## 2. Actual file map

| File | Responsibility |
|---|---|
| `src/app/components/sections/ContactSection.js` | Section layout, heading, atmosphere, intro and form composition |
| `src/app/components/sections/contact_comp/ContactIntro.js` | Introductory contact content and reveal behavior |
| `src/app/components/sections/contact_comp/ContactAtmosphere.js` | Decorative section background; not part of form submission |
| `src/app/components/sections/contact_comp/ContactForm.js` | Controlled values/errors/status/modal state; validates and orchestrates submit/reset |
| `src/app/components/sections/contact_comp/ContactFormFields.js` | Composes name, email, project-type and message fields, privacy link, counter and submit control |
| `src/app/components/sections/contact_comp/contact_form/ContactField.js` | Reusable input/textarea UI, focus/hover/error states and accessible label wiring |
| `src/app/components/sections/contact_comp/contact_form/ContactProjectType.js` | Custom accessible radio-group UI for project type |
| `src/app/components/sections/contact_comp/ContactMessageCounter.js` | Live message length display using MotionNumber |
| `src/app/components/sections/contact_comp/ContactRevealRow.js` | Motion reveal wrapper for form groups |
| `src/app/components/sections/contact_comp/contact.motion.js` | Reveal/focus/error/background Motion constants and field stagger |
| `src/app/components/sections/contact_comp/contactForm.validation.js` | Client-side constraints and validation helpers |
| `src/app/components/sections/contact_comp/contactForm.api.js` | JSON fetch adapter for `/api/contact`; converts non-OK response into an Error |
| `src/app/api/contact/route.js` | Public POST handler, server validation, email composition and SMTP send |
| `src/app/lib/contactEmail.js` | Builds subject, plain-text body and HTML email |
| `src/app/components/ui/SuccessModal.js` | Accessible success confirmation modal, focus/scroll lifecycle and success sound |
| `src/app/components/ui/success_modal_comp/*` | Success modal visual content and Motion configuration |
| `.env.example` | Environment template; its current contact-provider block is stale (see section 12) |

## 3. Section composition and layout

The section is mounted in the homepage as `<ContactSection />`. It renders:

```text
<section id="contact" aria-labelledby="contact-heading">
  ContactAtmosphere (decorative, absolute background)
  <div className="relative z-10 mx-auto max-w-7xl">
    <div className="desktop label/content grid">
      SectionHeading(label="CONTACT", number="07")
      <div>
        SectionHeading(supporting="Let's build something worth exploring.")
        ContactIntro
        ContactForm
      </div>
    </div>
  </div>
</section>
```

Current section layout:
- background uses semantic `bg-background`;
- horizontal padding `px-[clamp(24px,5vw,80px)]`;
- vertical padding `py-[clamp(90px,11vw,170px)]`;
- content max-width `max-w-7xl`;
- desktop label/content grid `lg:grid-cols-[180px_1fr]`;
- section root is relative and overflow-hidden;
- ContactAtmosphere is behind content; form remains in the relative z-10 content layer.

This section layout and the ContactAtmosphere/ContactIntro reveal behavior are also described in `pages/HOME-PAGE-ENGINEERING.md`. This guide owns the form and delivery contract.

## 4. Client component hierarchy

### ContactForm

`ContactForm.js` is the state owner. It owns:
- `values`: name, email, projectType and message;
- `errors`: field-level validation messages;
- `status`: idle, submitting, success or error;
- `submitError`: server/network error message;
- `modalOpen`: whether the success modal is visible.

It also owns:
- `formRef` and the one-time useInView reveal gate;
- field change/blur callbacks;
- project type change handling;
- whole-form validation and focus of first invalid field;
- submit orchestration;
- reset after the success modal is closed.

The component uses `useReducedMotion` and Motion's `useInView`:
- `once: true`;
- margin `"-60px 0px"`;
- form groups animate when active;
- reduced motion marks the form active immediately.

### ContactFormFields

This is a presentational/composition component. It receives controlled state and callbacks from ContactForm. It does not own the main form values or perform the network request.

Rendered fields, in order:
1. Name.
2. Email address.
3. Project type.
4. Message textarea and character counter.
5. Privacy Policy explanation/link.
6. Send Message action.
7. Server/network submit error (when present).

Field groups use ContactRevealRow with stagger:
- name: 0.06s;
- project type: 0.18s;
- message: 0.24s;
- submit: 0.30s.

The shared reveal duration is 0.6 seconds using `[0.16, 1, 0.3, 1]`. This is an entrance/reveal animation, not an animation tied to typing progress.

### ContactField

The input/textarea primitive:
- renders a real labelled `input` or `textarea`;
- forwards controlled `value`, `onChange`, `onBlur`, required/disabled and autocomplete props;
- attaches `aria-invalid` and `aria-describedby` to current helper/error text;
- tracks local hover and focus UI state;
- animates the bottom field rule on focus;
- displays helper copy until an error exists;
- displays field errors through `role="alert"`;
- reduces focus/error animations when reduced motion is enabled.

Current focus handler calls `event.target.select?.()`, so focusing a text input/textarea selects its current text where supported. Be aware of that existing behavior before changing focus UX.

### ContactProjectType

The project type chooser is a custom radio group, not a native select.

Options:
| Value | Visible label |
|---|---|
| `landing-page` | Landing Page |
| `web-app` | Web App |
| `product` | Product |
| `experiment` | Experiment |
| `other` | Other |

Accessibility/keyboard behavior:
- outer fieldset and legend provide group semantics;
- the options container uses `role="radiogroup"`;
- each button uses `role="radio"`, `aria-checked` and roving `tabIndex`;
- ArrowDown/ArrowRight moves to the next option;
- ArrowUp/ArrowLeft moves to the previous option;
- Home moves to the first option;
- End moves to the last option;
- selecting an option calls the parent callback with its string value.

Changing the project type clears that field's current error immediately.

## 5. Client-side validation contract

Source: `contactForm.validation.js`.

Current constants:
- `NAME_MIN_LENGTH = 2`;
- `MESSAGE_MIN_LENGTH = 10`;
- `MESSAGE_MAX_LENGTH = 1200`;
- email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`;
- required error: `This field is required`.

Initial controlled values:

```js
{
  name: "",
  email: "",
  projectType: "",
  message: "",
}
```

Initial errors use the same four keys with empty strings.

### Field rules

| Field | Client validation |
|---|---|
| name | Required after trim; at least 2 characters |
| email | Required after trim; matches the client email regex |
| projectType | Required; client checks presence |
| message | Required after trim; at least 10 and at most 1,200 characters |

On blur, ContactForm validates that field and updates only its error entry. The project type chooser clears its own error when changed.

On submit:
1. prevent native browser navigation;
2. call validateForm(values);
3. replace the full errors object;
4. if any error exists, find the first error by object order (name, email, projectType, message);
5. focus the matching element by `document.getElementsByName(firstInvalidName)[0]`;
6. do not send a request when invalid.

The form uses `noValidate`; the React validation behavior is authoritative for normal form interaction.

### Submit button state

`isValid` is derived from:
- trimmed name length >= 2;
- trimmed email passing the regex;
- non-empty project type;
- trimmed message length between 10 and 1,200;
- all current error values empty.

The ActionButton is disabled when `!isValid`. While `status === "submitting"`, the component passes a submitting status, the label changes to “Sending…” and every field/radio group is disabled.

The field UI also has HTML `maxLength` values:
- name: 80;
- email: 120;
- message: 1,200.

These maxLength attributes constrain ordinary browser typing. The current client validation helper does not itself enforce the name/email maximums; they are attributes on the rendered controls.

## 6. Client submission and response handling

Source: `contactForm.api.js`.

The client adapter calls:

```js
fetch("/api/contact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
```

The body sent by ContactForm is normalized before the call:

```js
{
  name: values.name.trim(),
  email: values.email.trim(),
  projectType: values.projectType,
  message: values.message.trim(),
}
```

There are no browser SMTP credentials and no direct email-provider API call from the client.

The adapter:
1. awaits the POST response;
2. attempts to parse JSON; malformed/empty JSON is treated as an empty object;
3. when `response.ok` is false, finds the first non-empty value in `result.errors`, otherwise uses `result.error`, otherwise uses the default “Unable to send right now. Please try again.”;
4. throws an Error with that message;
5. returns the JSON result on success.

The adapter does not currently define an AbortController, client-side timeout, retry loop or idempotency key. Browser network errors reject fetch and are caught by ContactForm's submit handler.

### ContactForm submission state machine

```text
idle
  │ submit
  ▼
validate
  ├── invalid → stay idle, show field errors, focus first invalid
  │
  └── valid
        ▼
    submitting
        ├── success response → success + modalOpen
        │                       → fields exit
        │                       → SuccessModal opens
        │
        └── rejected/HTTP error → error + submitError
                                  → fields remain
                                  → role=alert displays message

SuccessModal close / Send another message
  → handleReset()
  → initial values/errors
  → modal closed
  → submitError cleared
  → status idle
```

A successful request only means the server's `sendMail()` call resolved and the route returned `{ ok: true }`. It does not prove the email was opened or that the owner has replied.

## 7. Success modal behavior

Source: `src/app/components/ui/SuccessModal.js`.

When ContactForm sets `modalOpen=true`:
- SuccessModal is rendered through a portal into `document.body`;
- backdrop and modal animate with Motion;
- modal content receives title “Message received”;
- default message is “Thanks for reaching out. I'll get back to you soon.”;
- primary CTA is “Send another message”;
- an `open` effect stores the previously focused element;
- after 120ms, focus moves into `[data-success-modal]`;
- Escape closes the modal;
- background body scroll is locked with `overflow-hidden`;
- close cleanup removes the lock;
- when the modal closes, focus is restored to the prior element.

Closing calls ContactForm's `handleReset`, which clears values, validation errors, submission error, modal state and status. The visitor can then send another message.

### Success confirmation sound

SuccessModal independently registers:

```js
useUiSound("/mp3/confirmation-002.mp3", {
  volume: 0.35,
  interrupt: true,
});
```

The sound plays once when the mounted modal opens. When the modal closes or the effect cleans up, `stopConfirmationSound()` stops the active voice. This is a confirmed active consumer and is documented in `architecture/SOUND-ENGINEERING.md`.

The sound is supplementary. It must not determine whether the form request is considered successful.

## 8. Server API — POST /api/contact

Source: `src/app/api/contact/route.js`.

The route is a Next.js Route Handler exporting `POST(request)`. It does not require a logged-in user; the contact form is publicly usable.

The route's server processing order is important:

### Step 1 — Read server-side email configuration

It reads:
- `GMAIL_USER`;
- `GMAIL_APP_PASSWORD`;
- `CONTACT_TO_EMAIL`.

If `GMAIL_USER` or `GMAIL_APP_PASSWORD` is missing:
- return status 503;
- JSON: `{ error: "Email service is not configured yet." }`.

If `CONTACT_TO_EMAIL` is missing:
- return status 503;
- JSON: `{ error: "A receiving email address is not configured yet." }`.

The config check occurs before request JSON parsing. If SMTP config is absent, the route reports configuration failure without validating the submitted payload.

### Step 2 — Parse JSON

The server calls `request.json()`.

If parsing fails:
- return status 400;
- JSON: `{ error: "Invalid request." }`.

The endpoint expects a JSON object, not multipart form data.

### Step 3 — Independent server validation

The server does not trust the client form state. It converts and trims the four values again:

```js
const name = String(payload?.name || "").trim();
const email = String(payload?.email || "").trim();
const projectType = String(payload?.projectType || "").trim();
const message = String(payload?.message || "").trim();
```

Server rules:
- name: required; minimum 2 characters;
- email: required; same basic email regex;
- projectType: required and must exist in PROJECT_TYPE_LABELS;
- message: required; minimum 10 characters; maximum 1,200 characters.

The authoritative project type labels are:
- landing-page → Landing Page;
- web-app → Web App;
- product → Product;
- experiment → Experiment;
- other → Other.

If errors exist:
- return status 422;
- JSON: `{ errors: { name?, email?, projectType?, message? } }`.

Unknown extra payload properties are ignored.

### Step 4 — Build email content

After validation, the route calls `buildContactEmail()` with:
- normalized name;
- normalized email;
- projectType value;
- server-derived projectLabel;
- normalized message.

The label is mapped server-side. The client cannot choose an arbitrary project label for the email.

### Step 5 — Send through Nodemailer / Gmail SMTP

The Route Handler creates a Nodemailer transporter for this request:

```js
nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD with whitespace removed,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});
```

Transport facts:
- SMTP host: `smtp.gmail.com`;
- port: `465`;
- `secure: true` (TLS connection);
- authentication uses the sender Gmail account and App Password;
- all three timeout values are in milliseconds;
- the App Password is normalized with whitespace removed before it is passed to Nodemailer.

The route calls `transporter.sendMail()` with:

| Mail field | Value |
|---|---|
| from.name | Portfolio Contact |
| from.address | GMAIL_USER |
| to | CONTACT_TO_EMAIL |
| replyTo | validated visitor email |
| subject | generated by buildContactEmail() |
| text | plain-text message body |
| html | HTML email template |

The visitor's address is deliberately not used as `from`. It becomes `replyTo`, preserving sender-domain alignment while making replies convenient.

If sendMail resolves:
- call `transporter.close()`;
- return status 200 with `{ ok: true }`.

If sending throws:
- log `[contact] Gmail SMTP send failed:` plus the error message;
- return status 500 with `{ error: "Unable to send right now. Please try again." }`.

The client is not sent SMTP credentials or raw Nodemailer errors.

## 9. Email content builder

Source: `src/app/lib/contactEmail.js`.

The builder is a pure server-side message-composition helper. It returns:

```js
{
  subject,
  text,
  html,
}
```

### Subject

`New message from {name}`

### Plain text body

The text body includes:
- Name;
- Email;
- Project type label;
- Message;
- “sent from the portfolio contact form” footer.

It uses newline separators and is provided as the `text` MIME body.

### HTML email

The HTML message:
- is a full HTML document;
- uses table-based layout for email-client compatibility;
- uses inline styles rather than relying on external CSS/classes;
- has a maximum content card width of 600px;
- uses the portfolio's ivory/petrol/stone email palette;
- shows sender identity, email and project type as metadata rows;
- presents the message separately;
- includes a portfolio attribution footer.

### User content escaping

The builder defines `escapeHtml()` for:
- ampersand;
- less-than;
- greater-than;
- double quote;
- apostrophe.

It escapes the name, email and project label before they are placed in HTML metadata/headline areas; it escapes the message and converts its newlines to `<br />`.

**Verified source-review note:** the generated `subject` is interpolated directly into the HTML `<title>` element, whereas the visible heading separately escapes the name. Because subject contains user-provided name text, the HTML title interpolation is not consistently escaped. Treat this as a source-level hardening item; it was not changed in this documentation-only task.

The text body is plain text and does not require HTML escaping.

## 10. Email/data flow and retention boundary

The contact submission does not pass through the Labs authentication SMTP helper at `src/app/lib/auth/email.js`. These are separate mail-delivery configurations:

| Flow | Purpose | Environment variables |
|---|---|---|
| Portfolio contact | Send visitor's message to the owner inbox | GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO_EMAIL |
| Labs authentication | Verification/reset/password-related email | AUTH_SMTP_HOST, AUTH_SMTP_PORT, AUTH_SMTP_USER, AUTH_SMTP_PASSWORD, AUTH_SMTP_SECURE, AUTH_EMAIL_FROM |

Do not replace the contact route's Gmail SMTP values with the `AUTH_SMTP_*` values unless the mail architecture is intentionally redesigned.

Current persistence:
- no contact message is saved in MongoDB by this route;
- no contact ticket/document is created;
- no confirmation/receipt email is sent back to the visitor;
- the delivered notification exists in the configured email mailbox/provider systems.

The Privacy Policy states that contact form submissions include name, email, project type and message, are emailed to the configured inbox, and may remain in the mailbox/provider systems until deleted under their retention practices. The form also links to `/privacy`.

## 11. Current API response contract

| Scenario | HTTP status | JSON body shape |
|---|---:|---|
| Successful mail send | 200 | `{ ok: true }` |
| Gmail user/app password missing | 503 | `{ error: "Email service is not configured yet." }` |
| Receiving address missing | 503 | `{ error: "A receiving email address is not configured yet." }` |
| Malformed JSON body | 400 | `{ error: "Invalid request." }` |
| Field validation failure | 422 | `{ errors: { field: "message" } }` |
| SMTP/sendMail failure | 500 | `{ error: "Unable to send right now. Please try again." }` |

The client adapter extracts the first field error from `errors` when present, then the top-level `error`, then its own default error. The form displays the chosen submission error inside a `role="alert"` element.

## 12. Environment configuration and current template mismatch

### Actual environment variables used by the route

| Variable | Required | Meaning |
|---|---|---|
| GMAIL_USER | Yes | Gmail account used as SMTP sender/from address |
| GMAIL_APP_PASSWORD | Yes | Google App Password for SMTP authentication; not the normal Gmail password |
| CONTACT_TO_EMAIL | Yes | Inbox that receives contact submissions |

These values are read only in `src/app/api/contact/route.js`. They must remain server-side. Never prefix them with `NEXT_PUBLIC_`, serialize them into client props, or expose them through an API response.

### Current .env.example mismatch

The audited `.env.example` still has a “Contact form email — Resend” block with `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and comments about `RESEND_FROM_EMAIL`.

The actual current contact route imports Nodemailer and requires `GMAIL_USER`, `GMAIL_APP_PASSWORD` and `CONTACT_TO_EMAIL`. The route does not import or call Resend.

This mismatch is confirmed and should be corrected in a separate configuration change. Until then, use the route's actual Gmail variable names. Do not assume the Resend variables activate the current contact form.

The repository already records this mismatch in `operations/ENVIRONMENT-AND-RELEASE.md`; this document gives the complete contact-specific explanation.

## 13. Verified limitations and security review items

The following are findings from the inspected source. They are documented, not fixed here.

### 13.1 No route-level rate limiter is visible

The current `POST /api/contact` handler does not call a rate-limit service and does not implement a CAPTCHA/honeypot challenge. Do not claim the contact endpoint has spam throttling unless a separate platform-level control is verified and documented.

### 13.2 No explicit same-origin check is present in this handler

Unlike some owner mutation APIs, this route does not call the shared `isSameOriginMutation()` helper. Do not document it as an explicit same-origin-protected endpoint.

### 13.3 No explicit request body size limit is present in this handler

The handler calls `request.json()` and validates field lengths after parsing. The route does not declare its own request byte ceiling in the inspected file.

### 13.4 Client and server upper limits do not fully match

The browser fields have maxLength 80 for name and 120 for email. The server validator currently enforces minimum name length and email syntax but does not enforce those same upper bounds. The browser's maxLength is not a server security rule.

Message maximum 1,200 is enforced both client- and server-side.

### 13.5 HTML email title uses an unescaped subject

The subject includes user-controlled name text and is interpolated into the HTML title without calling `escapeHtml(subject)`. The visible email heading is escaped. Treat title escaping as a hardening item.

### 13.6 Transporter close is success-path only

The contact route calls `transporter.close()` after a successful `sendMail()`. The current catch branch does not use a `finally` block to close a transporter if `sendMail()` throws. The separate Labs auth email helper uses a finally cleanup pattern; do not assume the contact path currently does.

### 13.7 No idempotency/deduplication key

The client adapter does not send an idempotency token, and the server route does not persist a request ID. A visitor retry after an ambiguous network failure may send a duplicate email if the first SMTP send succeeded but the HTTP response did not reach the browser.

### 13.8 No delivery/read receipt

A successful `sendMail()` call reports acceptance by the SMTP transport; the app does not track downstream delivery, mailbox placement, opening or response.

### 13.9 No visitor confirmation email

The visitor sees an on-page success modal. The route sends only the owner notification, not a separate confirmation email to the visitor.

## 14. Safe edit guide for human developers and AI agents

### A. Add or rename a form field

1. Add it to `INITIAL_FORM_VALUES` and `INITIAL_FORM_ERRORS`.
2. Add its client `validateField` rule and include it in `validateForm` and `isFormValid`.
3. Add its controlled UI to `ContactFormFields.js`.
4. Wire `handleChange`, `handleBlur` or a dedicated callback in `ContactForm.js`.
5. Add it to the JSON object passed to `submitContactForm()`.
6. Add independent server validation in `api/contact/route.js`.
7. Add it to the values passed to `buildContactEmail()`.
8. Add it to both plain-text and HTML email output, escaping any user-controlled HTML.
9. Update the Privacy Policy if the personal information collected/used changes.
10. Update this document and direct API tests.

Changing only the UI or client validation does not add a field to the delivered email.

### B. Change email presentation

1. Modify `buildContactEmail()` in `src/app/lib/contactEmail.js`.
2. Keep both `text` and `html` versions.
3. Escape all user-controlled values at every HTML insertion point.
4. Use email-client-safe table layout and inline styles.
5. Keep the subject and HTML `<title>` safe.
6. Verify long names, long text, special characters and multiline messages.
7. Do not add external image/font dependencies without testing common email clients.

### C. Change SMTP provider

Treat it as a server architecture change:
1. Decide which provider owns the contact-mail transport, separately from Labs auth mail.
2. Add server-only environment variables and update `.env.example`.
3. update transporter creation, TLS/port/auth and timeout policy.
4. preserve `from` as a verified sender for the provider.
5. preserve visitor address in `replyTo` unless deliberately redesigned.
6. update environment/release documentation.
7. test success, missing configuration, invalid credentials, timeout and rejected delivery.
8. never send provider credentials to the client.

### D. Add anti-spam controls (future hardening)

Before implementing, decide the accepted strategy:
- server-side rate limiting with a trusted key/source;
- honeypot field and server validation;
- optional challenge (only if justified by spam);
- request size bound;
- same-origin/Origin policy;
- duplicate-submit/idempotency handling.

All protections must execute server-side; a disabled button or client-only CAPTCHA UI is not sufficient. Do not silently claim any of these controls already exist.

### E. Add visitor auto-reply (future product decision)

A visitor receipt would be a second email with different content and deliverability concerns. It is not part of the current owner-notification flow. Add explicit requirements, abuse controls and a safe reply policy before implementing it.

## 15. Manual verification checklist

### Client
- [ ] Empty submit is blocked and first invalid field receives focus.
- [ ] Name minimum and email format errors appear on blur.
- [ ] Project type radio group supports arrow keys, Home and End.
- [ ] Changing project type clears its validation error.
- [ ] Message counter updates and the 1,200-character limit is enforced by the control.
- [ ] Submit button disabled until form state is valid.
- [ ] All fields disabled while submitting.
- [ ] Network rejection leaves the entered form values intact.
- [ ] Server validation error appears in the submission alert.
- [ ] Success response hides the fields and opens SuccessModal.
- [ ] Closing modal resets the form and allows another message.

### API and SMTP
- [ ] Valid JSON with valid fields returns 200 and `{ ok: true }` after SMTP accepts.
- [ ] Malformed JSON returns 400.
- [ ] Invalid fields return 422 and field-keyed errors.
- [ ] Missing Gmail configuration returns 503.
- [ ] Missing receiving inbox returns 503.
- [ ] Invalid Gmail credentials/SMTP failure returns 500 with a generic client message.
- [ ] Email `from` is GMAIL_USER, `to` is CONTACT_TO_EMAIL, and `replyTo` is visitor email.
- [ ] Plain-text and HTML messages contain the same submitted information.
- [ ] Special characters and multiline content render safely in HTML.
- [ ] SMTP credentials never appear in the browser bundle, API response or logs.

### Success modal and sound
- [ ] SuccessModal moves focus into the dialog.
- [ ] Escape/backdrop/CTA close behavior works.
- [ ] Body scroll is restored on close/unmount.
- [ ] Focus returns to the prior element.
- [ ] confirmation-002.mp3 plays when the success modal opens.
- [ ] Closing the modal stops the confirmation voice.
- [ ] Blocked audio does not affect success state or modal behavior.

### Privacy and deployment
- [ ] Privacy Policy link resolves to `/privacy`.
- [ ] Contact form works on the canonical production origin.
- [ ] Gmail variables are present only in server-side deployment environment.
- [ ] Resend placeholder in `.env.example` is corrected in a dedicated configuration change.
- [ ] No email body or visitor personal data is added to application logs.

## 16. Source-of-truth rules

1. `ContactForm.js` owns client state and submit lifecycle.
2. `contactForm.validation.js` owns normal client validation; server validation remains independent.
3. `contactForm.api.js` owns the JSON HTTP request adapter and response-to-Error conversion.
4. `/api/contact/route.js` owns server config checks, server validation and SMTP dispatch.
5. `contactEmail.js` owns subject, plain-text and HTML email composition.
6. `SuccessModal.js` owns success confirmation UI, focus/scroll lifecycle and confirmation SFX.
7. `GMAIL_USER`, `GMAIL_APP_PASSWORD` and `CONTACT_TO_EMAIL` are the actual contact route environment contract.
8. `AUTH_SMTP_*` variables belong to Labs authentication email, not this contact route.
9. Update this document, Sound Engineering, Homepage Engineering, API inventory and Environment/Release docs whenever the contact flow changes.
10. Keep SMTP credentials server-only and make email a supplemental delivery action; never let email failure crash the page or discard the visitor's entered values.
