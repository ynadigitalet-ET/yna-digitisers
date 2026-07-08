import nodemailer, { type Transporter } from "nodemailer";
import type { EmailProvider, SendEmailInput, SendEmailResult } from "../types";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  const secureRaw = (process.env.SMTP_SECURE ?? "true").trim().toLowerCase();
  const secure = secureRaw !== "false" && secureRaw !== "0";

  return { host, port: Number(port), secure, user, pass };
}

function fromAddress(config: SmtpConfig) {
  return process.env.EMAIL_FROM || `"YNA Digitisers" <${config.user}>`;
}

const globalForEmail = globalThis as typeof globalThis & {
  __ynaGmailSmtpTransporter?: Transporter;
};

function getTransporter(config: SmtpConfig): Transporter {
  if (globalForEmail.__ynaGmailSmtpTransporter) {
    return globalForEmail.__ynaGmailSmtpTransporter;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  globalForEmail.__ynaGmailSmtpTransporter = transporter;
  return transporter;
}

/**
 * Gmail SMTP transactional email provider built with Nodemailer.
 *
 * Reads all credentials from environment variables only:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM
 *
 * If the environment is not configured (e.g. a fresh local checkout before
 * the developer has added Gmail credentials), `send()` fails softly: it logs
 * a clear message and returns `{ success: false }` instead of throwing, so it
 * never crashes a form submission or an admin action.
 */
export function createGmailSmtpProvider(): EmailProvider {
  return {
    name: "gmail-smtp",
    async send(input: SendEmailInput): Promise<SendEmailResult> {
      const config = readSmtpConfig();

      if (!config) {
        console.error(
          "[email:gmail-smtp] SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to enable email delivery.",
          { subject: input.subject, to: input.to }
        );
        return { success: false, error: "SMTP is not configured" };
      }

      try {
        const transporter = getTransporter(config);
        const info = await transporter.sendMail({
          from: fromAddress(config),
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
          replyTo: input.replyTo,
        });

        return { success: true, id: info.messageId };
      } catch (error) {
        console.error("[email:gmail-smtp] Failed to send email", {
          to: input.to,
          subject: input.subject,
          error: error instanceof Error ? error.message : error,
        });
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown SMTP error",
        };
      }
    },
  };
}
