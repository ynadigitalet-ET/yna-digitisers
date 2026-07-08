"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contactMessages, newsletterSubscribers, projectRequests, telebirrConfirmations } from "@/db/schema";
import {
  notifyAdminNewContactMessage,
  notifyAdminNewNewsletterSubscriber,
  notifyAdminNewProjectRequest,
  notifyAdminNewTelebirrConfirmation,
  sendContactReceivedEmail,
  sendNewsletterWelcomeEmail,
  sendProjectReceivedEmail,
  sendTelebirrReceivedEmail,
} from "@/lib/email";
import { eq } from "drizzle-orm";
import { field, isValidEmail, isValidPhone, isWithinLength, checkRateLimit } from "@/lib/validate";
import { verifyTurnstileToken } from "@/lib/turnstile";

export type ActionState = {
  success: boolean;
  message: string;
};

/** Verifies the Turnstile token attached to a submitted form. */
async function verifyHuman(formData: FormData): Promise<ActionState | null> {
  const token = String(formData.get("cf-turnstile-response") || "");
  const result = await verifyTurnstileToken(token);
  if (!result.ok) {
    return { success: false, message: result.message || "Please complete human verification." };
  }
  return null;
}

export async function submitContactMessage(_state: ActionState, formData: FormData): Promise<ActionState> {
  const human = await verifyHuman(formData);
  if (human) return human;

  const name = field(formData, "name");
  const email = field(formData, "email");
  const subject = field(formData, "subject");
  const message = field(formData, "message");

  if (!name || !email || !subject || !message) {
    return { success: false, message: "Please fill in every required field." };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (!isWithinLength(name, 160) || !isWithinLength(subject, 255) || !isWithinLength(message, 10000)) {
    return { success: false, message: "One or more fields exceed the maximum allowed length." };
  }

  const rl = checkRateLimit(`contact:${email}`, 5, 300_000);
  if (!rl.allowed) {
    return { success: false, message: "Too many submissions. Please wait a few minutes and try again." };
  }

  try {
    await db.insert(contactMessages).values({ name, email, subject, message });
    revalidatePath("/admin/dashboard");

    // 1. Send confirmation email to the client (fire-and-forget, independent)
    try { sendContactReceivedEmail(email, name); } catch (e) { console.error("[actions] client contact confirmation email failed", e); }

    // 2. Send notification email to the admin (fire-and-forget, independent)
    try { notifyAdminNewContactMessage(); } catch (e) { console.error("[actions] admin notify failed", e); }

    return {
      success: true,
      message: "Your message has been sent successfully. Thank you for contacting YNA Digitisers. Our team will review your message and get back to you soon.",
    };
  } catch (error) {
    console.error("[actions] Failed to submit contact message", error);
    return { success: false, message: "We could not send your message right now. Please try again." };
  }
}

export async function submitProjectRequest(_state: ActionState, formData: FormData): Promise<ActionState> {
  const human = await verifyHuman(formData);
  if (human) return human;

  const fullName = field(formData, "fullName");
  const businessName = field(formData, "businessName");
  const email = field(formData, "email");
  const phone = field(formData, "phone");
  const websiteType = field(formData, "websiteType");
  const budgetAmount = field(formData, "budgetAmount");
  const budgetCurrency = field(formData, "budgetCurrency") || "ETB";
  const budgetRange = budgetAmount.includes(budgetCurrency) ? budgetAmount : `${budgetAmount} ${budgetCurrency}`.trim();
  const description = field(formData, "description");

  if (!fullName || !businessName || !email || !websiteType || !budgetAmount || !description) {
    return { success: false, message: "Please complete all required project details." };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (!isValidPhone(phone)) {
    return { success: false, message: "Please enter a valid phone number." };
  }
  if (!isWithinLength(fullName, 160) || !isWithinLength(businessName, 180) || !isWithinLength(description, 10000)) {
    return { success: false, message: "One or more fields exceed the maximum allowed length." };
  }
  if (!["ETB", "USD"].includes(budgetCurrency)) {
    return { success: false, message: "Invalid currency selected." };
  }

  const rl = checkRateLimit(`project:${email}`, 3, 600_000);
  if (!rl.allowed) {
    return { success: false, message: "Too many submissions. Please wait a few minutes and try again." };
  }

  try {
    await db.insert(projectRequests).values({ fullName, businessName, email, phone, websiteType, budgetRange, budgetAmount, budgetCurrency, description });
    revalidatePath("/admin/dashboard");

    // 1. Send confirmation email to the client (fire-and-forget, independent)
    try { sendProjectReceivedEmail(email, fullName); } catch (e) { console.error("[actions] client project confirmation email failed", e); }

    // 2. Send notification email to the admin (fire-and-forget, independent)
    try { notifyAdminNewProjectRequest(); } catch (e) { console.error("[actions] admin notify failed", e); }

    return {
      success: true,
      message: "Your project request has been submitted successfully. Thank you for choosing YNA Digitisers. Our team is currently reviewing your project request. We'll contact you by email once the review is complete.",
    };
  } catch (error) {
    console.error("[actions] Failed to submit project request", error);
    return { success: false, message: "We could not submit your request right now. Please try again." };
  }
}

export async function submitNewsletter(_state: ActionState, formData: FormData): Promise<ActionState> {
  const human = await verifyHuman(formData);
  if (human) return human;

  const email = field(formData, "email");

  if (!isValidEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const rl = checkRateLimit(`newsletter:${email}`, 3, 300_000);
  if (!rl.allowed) {
    return { success: false, message: "Too many attempts. Please wait a few minutes." };
  }

  try {
    const inserted = await db
      .insert(newsletterSubscribers)
      .values({ email })
      .onConflictDoNothing()
      .returning({ id: newsletterSubscribers.id });

    revalidatePath("/admin/dashboard");

    if (inserted.length > 0) {
      try {
        const result = await sendNewsletterWelcomeEmail(email);
        await db
          .update(newsletterSubscribers)
          .set({ emailStatus: result.success ? "sent" : "failed", emailSentAt: result.success ? new Date() : null })
          .where(eq(newsletterSubscribers.id, inserted[0].id));
      } catch (error) {
        console.error("[actions] Failed to send newsletter welcome email", error);
      }

      try { notifyAdminNewNewsletterSubscriber(); } catch (e) { console.error("[actions] admin notify failed", e); }
    }

    return {
      success: true,
      message: "Thank you for subscribing! Welcome to the YNA Digitisers community. Your subscription has been confirmed successfully. Please check your email for your welcome message.",
    };
  } catch (error) {
    console.error("[actions] Failed to submit newsletter signup", error);
    return { success: false, message: "Newsletter signup is unavailable right now." };
  }
}

export async function submitTelebirrConfirmation(_state: ActionState, formData: FormData): Promise<ActionState> {
  const human = await verifyHuman(formData);
  if (human) return human;

  const fullName = field(formData, "fullName");
  const email = field(formData, "email");
  const phone = field(formData, "phone");
  const packageSelected = field(formData, "packageSelected");
  const telebirrRecipient = field(formData, "telebirrRecipient");
  const paymentProof = field(formData, "paymentProof");

  if (!fullName || !email || !phone || !packageSelected || !telebirrRecipient || !paymentProof) {
    return { success: false, message: "Please fill in every field and upload your proof of payment image." };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (!isValidPhone(phone)) {
    return { success: false, message: "Please enter a valid phone number." };
  }
  if (!isWithinLength(fullName, 160) || !isWithinLength(packageSelected, 120)) {
    return { success: false, message: "One or more fields exceed the maximum allowed length." };
  }

  // Basic validation that paymentProof is a data URL (from our upload endpoint)
  if (!paymentProof.startsWith("data:image/")) {
    return { success: false, message: "Invalid payment proof format. Please upload an image." };
  }

  const rl = checkRateLimit(`telebirr:${email}`, 3, 600_000);
  if (!rl.allowed) {
    return { success: false, message: "Too many submissions. Please wait a few minutes and try again." };
  }

  try {
    await db.insert(telebirrConfirmations).values({ fullName, email, phone, packageSelected, telebirrRecipient, transactionReference: "", paymentProof });
    revalidatePath("/admin/dashboard");

    // 1. Send confirmation email to the client (fire-and-forget, independent)
    try { sendTelebirrReceivedEmail(email, fullName); } catch (e) { console.error("[actions] client telebirr confirmation email failed", e); }

    // 2. Send notification email to the admin (fire-and-forget, independent)
    try { notifyAdminNewTelebirrConfirmation(); } catch (e) { console.error("[actions] admin notify failed", e); }

    return {
      success: true,
      message: "Your payment confirmation has been received. Your submission is currently being reviewed by our team. We'll notify you by email once the review has been completed.",
    };
  } catch (error) {
    console.error("[actions] Failed to submit Telebirr confirmation", error);
    return { success: false, message: "We could not confirm your payment right now. Please try again." };
  }
}
