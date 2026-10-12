/**
 * contactEmail — builds the message the portfolio sends when someone submits
 * the contact form.
 *
 * Returns { subject, text, html }. The HTML uses inline styles only (email
 * clients ignore <style> and class-based CSS), and all user content is
 * escaped before it reaches the template.
 */

const INK = "#1c1b19";
const MUTED = "#625e57";
const FAINT = "#8e8a81";
const HAIRLINE = "#ded8cf";
const BRAND = "#176b68";
const IVORY = "#f7f4ee";
const CARD = "#fffcf7";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toTextLines(values) {
  return [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Project type: ${values.projectLabel}`,
    "",
    "Message:",
    values.message,
    "",
    "— sent from the portfolio contact form",
  ].join("\n");
}

function metaRow(label, value, isLast) {
  const border = isLast
    ? ""
    : `border-bottom:1px solid ${HAIRLINE};`;
  return `
    <tr>
      <td style="padding:0 0 16px 0;${border}">
        <div style="margin:0;padding-bottom:4px;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};">${label}</div>
        <div style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.4;color:${INK};">${value}</div>
      </td>
    </tr>`;
}

export function buildContactEmail(values) {
  const subject = `New message from ${values.name}`;

  const text = toTextLines(values);

  const messageHtml = escapeHtml(values.message).replace(/\n/g, "<br />");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${IVORY};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${IVORY};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${CARD};border:1px solid ${HAIRLINE};border-radius:12px;">

            <!-- Header -->
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="display:inline-block;width:10px;height:2px;background-color:${BRAND};vertical-align:middle;margin-right:8px;"></span>
                      <span style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND};">Portfolio contact</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding:22px 32px 0 32px;">
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:30px;line-height:1.15;color:${INK};">New message from ${escapeHtml(values.name)}</h1>
              </td>
            </tr>

            <!-- Brand tick -->
            <tr>
              <td style="padding:18px 32px 0 32px;">
                <span style="display:inline-block;width:48px;height:2px;background-color:${BRAND};"></span>
              </td>
            </tr>

            <!-- Meta -->
            <tr>
              <td style="padding:22px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${metaRow("Name", escapeHtml(values.name))}
                  ${metaRow("Email", escapeHtml(values.email))}
                  ${metaRow("Project type", escapeHtml(values.projectLabel), true)}
                </table>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="padding:22px 32px 28px 32px;border-top:1px solid ${HAIRLINE};">
                <div style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};">Message</div>
                <div style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:${INK};">${messageHtml}</div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:0 32px 28px 32px;">
                <div style="margin:0;border-top:1px solid ${HAIRLINE};padding-top:16px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:${FAINT};">
                  Sent from the portfolio of Vishal Kumar Choudhary
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
