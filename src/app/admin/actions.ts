"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, contactMessages, newsletterSubscribers, projectRequests, siteSettings, telebirrConfirmations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { defaultBudgetRangesEtbText, defaultBudgetRangesUsdText } from "@/lib/site-data";
import { defaultAppearanceJson } from "@/lib/appearance";
import {
  sendContactApprovedEmail,
  sendContactDeniedEmail,
  sendProjectApprovedEmail,
  sendProjectDeniedEmail,
  sendTelebirrApprovedEmail,
  sendTelebirrDeniedEmail,
} from "@/lib/email";

export type AdminActionState = {
  success: boolean;
  message: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
  return `${slug || "post"}-${Date.now().toString(36)}`;
}

export async function createBlogPost(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const title = value(formData, "title");
  const excerpt = value(formData, "excerpt");
  const content = value(formData, "content");
  const imageUrl = value(formData, "imageUrl") || null;
  const published = formData.get("published") === "true" || formData.get("published") === "on";
  const readMinutes = Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200));

  if (!title || !excerpt || !content) {
    return { success: false, message: "Title, excerpt, and content are required." };
  }

  try {
    await db.insert(blogPosts).values({ title, slug: slugify(title), excerpt, content, imageUrl, published, readMinutes });
    revalidatePath("/admin/dashboard");
    revalidatePath("/blog");
    return { success: true, message: "Blog post created successfully." };
  } catch {
    return { success: false, message: "Could not create blog post." };
  }
}

export async function updateBlogPost(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const title = value(formData, "title");
  const excerpt = value(formData, "excerpt");
  const content = value(formData, "content");
  const imageUrl = value(formData, "imageUrl") || null;
  const published = formData.get("published") === "true" || formData.get("published") === "on";
  const readMinutes = Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200));

  if (!Number.isInteger(id) || !title || !excerpt || !content) {
    return { success: false, message: "Invalid post data provided." };
  }

  try {
    await db.update(blogPosts).set({ title, excerpt, content, imageUrl, published, readMinutes, updatedAt: new Date() }).where(eq(blogPosts.id, id));
    revalidatePath("/admin/dashboard");
    revalidatePath("/blog");
    return { success: true, message: "Blog post updated successfully." };
  } catch {
    return { success: false, message: "Could not update blog post." };
  }
}

export async function updateSiteSettingsAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const siteTitle = value(formData, "siteTitle") || "YNA Digitisers — Professional Web Design Solutions";
  const contactEmail = value(formData, "contactEmail") || "ynadigital.et@gmail.com";
  const telebirrPhone1 = value(formData, "telebirrPhone1") || "+251 908 029 753";
  const telebirrName1 = value(formData, "telebirrName1") || "Yohannes Nigatu";
  const telebirrPhone2 = value(formData, "telebirrPhone2") || "+251994669500";
  const telebirrName2 = value(formData, "telebirrName2") || "Nathan Haddis";
  const telebirrPhone3 = value(formData, "telebirrPhone3") || "+251959120225";
  const telebirrName3 = value(formData, "telebirrName3") || "Abenezer Ameha";
  const budgetRangesEtb = value(formData, "budgetRangesEtb") || defaultBudgetRangesEtbText;
  const budgetRangesUsd = value(formData, "budgetRangesUsd") || defaultBudgetRangesUsdText;

  // Social links arrive as parallel arrays of platform names and URLs.
  const platforms = formData.getAll("socialPlatform").map((v) => String(v).trim());
  const urls = formData.getAll("socialUrl").map((v) => String(v).trim());
  const socialItems: { platform: string; url: string }[] = [];
  for (let i = 0; i < platforms.length; i += 1) {
    const platform = platforms[i];
    let url = urls[i] || "";
    if (!platform || !url) {
      continue;
    }
    // Normalize URL
    if (url && !/^https?:\/\//i.test(url) && !url.startsWith("mailto:") && !url.startsWith("tel:") && !url.startsWith("/") && !url.startsWith("#")) {
      url = `https://${url}`;
    }
    socialItems.push({ platform, url });
  }
  const socialLinks = JSON.stringify(socialItems);

  try {
    const existing = await db.select().from(siteSettings).limit(1);
    if (existing.length > 0) {
      await db
        .update(siteSettings)
        .set({ siteTitle, contactEmail, telebirrPhone1, telebirrName1, telebirrPhone2, telebirrName2, telebirrPhone3, telebirrName3, budgetRangesEtb, budgetRangesUsd, socialLinks, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing[0].id));
    } else {
      await db.insert(siteSettings).values({
        siteTitle,
        contactEmail,
        telebirrPhone1,
        telebirrName1,
        telebirrPhone2,
        telebirrName2,
        telebirrPhone3,
        telebirrName3,
        budgetRangesEtb,
        budgetRangesUsd,
        socialLinks,
      });
    }
    revalidatePath("/");
    revalidatePath("/pricing");
    revalidatePath("/get-a-website");
    revalidatePath("/contact");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Settings updated successfully." };
  } catch {
    return { success: false, message: "Could not save settings." };
  }
}

export async function updateBrandSeoAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const siteName = value(formData, "siteName").slice(0, 160) || "YNA Digitisers";
  const seoTitle = value(formData, "seoTitle").slice(0, 255) || "YNA Digital | Professional Website Design & Development";
  const seoDescription = value(formData, "seoDescription").slice(0, 1000);
  const companyName = value(formData, "companyName").slice(0, 255) || "YNA Digitisers";
  const searchLogoUrl = value(formData, "searchLogoUrl") || null;
  const faviconUrl = value(formData, "faviconUrl") || null;
  const canonicalUrl = value(formData, "canonicalUrl").slice(0, 255);
  const ogTitle = value(formData, "ogTitle").slice(0, 255);
  const ogDescription = value(formData, "ogDescription").slice(0, 1000);
  const twitterTitle = value(formData, "twitterTitle").slice(0, 255);
  const twitterDescription = value(formData, "twitterDescription").slice(0, 1000);

  // Basic validation: canonical URL (if provided) must be a valid http(s) URL.
  if (canonicalUrl && !/^https?:\/\/[^\s]+$/i.test(canonicalUrl)) {
    return { success: false, message: "Canonical URL must be a valid http(s) URL." };
  }

  const updates = {
    siteName,
    seoTitle,
    seoDescription,
    companyName,
    searchLogoUrl,
    faviconUrl,
    canonicalUrl,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription,
    updatedAt: new Date(),
  };

  try {
    const existing = await db.select().from(siteSettings).limit(1);
    if (existing.length > 0) {
      await db.update(siteSettings).set(updates).where(eq(siteSettings.id, existing[0].id));
    } else {
      await db.insert(siteSettings).values(updates);
    }
    // Metadata is generated per-request from these settings, so revalidate
    // everything so the new brand name/logo/metadata apply instantly.
    revalidatePath("/", "layout");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Brand & SEO settings updated successfully." };
  } catch (error) {
    console.error("[admin] Failed to save brand & SEO settings", error);
    return { success: false, message: "Could not save brand settings." };
  }
}

export async function updateAppearanceAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const appearanceRaw = value(formData, "appearance");
  const faviconUrl = value(formData, "faviconUrl") || null;

  let appearance = defaultAppearanceJson;
  try {
    JSON.parse(appearanceRaw);
    appearance = appearanceRaw;
  } catch {
    appearance = defaultAppearanceJson;
  }

  try {
    const existing = await db.select().from(siteSettings).limit(1);
    if (existing.length > 0) {
      await db.update(siteSettings).set({ appearance, faviconUrl, updatedAt: new Date() }).where(eq(siteSettings.id, existing[0].id));
    } else {
      await db.insert(siteSettings).values({ appearance, faviconUrl });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Appearance and favicon updated successfully." };
  } catch {
    return { success: false, message: "Could not save appearance settings." };
  }
}

export async function updateHomepageImagesAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const imagesRaw = value(formData, "homepageImages") || "[]";

  try {
    const existing = await db.select().from(siteSettings).limit(1);
    if (existing.length > 0) {
      await db.update(siteSettings).set({ homepageImages: imagesRaw, updatedAt: new Date() }).where(eq(siteSettings.id, existing[0].id));
    } else {
      await db.insert(siteSettings).values({ homepageImages: imagesRaw });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Homepage images updated successfully." };
  } catch {
    return { success: false, message: "Could not save homepage images." };
  }
}

export async function deleteRecord(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const type = value(formData, "type");

  if (!Number.isInteger(id)) {
    return;
  }

  if (type === "contact") {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }
  if (type === "project") {
    await db.delete(projectRequests).where(eq(projectRequests.id, id));
  }
  if (type === "payment") {
    await db.delete(telebirrConfirmations).where(eq(telebirrConfirmations.id, id));
  }
  if (type === "subscriber") {
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
  }
  if (type === "post") {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    revalidatePath("/blog");
  }

  revalidatePath("/admin/dashboard");
}

export async function markContactRead(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return;
  }
  await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/dashboard");
}

export async function updateProjectStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = value(formData, "status") || "new";
  if (!Number.isInteger(id)) {
    return;
  }
  await db.update(projectRequests).set({ status }).where(eq(projectRequests.id, id));
  revalidatePath("/admin/dashboard");
}

export async function updatePaymentStatus(formData: FormData) {
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  const status = value(formData, "status") || "pending";
  if (!Number.isInteger(id)) {
    return;
  }

  const [existing] = await db.select().from(telebirrConfirmations).where(eq(telebirrConfirmations.id, id)).limit(1);

  await db
    .update(telebirrConfirmations)
    .set({ status, reviewedAt: new Date(), reviewedBy: session.email })
    .where(eq(telebirrConfirmations.id, id));

  // Only send an email when the status actually changes into verified/rejected,
  // so re-saving the same status twice doesn't spam the client.
  if (existing && existing.status !== status && (status === "verified" || status === "rejected")) {
    try {
      const result =
        status === "verified"
          ? await sendTelebirrApprovedEmail(existing.email, existing.fullName)
          : await sendTelebirrDeniedEmail(existing.email, existing.fullName);
      await db
        .update(telebirrConfirmations)
        .set({ emailStatus: result.success ? "sent" : "failed", emailSentAt: result.success ? new Date() : null })
        .where(eq(telebirrConfirmations.id, id));
    } catch (error) {
      console.error("[admin actions] Failed to send Telebirr review email", error);
    }
  }

  revalidatePath("/admin/dashboard");
}

export async function approveProjectRequest(formData: FormData) {
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return;
  }

  const [existing] = await db.select().from(projectRequests).where(eq(projectRequests.id, id)).limit(1);
  if (!existing) {
    return;
  }

  await db
    .update(projectRequests)
    .set({ reviewStatus: "approved", reviewedAt: new Date(), reviewedBy: session.email })
    .where(eq(projectRequests.id, id));

  try {
    const result = await sendProjectApprovedEmail(existing.email, existing.fullName);
    await db
      .update(projectRequests)
      .set({ emailStatus: result.success ? "sent" : "failed", emailSentAt: result.success ? new Date() : null })
      .where(eq(projectRequests.id, id));
  } catch (error) {
    console.error("[admin actions] Failed to send project approval email", error);
  }

  revalidatePath("/admin/dashboard");
}

export async function approveContactMessage(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  const adminResponse = value(formData, "adminResponse");

  if (!Number.isInteger(id)) {
    return { success: false, message: "Invalid message." };
  }
  if (!adminResponse) {
    return { success: false, message: "Please write a reply before approving." };
  }

  const [existing] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  if (!existing) {
    return { success: false, message: "Message not found." };
  }

  try {
    await db
      .update(contactMessages)
      .set({ reviewStatus: "approved", adminResponse, read: true, reviewedAt: new Date(), reviewedBy: session.email })
      .where(eq(contactMessages.id, id));

    const result = await sendContactApprovedEmail(existing.email, existing.name, adminResponse);
    await db
      .update(contactMessages)
      .set({ emailStatus: result.success ? "sent" : "failed", emailSentAt: result.success ? new Date() : null })
      .where(eq(contactMessages.id, id));

    revalidatePath("/admin/dashboard");

    if (!result.success) {
      return { success: false, message: "Reply saved, but the email could not be delivered. Please check your SMTP settings." };
    }
    return { success: true, message: "Reply sent to the client successfully." };
  } catch (error) {
    console.error("[admin actions] Failed to approve contact message", error);
    return { success: false, message: "Could not approve this message. Please try again." };
  }
}

/** Shared "Deny" handler for both contact messages and project requests. A
 * modal in the Admin Dashboard collects the required custom denial reason
 * and posts here with a `type` field of "contact" or "project". */
export async function denyRecordAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  const type = value(formData, "type");
  const denialReason = value(formData, "denialReason");

  if (!Number.isInteger(id) || (type !== "contact" && type !== "project")) {
    return { success: false, message: "Invalid request." };
  }
  if (!denialReason) {
    return { success: false, message: "Please write a denial message before sending." };
  }

  try {
    if (type === "contact") {
      const [existing] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
      if (!existing) {
        return { success: false, message: "Message not found." };
      }

      await db
        .update(contactMessages)
        .set({ reviewStatus: "denied", denialReason, read: true, reviewedAt: new Date(), reviewedBy: session.email })
        .where(eq(contactMessages.id, id));

      const result = await sendContactDeniedEmail(existing.email, existing.name, denialReason);
      await db
        .update(contactMessages)
        .set({ emailStatus: result.success ? "sent" : "failed", emailSentAt: result.success ? new Date() : null })
        .where(eq(contactMessages.id, id));

      revalidatePath("/admin/dashboard");
      if (!result.success) {
        return { success: false, message: "Saved, but the email could not be delivered. Please check your SMTP settings." };
      }
      return { success: true, message: "Denial email sent to the client." };
    }

    const [existing] = await db.select().from(projectRequests).where(eq(projectRequests.id, id)).limit(1);
    if (!existing) {
      return { success: false, message: "Request not found." };
    }

    await db
      .update(projectRequests)
      .set({ reviewStatus: "denied", denialReason, reviewedAt: new Date(), reviewedBy: session.email })
      .where(eq(projectRequests.id, id));

    const result = await sendProjectDeniedEmail(existing.email, existing.fullName, denialReason);
    await db
      .update(projectRequests)
      .set({ emailStatus: result.success ? "sent" : "failed", emailSentAt: result.success ? new Date() : null })
      .where(eq(projectRequests.id, id));

    revalidatePath("/admin/dashboard");
    if (!result.success) {
      return { success: false, message: "Saved, but the email could not be delivered. Please check your SMTP settings." };
    }
    return { success: true, message: "Denial email sent to the client." };
  } catch (error) {
    console.error("[admin actions] Failed to deny record", error);
    return { success: false, message: "Could not process this request. Please try again." };
  }
}
