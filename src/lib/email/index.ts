import { sendEmail, sendEmailInBackground } from "./send";
import type { SendEmailResult } from "./types";
import {
  adminNewContactMessageTemplate,
  adminNewNewsletterSubscriptionTemplate,
  adminNewProjectRequestTemplate,
  adminNewTelebirrConfirmationTemplate,
  contactApprovedTemplate,
  contactDeniedTemplate,
  contactReceivedTemplate,
  firstNameOf,
  nameFromEmail,
  newsletterWelcomeTemplate,
  projectApprovedTemplate,
  projectDeniedTemplate,
  projectReceivedTemplate,
  telebirrApprovedTemplate,
  telebirrDeniedTemplate,
  telebirrReceivedTemplate,
} from "./templates";

export type { SendEmailInput, SendEmailResult, EmailProvider } from "./types";
export { sendEmail, sendEmailInBackground };
export { firstNameOf, nameFromEmail };

/** The mailbox that should receive "new submission" notifications. Reuses
 * ADMIN_EMAIL (the same address used to log into the Admin Dashboard) so
 * only one env var needs to be configured. */
export function getAdminNotificationEmail(): string {
  return process.env.ADMIN_EMAIL || "ynadigital.et@gmail.com";
}

/* ---------------------------------------------------------------------- */
/* Client-facing emails                                                    */
/* ---------------------------------------------------------------------- */

export async function sendNewsletterWelcomeEmail(email: string): Promise<SendEmailResult> {
  const template = newsletterWelcomeTemplate(nameFromEmail(email));
  return sendEmail({ to: email, subject: template.subject, html: template.html, text: template.text });
}

export async function sendTelebirrApprovedEmail(to: string, fullName: string): Promise<SendEmailResult> {
  const template = telebirrApprovedTemplate(firstNameOf(fullName));
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text });
}

export async function sendTelebirrDeniedEmail(to: string, fullName: string): Promise<SendEmailResult> {
  const template = telebirrDeniedTemplate(firstNameOf(fullName));
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text });
}

export async function sendContactApprovedEmail(to: string, name: string, adminResponse: string): Promise<SendEmailResult> {
  const template = contactApprovedTemplate(firstNameOf(name), adminResponse);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text, replyTo: getAdminNotificationEmail() });
}

export async function sendContactDeniedEmail(to: string, name: string, denialReason: string): Promise<SendEmailResult> {
  const template = contactDeniedTemplate(firstNameOf(name), denialReason);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text, replyTo: getAdminNotificationEmail() });
}

export async function sendProjectApprovedEmail(to: string, fullName: string): Promise<SendEmailResult> {
  const template = projectApprovedTemplate(firstNameOf(fullName));
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text, replyTo: getAdminNotificationEmail() });
}

export async function sendProjectDeniedEmail(to: string, fullName: string, denialReason: string): Promise<SendEmailResult> {
  const template = projectDeniedTemplate(firstNameOf(fullName), denialReason);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text, replyTo: getAdminNotificationEmail() });
}

/* ---------------------------------------------------------------------- */
/* Immediate client confirmation emails (sent right after form submission) */
/* ---------------------------------------------------------------------- */

export function sendContactReceivedEmail(to: string, name: string): void {
  const template = contactReceivedTemplate(firstNameOf(name));
  sendEmailInBackground({ to, subject: template.subject, html: template.html, text: template.text, replyTo: getAdminNotificationEmail() });
}

export function sendProjectReceivedEmail(to: string, fullName: string): void {
  const template = projectReceivedTemplate(firstNameOf(fullName));
  sendEmailInBackground({ to, subject: template.subject, html: template.html, text: template.text, replyTo: getAdminNotificationEmail() });
}

export function sendTelebirrReceivedEmail(to: string, fullName: string): void {
  const template = telebirrReceivedTemplate(firstNameOf(fullName));
  sendEmailInBackground({ to, subject: template.subject, html: template.html, text: template.text, replyTo: getAdminNotificationEmail() });
}

/* ---------------------------------------------------------------------- */
/* Internal admin notifications (fire-and-forget, no client data included) */
/* ---------------------------------------------------------------------- */

export function notifyAdminNewNewsletterSubscriber(): void {
  const template = adminNewNewsletterSubscriptionTemplate();
  sendEmailInBackground({ to: getAdminNotificationEmail(), subject: template.subject, html: template.html, text: template.text });
}

export function notifyAdminNewContactMessage(): void {
  const template = adminNewContactMessageTemplate();
  sendEmailInBackground({ to: getAdminNotificationEmail(), subject: template.subject, html: template.html, text: template.text });
}

export function notifyAdminNewProjectRequest(): void {
  const template = adminNewProjectRequestTemplate();
  sendEmailInBackground({ to: getAdminNotificationEmail(), subject: template.subject, html: template.html, text: template.text });
}

export function notifyAdminNewTelebirrConfirmation(): void {
  const template = adminNewTelebirrConfirmationTemplate();
  sendEmailInBackground({ to: getAdminNotificationEmail(), subject: template.subject, html: template.html, text: template.text });
}
