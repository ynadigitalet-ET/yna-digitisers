import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  // Review / approval workflow (drives the "Message — Approved/Denied" emails)
  reviewStatus: varchar("review_status", { length: 20 }).notNull().default("pending"),
  adminResponse: text("admin_response"),
  denialReason: text("denial_reason"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  emailStatus: varchar("email_status", { length: 20 }).notNull().default("not_sent"),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectRequests = pgTable("project_requests", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  businessName: varchar("business_name", { length: 180 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 80 }),
  websiteType: varchar("website_type", { length: 120 }).notNull(),
  budgetRange: varchar("budget_range", { length: 120 }).notNull(),
  budgetAmount: varchar("budget_amount", { length: 120 }).notNull().default(""),
  budgetCurrency: varchar("budget_currency", { length: 12 }).notNull().default("ETB"),
  description: text("description").notNull(),
  status: varchar("status", { length: 60 }).notNull().default("new"),
  // Review / approval workflow (drives the "Get Started — Approved/Denied" emails)
  reviewStatus: varchar("review_status", { length: 20 }).notNull().default("pending"),
  denialReason: text("denial_reason"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  emailStatus: varchar("email_status", { length: 20 }).notNull().default("not_sent"),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const telebirrConfirmations = pgTable("telebirr_confirmations", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 80 }).notNull(),
  packageSelected: varchar("package_selected", { length: 120 }).notNull(),
  telebirrRecipient: varchar("telebirr_recipient", { length: 160 }).notNull(),
  transactionReference: varchar("transaction_reference", { length: 180 }).notNull().default(""),
  paymentProof: text("payment_proof"),
  status: varchar("status", { length: 60 }).notNull().default("pending"),
  // Review / approval workflow (drives the "Pricing — Approved/Denied" emails)
  denialReason: text("denial_reason"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  emailStatus: varchar("email_status", { length: 20 }).notNull().default("not_sent"),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailStatus: varchar("email_status", { length: 20 }).notNull().default("not_sent"),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 240 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  author: varchar("author", { length: 120 }).notNull().default("YNA Digitisers"),
  readMinutes: integer("read_minutes").notNull().default(3),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteTitle: varchar("site_title", { length: 200 }).notNull().default("YNA Digitisers — Professional Web Design Solutions"),
  contactEmail: varchar("contact_email", { length: 255 }).notNull().default("ynadigital.et@gmail.com"),
  telebirrPhone1: varchar("telebirr_phone1", { length: 80 }).notNull().default("+251 908 029 753"),
  telebirrName1: varchar("telebirr_name1", { length: 160 }).notNull().default("Yohannes Nigatu"),
  telebirrPhone2: varchar("telebirr_phone2", { length: 80 }).notNull().default("+251994669500"),
  telebirrName2: varchar("telebirr_name2", { length: 160 }).notNull().default("Nathan Haddis"),
  telebirrPhone3: varchar("telebirr_phone3", { length: 80 }).notNull().default("+251959120225"),
  telebirrName3: varchar("telebirr_name3", { length: 160 }).notNull().default("Abenezer Ameha"),
  budgetRangesEtb: text("budget_ranges_etb").notNull().default("Below 15,000 ETB\n15,000 - 30,000 ETB\n30,000 - 60,000 ETB\n60,000 - 120,000 ETB\n120,000+ ETB\nNot Sure Yet"),
  budgetRangesUsd: text("budget_ranges_usd").notNull().default("Below $300\n$300 - $600\n$600 - $1,200\n$1,200 - $2,500\n$2,500+\nNot Sure Yet"),
  socialLinks: text("social_links").notNull().default("[]"),
  appearance: text("appearance").notNull().default('{"light":{"type":"default"},"dark":{"type":"default"}}'),
  faviconUrl: text("favicon_url"),
  homepageImages: text("homepage_images").notNull().default("[]"),
  // SEO Settings
  seoTitle: varchar("seo_title", { length: 255 }).notNull().default("YNA Digital | Professional Website Design & Development"),
  seoDescription: text("seo_description").notNull().default("YNA Digital builds fast, modern, responsive, and professional websites for businesses, startups, organizations, and individuals."),
  seoKeywords: text("seo_keywords").notNull().default("Website Design, Web Development, Business Website, Portfolio Website, Landing Page, Ecommerce Website, Next.js, React, Ethiopia, Addis Ababa, YNA Digital"),
  ogImageUrl: text("og_image_url").notNull().default("/og-image.png"),
  twitterImageUrl: text("twitter_image_url").notNull().default("/twitter-image.png"),
  companyName: varchar("company_name", { length: 255 }).notNull().default("YNA Digital"),
  companyEmail: varchar("company_email", { length: 255 }).notNull().default("ynadigital.et@gmail.com"),
  companyPhone: varchar("company_phone", { length: 80 }).notNull().default("+251 908 029 753"),
  companyAddress: text("company_address").notNull().default("Addis Ababa, Ethiopia"),
  ga4Id: varchar("ga4_id", { length: 50 }),
  gtmId: varchar("gtm_id", { length: 50 }),
  clarityId: varchar("clarity_id", { length: 50 }),
  googleVerification: varchar("google_verification", { length: 255 }),
  bingVerification: varchar("bing_verification", { length: 255 }),
  facebookVerification: varchar("facebook_verification", { length: 255 }),
  robotsIndex: boolean("robots_index").notNull().default(true),
  // Brand & Google Search settings
  siteName: varchar("site_name", { length: 160 }).notNull().default("YNA Digitisers"),
  searchLogoUrl: text("search_logo_url"),
  canonicalUrl: varchar("canonical_url", { length: 255 }).notNull().default(""),
  ogTitle: varchar("og_title", { length: 255 }).notNull().default(""),
  ogDescription: text("og_description").notNull().default(""),
  twitterTitle: varchar("twitter_title", { length: 255 }).notNull().default(""),
  twitterDescription: text("twitter_description").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type ProjectRequest = typeof projectRequests.$inferSelect;
export type TelebirrConfirmation = typeof telebirrConfirmations.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
