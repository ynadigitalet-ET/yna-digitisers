import { getEmailProvider } from "./provider";
import type { SendEmailInput, SendEmailResult } from "./types";

/**
 * Sends a single transactional email through whichever provider is
 * currently configured. This function never throws — email delivery
 * problems are logged and returned as a result object so callers can decide
 * how to react (e.g. store an "email failed" status) without ever breaking
 * the user-facing flow that triggered the email.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!input.to) {
    console.error("[email] Refusing to send email without a recipient", { subject: input.subject });
    return { success: false, error: "Missing recipient" };
  }

  try {
    const provider = getEmailProvider();
    const result = await provider.send(input);

    if (!result.success) {
      // Log failures only, and avoid printing the recipient address.
      console.error(`[email] Failed to send "${input.subject}": ${result.error}`);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] ✗ Unexpected error while sending email:", {
      error: errorMessage,
      to: input.to,
      subject: input.subject,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error: errorMessage };
  }
}

/** Convenience helper used by fire-and-forget call sites (e.g. after a DB
 * insert inside a Server Action) so a slow or failing email never delays or
 * breaks the response the visitor sees. */
export function sendEmailInBackground(input: SendEmailInput): void {
  void sendEmail(input).catch((error) => {
    console.error("[email]  Background email send threw unexpectedly:", {
      error: error instanceof Error ? error.message : error,
      to: input.to,
      subject: input.subject,
    });
  });
}
