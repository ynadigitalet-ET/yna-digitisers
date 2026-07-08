import { renderEmailLayout, textToHtmlParagraphs } from "./layout";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/** Picks a friendly first name out of a full name, defaulting to "there". */
export function firstNameOf(fullName: string | null | undefined): string {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    return "there";
  }
  return trimmed.split(/\s+/)[0];
}

/** Newsletter signups only collect an email address, so we derive a friendly
 * greeting from the address itself (e.g. "john.doe@x.com" -> "John"). */
export function nameFromEmail(email: string | null | undefined): string {
  const local = (email || "").split("@")[0] || "";
  const cleaned = local.replace(/[^a-zA-Z]+/g, " ").trim();
  if (!cleaned) {
    return "there";
  }
  const first = cleaned.split(" ")[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function build(subject: string, heading: string, preheader: string, bodyText: string): EmailTemplate {
  return {
    subject,
    html: renderEmailLayout({ heading, preheader, bodyHtml: textToHtmlParagraphs(bodyText) }),
    text: bodyText,
  };
}

/* ---------------------------------------------------------------------- */
/* 1. Newsletter subscription confirmation                                 */
/* ---------------------------------------------------------------------- */

export function newsletterWelcomeTemplate(name: string): EmailTemplate {
  const body = `Hi ${name},

Welcome to the YNA Digitisers community!

We're excited to let you know that your subscription has been successfully confirmed.

From now on, you'll receive regular updates from us, including practical web design tips, insights into the latest trends in web development, special offers, and news about what our team has been building.

We started YNA Digitisers because we're passionate about helping people and businesses establish a strong online presence, and we're glad to have you along for the journey.

If there's anything specific you'd like to hear more about, or if you ever want to unsubscribe, simply reply to this email and let us know.

Thank you again for joining us.

— The YNA Digitisers Team`;

  return build("Welcome to YNA Digitisers!", "Welcome to YNA Digitisers!", "Your subscription has been confirmed.", body);
}

/* ---------------------------------------------------------------------- */
/* 2. Telebirr payment confirmation review                                 */
/* ---------------------------------------------------------------------- */

export function telebirrApprovedTemplate(name: string): EmailTemplate {
  const body = `Hi ${name},

We're happy to confirm that your payment has been successfully received and verified.

Your project is now officially scheduled with our team, and we're looking forward to getting started.

In the next few days, we'll follow up with a detailed timeline including project milestones and what to expect throughout the process.

If you have any additional requirements, deadlines, or preferences, feel free to reply to this email.

Thank you for trusting YNA Digitisers.

— The YNA Digitisers Team`;

  return build("Pricing — Approved", "Payment Verified 🎉", "Your payment has been verified.", body);
}

export function telebirrDeniedTemplate(name: string): EmailTemplate {
  const body = `Hi ${name},

Thank you for your recent payment submission.

After reviewing it, we were unable to verify the payment.

This may be due to:

- incomplete transaction
- incorrect payment details
- missing payment proof
- mismatched information

Please review your payment details and submit again.

If you need assistance, simply reply to this email and we'll gladly help.

— The YNA Digitisers Team`;

  return build("Pricing — Denied", "We Couldn't Verify Your Payment", "We could not verify your recent payment.", body);
}

/* ---------------------------------------------------------------------- */
/* 3. Contact message review                                               */
/* ---------------------------------------------------------------------- */

export function contactApprovedTemplate(name: string, adminResponse: string): EmailTemplate {
  const body = `Hi ${name},

Thank you for reaching out.

We've reviewed your message.

${adminResponse.trim()}

If you have any further questions, please don't hesitate to contact us.

— The YNA Digitisers Team`;

  return build("Message — Approved", "We've Replied to Your Message", "Our team has responded to your message.", body);
}

export function contactDeniedTemplate(name: string, denialReason: string): EmailTemplate {
  const body = `Hi ${name},

Thank you for contacting YNA Digitisers.

We've carefully reviewed your message.

${denialReason.trim()}

We appreciate your interest in YNA Digitisers and hope to hear from you again in the future.

— The YNA Digitisers Team`;

  return build("Message — Denied", "An Update on Your Message", "Our team has reviewed your message.", body);
}

/* ---------------------------------------------------------------------- */
/* 4. Get Started (project request) review                                 */
/* ---------------------------------------------------------------------- */

export function projectApprovedTemplate(name: string): EmailTemplate {
  const body = `Hi ${name},

Great news!

Your website project request has been approved.

We're excited to work with you.

Within the next 1–2 business days, a member of our team will contact you to discuss your goals, design ideas, timeline, and project requirements.

If you have branding materials, reference websites, or additional information, feel free to reply to this email.

Thank you for choosing YNA Digitisers.

— The YNA Digitisers Team`;

  return build("Get Started — Approved", "Your Project Has Been Approved 🎉", "Your website project request has been approved.", body);
}

export function projectDeniedTemplate(name: string, denialReason: string): EmailTemplate {
  const body = `Hi ${name},

Thank you for submitting your project request.

We've carefully reviewed your request.

${denialReason.trim()}

You're always welcome to update your request and submit it again in the future.

Thank you for considering YNA Digitisers.

— The YNA Digitisers Team`;

  return build("Get Started — Denied", "An Update on Your Project Request", "Our team has reviewed your project request.", body);
}

/* ---------------------------------------------------------------------- */
/* 5. Immediate client confirmation emails (sent right after submission)   */
/* ---------------------------------------------------------------------- */

export function contactReceivedTemplate(name: string): EmailTemplate {
  const body = `Hi ${name},

Thank you for contacting YNA Digitisers. We've successfully received your message, and our team will review it as soon as possible.

We'll get back to you once we've reviewed your inquiry.

Thank you for reaching out to us!

— The YNA Digitisers Team`;

  return build("We've Received Your Message", "We've Received Your Message", "Thank you for contacting YNA Digitisers.", body);
}

export function projectReceivedTemplate(name: string): EmailTemplate {
  const body = `Hi ${name},

Thank you for submitting your website project request to YNA Digitisers.

We've successfully received your request, and our team is currently reviewing the details you provided.

We'll contact you by email once the review is complete, typically within 1–2 business days.

If you have any additional information or questions in the meantime, feel free to reply to this email.

Thank you for choosing YNA Digitisers!

— The YNA Digitisers Team`;

  return build("We've Received Your Project Request", "We've Received Your Project Request", "Your project request has been received and is under review.", body);
}

export function telebirrReceivedTemplate(name: string): EmailTemplate {
  const body = `Hi ${name},

Thank you for submitting your Telebirr payment confirmation to YNA Digitisers.

We've successfully received your submission, and our team is currently verifying your payment.

We'll notify you by email once the verification has been completed.

If you have any questions in the meantime, feel free to reply to this email.

Thank you for your patience!

— The YNA Digitisers Team`;

  return build("Payment Confirmation Received", "Payment Confirmation Received", "Your Telebirr payment confirmation has been received and is being verified.", body);
}

/* ---------------------------------------------------------------------- */
/* 6. Short internal admin notifications                                   */
/* ---------------------------------------------------------------------- */

export function adminNewNewsletterSubscriptionTemplate(): EmailTemplate {
  const body = `A new visitor has subscribed to the YNA Digitisers newsletter.

Please log in to your website's Admin Dashboard to view the subscriber.`;

  return build("New Newsletter Subscription", "New Newsletter Subscription", "A new visitor subscribed to your newsletter.", body);
}

export function adminNewContactMessageTemplate(): EmailTemplate {
  const body = `A new contact message has been received.

Please log in to your website's Admin Dashboard to review and respond.`;

  return build("New Contact Message", "New Contact Message", "You have a new contact message to review.", body);
}

export function adminNewProjectRequestTemplate(): EmailTemplate {
  const body = `A new Get Started form has been submitted.

Please review the request in the Admin Dashboard.`;

  return build("New Website Project Request", "New Website Project Request", "A new project request is waiting for review.", body);
}

export function adminNewTelebirrConfirmationTemplate(): EmailTemplate {
  const body = `A customer has submitted a Telebirr payment confirmation.

Please review it in the Admin Dashboard.`;

  return build("New Telebirr Payment Submission", "New Telebirr Payment Submission", "A new payment confirmation is waiting for review.", body);
}
