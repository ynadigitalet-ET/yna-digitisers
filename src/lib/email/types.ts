// Shared types for the email system. Keeping these provider-agnostic makes it
// possible to swap the underlying transport (Gmail SMTP today, Resend or any
// other provider later) without touching any business logic that calls
// `sendEmail(...)`.

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface EmailProvider {
  /** Human readable name, useful for logging which provider handled a send. */
  name: string;
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
