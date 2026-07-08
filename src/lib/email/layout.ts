// Shared branded HTML wrapper used by every transactional email. Built with
// table-based markup and inline styles on purpose — this is the only way to
// get consistent, responsive rendering across Gmail, Outlook, Apple Mail,
// and other email clients that strip <style> blocks or modern CSS.

const BRAND_BLUE = "#2563eb";
const BRAND_DARK = "#0b1220";
const TEXT_MUTED = "#64748b";
const TEXT_BODY = "#334155";
const BORDER = "#e2e8f0";

function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://ynadigitisers.com";
  return raw.replace(/\/+$/, "");
}

export function logoUrl() {
  return `${siteUrl()}/logo.png`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Converts plain text (as written in this project's copy) into safe,
 * paragraph-separated HTML, preserving single line breaks inside a
 * paragraph as <br/>. */
export function textToHtmlParagraphs(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => `<p style="margin:0 0 16px 0;">${escapeHtml(block.trim()).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

export interface EmailLayoutOptions {
  /** Hidden preview text shown by most inboxes next to the subject line. */
  preheader?: string;
  /** Optional large heading rendered above the body copy. */
  heading?: string;
  /** Already-safe HTML for the email body (use `textToHtmlParagraphs` first). */
  bodyHtml: string;
}

export function renderEmailLayout({ preheader, heading, bodyHtml }: EmailLayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>YNA Digitisers</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial, Helvetica, sans-serif;">
    ${preheader ? `<div style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.10);">
            <tr>
              <td style="background-color:${BRAND_DARK};padding:28px 32px;text-align:center;">
                <img src="${logoUrl()}" alt="YNA Digitisers" width="140" style="display:inline-block;max-width:140px;width:140px;height:auto;border:0;outline:none;text-decoration:none;" />
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px 32px;">
                ${heading ? `<h1 style="margin:0 0 20px 0;font-size:22px;line-height:1.3;color:${BRAND_DARK};font-weight:800;">${escapeHtml(heading)}</h1>` : ""}
                <div style="font-size:15px;line-height:1.7;color:${TEXT_BODY};">
                  ${bodyHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px 32px;">
                <a href="${siteUrl()}" style="display:inline-block;background-color:${BRAND_BLUE};color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 18px;border-radius:8px;">Visit YNA Digitisers</a>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f8fafc;padding:22px 32px;text-align:center;border-top:1px solid ${BORDER};">
                <p style="margin:0;font-size:12px;font-weight:700;color:${BRAND_DARK};">YNA Digitisers</p>
                <p style="margin:6px 0 0 0;font-size:12px;color:${TEXT_MUTED};">Professional Web Design Solutions</p>
                <p style="margin:10px 0 0 0;font-size:12px;">
                  <a href="mailto:ynadigital.et@gmail.com" style="color:${BRAND_BLUE};text-decoration:none;">ynadigital.et@gmail.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
