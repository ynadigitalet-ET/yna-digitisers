import type { EmailProvider } from "./types";
import { createGmailSmtpProvider } from "./providers/gmail-smtp";

const globalForEmail = globalThis as typeof globalThis & {
  __ynaEmailProvider?: EmailProvider;
};

/**
 * Central place that decides which transactional email provider the app
 * uses. Today it is Gmail SMTP (via Nodemailer). To switch to Resend or any
 * other provider later, implement a new `EmailProvider` (see `./types.ts`)
 * and return it here based on an env var (e.g. `EMAIL_PROVIDER=resend`) —
 * no business logic elsewhere needs to change because everything calls
 * `sendEmail(...)` from `./send.ts`, never the provider directly.
 */
export function getEmailProvider(): EmailProvider {
  if (globalForEmail.__ynaEmailProvider) {
    return globalForEmail.__ynaEmailProvider;
  }

  const provider = createGmailSmtpProvider();
  globalForEmail.__ynaEmailProvider = provider;
  return provider;
}
