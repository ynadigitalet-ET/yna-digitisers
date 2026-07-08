"use client";

import { useActionState, useEffect, useState } from "react";
import {
  approveContactMessage,
  approveProjectRequest,
  createBlogPost,
  deleteRecord,
  denyRecordAction,
  markContactRead,
  updateAppearanceAction,
  updateBlogPost,
  updateBrandSeoAction,
  updateHomepageImagesAction,
  updatePaymentStatus,
  updateProjectStatus,
  updateSiteSettingsAction,
} from "@/app/admin/actions";
import { logoutAction } from "@/app/admin/login/actions";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import type { BlogPost, ContactMessage, NewsletterSubscriber, ProjectRequest, SiteSetting, TelebirrConfirmation } from "@/db/schema";
import { parseSocialLinks, type SocialLink } from "@/components/social-links";
import { defaultBudgetRangesEtbText, defaultBudgetRangesUsdText } from "@/lib/site-data";
import { backgroundStyle, parseAppearance, type AppearanceSettings, type BackgroundType } from "@/lib/appearance";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function ImageUploader({
  value,
  onChange,
  purpose = "generic",
  accept = "image/*",
  label = "Cover Image",
  maxSizeMb = 8,
}: {
  value: string;
  onChange: (url: string) => void;
  purpose?: string;
  accept?: string;
  label?: string;
  maxSizeMb?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
      e.target.value = "";
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          className="input-field flex-1 text-sm font-mono"
          placeholder="https://... or upload file"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="btn-secondary cursor-pointer shrink-0 text-sm py-2 px-3 flex items-center gap-2">
          <Icon name="image" className="w-4 h-4" />
          <span>{uploading ? "Uploading..." : "Upload File"}</span>
          <input type="file" accept={accept} className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {value ? (
        <div className="mt-2 relative inline-block rounded-xl overflow-hidden border border-border h-32 w-auto">
          <img src={value} alt="Preview" className="h-full w-auto object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black text-xs"
          >
            <Icon name="x" className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AdminView({
  initialContacts,
  initialRequests,
  initialPayments,
  initialSubscribers,
  initialPosts,
  settings,
  sessionEmail,
}: {
  initialContacts: ContactMessage[];
  initialRequests: ProjectRequest[];
  initialPayments: TelebirrConfirmation[];
  initialSubscribers: NewsletterSubscriber[];
  initialPosts: BlogPost[];
  settings: SiteSetting | null;
  sessionEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<"stats" | "posts" | "messages" | "requests" | "payments" | "subscribers" | "settings" | "appearance" | "homepage-images" | "brand">("stats");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dark, setDark] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postImageUrl, setPostImageUrl] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [respondingContactId, setRespondingContactId] = useState<number | null>(null);
  const [denyTarget, setDenyTarget] = useState<{ type: "contact" | "project"; id: number; label: string } | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => parseSocialLinks(settings?.socialLinks));
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => parseAppearance(settings?.appearance));
  const [faviconUrl, setFaviconUrl] = useState(settings?.faviconUrl || "");
  const [homepageImages, setHomepageImages] = useState<string[]>(() => {
    try {
      return JSON.parse(settings?.homepageImages || "[]");
    } catch {
      return [];
    }
  });

  const [createPostState, createPostAction, creatingPost] = useActionState(createBlogPost, { success: false, message: "" });
  const [homepageImagesState, homepageImagesAction, savingHomepageImages] = useActionState(updateHomepageImagesAction, { success: false, message: "" });
  const [updatePostState, updatePostAction, updatingPost] = useActionState(updateBlogPost, { success: false, message: "" });
  const [settingsState, settingsAction, savingSettings] = useActionState(updateSiteSettingsAction, { success: false, message: "" });
  const [appearanceState, appearanceAction, savingAppearance] = useActionState(updateAppearanceAction, { success: false, message: "" });
  const [approveContactState, approveContactActionHandler, approvingContact] = useActionState(approveContactMessage, { success: false, message: "" });
  const [denyState, denyActionHandler, denying] = useActionState(denyRecordAction, { success: false, message: "" });
  const [brandState, brandAction, savingBrand] = useActionState(updateBrandSeoAction, { success: false, message: "" });

  // Brand & Google Search live-preview state (drives the Google result preview).
  const [siteName, setSiteName] = useState(settings?.siteName || "YNA Digitisers");
  const [seoTitle, setSeoTitle] = useState(settings?.seoTitle || "YNA Digital | Professional Website Design & Development");
  const [seoDescription, setSeoDescription] = useState(
    settings?.seoDescription ||
      "YNA Digital builds fast, modern, responsive, and professional websites for businesses, startups, organizations, and individuals.",
  );
  const [companyName, setCompanyName] = useState(settings?.companyName || "YNA Digitisers");
  const [canonicalUrl, setCanonicalUrl] = useState(settings?.canonicalUrl || "");
  const [searchLogoUrl, setSearchLogoUrl] = useState(settings?.searchLogoUrl || "");
  const [brandFaviconUrl, setBrandFaviconUrl] = useState(settings?.faviconUrl || "");
  const [ogTitle, setOgTitle] = useState(settings?.ogTitle || "");
  const [ogDescription, setOgDescription] = useState(settings?.ogDescription || "");
  const [twitterTitle, setTwitterTitle] = useState(settings?.twitterTitle || "");
  const [twitterDescription, setTwitterDescription] = useState(settings?.twitterDescription || "");

  // Close the reply box / deny modal automatically once the action succeeds.
  // Adjusted during render (React's recommended pattern for "derive state from
  // a prop change") rather than in a useEffect, so no extra render pass is
  // needed and no lint violation is introduced by calling setState in an effect.
  const [prevApproveContactState, setPrevApproveContactState] = useState(approveContactState);
  if (approveContactState !== prevApproveContactState) {
    setPrevApproveContactState(approveContactState);
    if (approveContactState.success) {
      setRespondingContactId(null);
    }
  }

  const [prevDenyState, setPrevDenyState] = useState(denyState);
  if (denyState !== prevDenyState) {
    setPrevDenyState(denyState);
    if (denyState.success) {
      setDenyTarget(null);
    }
  }

  function updateBg(mode: "light" | "dark", patch: Partial<AppearanceSettings["light"]>) {
    setAppearance((prev) => ({ ...prev, [mode]: { ...prev[mode], ...patch } }));
  }

  function resetBg(mode: "light" | "dark") {
    setAppearance((prev) => ({ ...prev, [mode]: { type: "default" as BackgroundType } }));
  }

  useEffect(() => {
    // Reading the current theme requires the DOM, which is only available
    // after mount (this cannot be derived during render because it would
    // mismatch the server-rendered output), so a one-time effect is the
    // correct tool here per React's "synchronize with an external system" guidance.
    const isDark = document.documentElement.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("yna-theme", next ? "dark" : "light");
  }

  const filteredContacts = initialContacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "read" && c.read) || (statusFilter === "unread" && !c.read);
    return matchesSearch && matchesStatus;
  });

  const filteredRequests = initialRequests.filter((r) => {
    const matchesSearch =
      r.businessName.toLowerCase().includes(search.toLowerCase()) ||
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = initialPayments.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionReference.toLowerCase().includes(search.toLowerCase()) ||
      p.packageSelected.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPosts = initialPosts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "published" && p.published) || (statusFilter === "draft" && !p.published);
    return matchesSearch && matchesStatus;
  });

  const filteredSubscribers = initialSubscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 pb-6 border-b border-border sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Logo className="h-9 w-auto" />
          <span className="badge hidden md:inline-flex">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:inline">{sessionEmail}</span>
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted/10 text-foreground transition flex items-center gap-1.5 text-xs font-bold"
          >
            <Icon name={dark ? "sun" : "moon"} className="w-4 h-4" />
            <span>{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <form action={logoutAction}>
            <button type="submit" className="btn-secondary !py-2 !px-3 text-xs">
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-border overflow-x-auto">
        {[
          { id: "stats", label: "Overview", icon: "trending-up", count: null },
          { id: "posts", label: "Blog Posts", icon: "file-text", count: initialPosts.length },
          { id: "messages", label: "Messages", icon: "mail", count: initialContacts.length },
          { id: "requests", label: "Website Requests", icon: "briefcase", count: initialRequests.length },
          { id: "payments", label: "Payments", icon: "heart", count: initialPayments.length },
          { id: "subscribers", label: "Subscribers", icon: "user", count: initialSubscribers.length },
          { id: "settings", label: "Settings", icon: "settings", count: null },
          { id: "brand", label: "Brand & SEO", icon: "search", count: null },
          { id: "appearance", label: "Appearance", icon: "image", count: null },
          { id: "homepage-images", label: "Homepage Images", icon: "image", count: null },
        ].map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                setSearch("");
                setStatusFilter("all");
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shrink-0 ${
                active ? "bg-brand-blue text-white shadow-md" : "text-muted hover:bg-muted/10 hover:text-foreground"
              }`}
            >
              <Icon name={t.icon as any} className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
              {t.count !== null ? (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-extrabold ${active ? "bg-white/20 text-white" : "bg-muted/20 text-foreground"}`}>
                  {t.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar (except for overview, settings, appearance & homepage-images) */}
      {activeTab !== "stats" && activeTab !== "settings" && activeTab !== "appearance" && activeTab !== "homepage-images" && activeTab !== "brand" ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10 p-4 rounded-2xl border border-border">
          <div className="relative w-full sm:w-80">
            <Icon name="search" className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              className="input-field !pl-10 !py-2 text-sm"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeTab !== "subscribers" ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Icon name="filter" className="w-4 h-4 text-muted shrink-0" />
              <select className="input-field !py-2 text-sm font-semibold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                {activeTab === "posts" ? (
                  <>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </>
                ) : activeTab === "messages" ? (
                  <>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </>
                ) : activeTab === "requests" ? (
                  <>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </>
                ) : activeTab === "payments" ? (
                  <>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </>
                ) : null}
              </select>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* OVERVIEW TAB */}
      {activeTab === "stats" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid gap-5 md:grid-cols-5">
            {[
              ["Messages", initialContacts.length, "mail", "messages"],
              ["Website Requests", initialRequests.length, "briefcase", "requests"],
              ["Telebirr Payments", initialPayments.length, "heart", "payments"],
              ["Subscribers", initialSubscribers.length, "user", "subscribers"],
              ["Blog Posts", initialPosts.length, "file-text", "posts"],
            ].map(([label, count, icon, tab]) => (
              <div
                key={label as string}
                onClick={() => setActiveTab(tab as any)}
                className="card cursor-pointer hover:border-brand-blue/50 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted">{label as string}</span>
                  <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue">
                    <Icon name={icon as any} className="w-5 h-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-black">{count as number}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card space-y-4">
              <h3 className="heading-3 flex items-center gap-2">
                <Icon name="mail" className="w-5 h-5 text-brand-blue shrink-0" />
                <span>Recent Unread Messages</span>
              </h3>
              {initialContacts.filter((c) => !c.read).length === 0 ? (
                <p className="text-sm text-muted py-6 text-center">No unread messages</p>
              ) : (
                <div className="space-y-3">
                  {initialContacts
                    .filter((c) => !c.read)
                    .slice(0, 4)
                    .map((msg) => (
                      <div key={msg.id} className="p-3.5 rounded-xl border border-border bg-background flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm">{msg.subject}</p>
                          <p className="text-xs text-muted">{msg.name} • {msg.email}</p>
                        </div>
                        <form action={markContactRead}>
                          <input name="id" type="hidden" value={msg.id} />
                          <button type="submit" className="text-xs font-bold text-brand-blue hover:underline">
                            Mark Read
                          </button>
                        </form>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="card space-y-4">
              <h3 className="heading-3 flex items-center gap-2">
                <Icon name="heart" className="w-5 h-5 text-brand-purple shrink-0" />
                <span>Pending Payment Confirmations</span>
              </h3>
              {initialPayments.filter((p) => p.status === "pending").length === 0 ? (
                <p className="text-sm text-muted py-6 text-center">No pending payments</p>
              ) : (
                <div className="space-y-3">
                  {initialPayments
                    .filter((p) => p.status === "pending")
                    .slice(0, 4)
                    .map((pay) => (
                      <div key={pay.id} className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {pay.paymentProof ? (
                            <button type="button" onClick={() => setPreviewImage(pay.paymentProof ?? null)} className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                              <img src={pay.paymentProof} alt="Payment proof" className="h-full w-full object-cover" />
                            </button>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/20 text-muted">
                              <Icon name="image" className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-bold text-sm">{pay.packageSelected}</p>
                            <p className="truncate text-xs text-muted">{pay.fullName} • {pay.email}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <form action={updatePaymentStatus}>
                            <input name="id" type="hidden" value={pay.id} />
                            <input name="status" type="hidden" value="verified" />
                            <button type="submit" className="rounded-lg bg-green-500/10 p-1.5 text-green-600 hover:bg-green-500/20 text-xs font-bold flex items-center gap-1">
                              <Icon name="check" className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          </form>
                          <form action={updatePaymentStatus}>
                            <input name="id" type="hidden" value={pay.id} />
                            <input name="status" type="hidden" value="rejected" />
                            <button type="submit" className="rounded-lg bg-red-500/5 p-1.5 text-red-600 hover:bg-red-500/15 text-xs font-bold flex items-center gap-1">
                              <Icon name="x" className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BLOG POSTS TAB */}
      {activeTab === "posts" && (
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] animate-in fade-in duration-300">
          <form action={createPostAction} className="card space-y-4 h-fit sticky top-24">
            <div>
              <h2 className="heading-3 flex items-center gap-2">
                <Icon name="plus" className="w-5 h-5 text-brand-blue" />
                <span>Create Blog Post</span>
              </h2>
              <p className="mt-1 text-sm text-muted">Publish updates and tips directly to the Blog page.</p>
            </div>
            {createPostState.message ? (
              <p className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${createPostState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                <Icon name={createPostState.success ? "check" : "x"} className="w-4 h-4 shrink-0" />
                <span>{createPostState.message}</span>
              </p>
            ) : null}
            <input className="input-field" name="title" placeholder="Post title" required />
            <textarea className="input-field min-h-20" name="excerpt" placeholder="Short summary/excerpt" required />
            <textarea className="input-field min-h-48 font-sans" name="content" placeholder="Full article content (supports paragraphs)" required />
            <ImageUploader value={postImageUrl} onChange={setPostImageUrl} />
            <input type="hidden" name="imageUrl" value={postImageUrl} />
            <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
              <input defaultChecked name="published" type="checkbox" className="w-4 h-4 rounded border-border text-brand-blue focus:ring-brand-blue" />
              <span>Publish immediately</span>
            </label>
            <button className="btn-primary w-full disabled:opacity-60 inline-flex items-center justify-center gap-2" disabled={creatingPost} type="submit">
              {creatingPost ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin inline" />
                  <span>Creating Post...</span>
                </>
              ) : (
                <span>Create Blog Post</span>
              )}
            </button>
          </form>

          <div className="card space-y-4">
            <h2 className="heading-3 mb-2 flex items-center justify-between">
              <span>Existing Blog Posts</span>
              <span className="text-sm font-normal text-muted">{filteredPosts.length} posts</span>
            </h2>
            {filteredPosts.length === 0 ? <p className="text-sm text-muted py-8 text-center">No blog posts match your filter.</p> : null}
            {filteredPosts.map((post) => (
              <div key={post.id} className="rounded-2xl border border-border bg-background p-4 flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold uppercase ${post.published ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"}`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-muted">• {formatDate(post.createdAt)}</span>
                    </div>
                    <h3 className="font-bold text-lg pt-1">{post.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{post.excerpt}</p>
                  </div>
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-20 h-20 rounded-xl object-cover shrink-0 hidden sm:block border border-border" />
                  ) : null}
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => {
                      setEditingPost(post);
                      setEditImageUrl(post.imageUrl || "");
                    }}
                    type="button"
                    className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5"
                  >
                    <Icon name="edit" className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Edit</span>
                  </button>
                  <form action={deleteRecord}>
                    <input name="id" type="hidden" value={post.id} />
                    <input name="type" type="hidden" value="post" />
                    <button type="submit" className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/15 transition inline-flex items-center gap-1">
                      <Icon name="trash" className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT BLOG POST MODAL */}
      {editingPost ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="heading-3">Edit Blog Post</h3>
              <button onClick={() => setEditingPost(null)} type="button" className="p-2 hover:bg-muted/10 rounded-lg">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <form action={updatePostAction} className="space-y-4">
              <input type="hidden" name="id" value={editingPost.id} />
              {updatePostState.message ? (
                <p className={`rounded-xl px-4 py-3 text-sm ${updatePostState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                  {updatePostState.message}
                </p>
              ) : null}
              <div>
                <label className="block text-xs font-bold text-muted mb-1">Title</label>
                <input className="input-field" name="title" defaultValue={editingPost.title} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1">Excerpt</label>
                <textarea className="input-field min-h-20" name="excerpt" defaultValue={editingPost.excerpt} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1">Content</label>
                <textarea className="input-field min-h-48" name="content" defaultValue={editingPost.content} required />
              </div>
              <ImageUploader value={editImageUrl} onChange={setEditImageUrl} />
              <input type="hidden" name="imageUrl" value={editImageUrl} />
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input defaultChecked={editingPost.published} name="published" type="checkbox" value="true" className="w-4 h-4 rounded border-border text-brand-blue" />
                <span>Published</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setEditingPost(null)} type="button" className="btn-secondary">
                  Cancel
                </button>
                <button disabled={updatingPost} type="submit" className="btn-primary">
                  {updatingPost ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* MESSAGES TAB */}
      {activeTab === "messages" && (
        <div className="card space-y-4 animate-in fade-in duration-300">
          <h2 className="heading-3 mb-2 flex items-center justify-between">
            <span>Contact Messages</span>
            <span className="text-sm font-normal text-muted">{filteredContacts.length} messages</span>
          </h2>
          {filteredContacts.length === 0 ? <p className="text-sm text-muted py-8 text-center">No contact messages match your filter.</p> : null}
          {filteredContacts.map((message) => (
            <div key={message.id} className="rounded-2xl border border-border bg-background p-4 flex flex-col justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${message.read ? "bg-muted/20 text-muted" : "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"}`}>
                      {message.read ? "Read" : "Unread"}
                    </span>
                    {message.reviewStatus && message.reviewStatus !== "pending" ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                          message.reviewStatus === "approved" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                        }`}
                      >
                        {message.reviewStatus}
                      </span>
                    ) : null}
                    <span className="text-xs text-muted">• {formatDate(message.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-base pt-1">{message.subject}</h3>
                  <p className="text-xs font-semibold text-muted">{message.name} ({message.email})</p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{message.message}</p>
                  {message.reviewStatus === "approved" && message.adminResponse ? (
                    <p className="mt-3 text-sm leading-relaxed text-green-700 bg-green-500/5 border border-green-500/20 rounded-xl p-3 whitespace-pre-wrap">
                      <span className="font-bold">Your reply: </span>
                      {message.adminResponse}
                    </p>
                  ) : null}
                  {message.reviewStatus === "denied" && message.denialReason ? (
                    <p className="mt-3 text-sm leading-relaxed text-red-700 bg-red-500/5 border border-red-500/20 rounded-xl p-3 whitespace-pre-wrap">
                      <span className="font-bold">Denial reason: </span>
                      {message.denialReason}
                    </p>
                  ) : null}
                  {message.reviewStatus !== "pending" ? (
                    <p className="mt-2 text-[11px] text-muted flex items-center gap-1.5">
                      <Icon name="check" className="w-3 h-3" />
                      Reviewed {formatDate(message.reviewedAt)}
                      {message.reviewedBy ? ` by ${message.reviewedBy}` : ""}
                      {" • "}
                      {message.emailStatus === "sent" ? "Email delivered" : "Email not delivered"}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2 items-center flex-wrap shrink-0 pt-2 md:pt-0">
                  {!message.read ? (
                    <form action={markContactRead}>
                      <input name="id" type="hidden" value={message.id} />
                      <button type="submit" className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5">
                        <Icon name="check" className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Mark Read</span>
                      </button>
                    </form>
                  ) : null}
                  {message.reviewStatus === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setRespondingContactId(respondingContactId === message.id ? null : message.id)}
                        className="rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-500/15 transition inline-flex items-center gap-1"
                      >
                        <Icon name="check" className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDenyTarget({ type: "contact", id: message.id, label: message.subject })}
                        className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/15 transition inline-flex items-center gap-1"
                      >
                        <Icon name="x" className="w-3.5 h-3.5" />
                        <span>Deny</span>
                      </button>
                    </>
                  ) : null}
                  <form action={deleteRecord}>
                    <input name="id" type="hidden" value={message.id} />
                    <input name="type" type="hidden" value="contact" />
                    <button type="submit" className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/15 transition inline-flex items-center gap-1">
                      <Icon name="trash" className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </form>
                </div>
              </div>

              {respondingContactId === message.id ? (
                <form action={approveContactActionHandler} className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-3">
                  <input name="id" type="hidden" value={message.id} />
                  <label className="block text-xs font-bold text-muted">
                    Write your reply — it will be inserted into the approval email sent to {message.email}
                    <textarea className="input-field mt-2 min-h-28" name="adminResponse" placeholder="Type your custom reply here..." required />
                  </label>
                  {approveContactState.message ? (
                    <p className={`text-xs font-semibold ${approveContactState.success ? "text-green-600" : "text-red-600"}`}>{approveContactState.message}</p>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <button disabled={approvingContact} type="submit" className="btn-primary !py-1.5 !px-3 text-xs">
                      {approvingContact ? "Sending..." : "Send Reply & Approve"}
                    </button>
                    <button type="button" onClick={() => setRespondingContactId(null)} className="btn-secondary !py-1.5 !px-3 text-xs">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === "requests" && (
        <div className="card space-y-4 animate-in fade-in duration-300">
          <h2 className="heading-3 mb-2 flex items-center justify-between">
            <span>Website Project Requests</span>
            <span className="text-sm font-normal text-muted">{filteredRequests.length} requests</span>
          </h2>
          {filteredRequests.length === 0 ? <p className="text-sm text-muted py-8 text-center">No website requests match your filter.</p> : null}
          {filteredRequests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-border bg-background p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-xs uppercase tracking-wide">
                      {request.websiteType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple font-bold text-xs">
                      Budget: {request.budgetAmount ? `${request.budgetAmount} ${request.budgetCurrency || "ETB"}` : request.budgetRange}
                    </span>
                    {request.reviewStatus && request.reviewStatus !== "pending" ? (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          request.reviewStatus === "approved" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                        }`}
                      >
                        {request.reviewStatus}
                      </span>
                    ) : null}
                    <span className="text-xs text-muted">• {formatDate(request.createdAt)}</span>
                  </div>
                  <h3 className="font-extrabold text-lg pt-1">{request.businessName}</h3>
                  <p className="text-xs font-semibold text-muted">
                    Contact: {request.fullName} • {request.email} {request.phone ? `• ${request.phone}` : ""}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground bg-muted/10 p-3.5 rounded-xl border border-border/50">
                    {request.description}
                  </p>
                  {request.reviewStatus === "denied" && request.denialReason ? (
                    <p className="mt-3 text-sm leading-relaxed text-red-700 bg-red-500/5 border border-red-500/20 rounded-xl p-3 whitespace-pre-wrap">
                      <span className="font-bold">Denial reason: </span>
                      {request.denialReason}
                    </p>
                  ) : null}
                  {request.reviewStatus !== "pending" ? (
                    <p className="mt-2 text-[11px] text-muted flex items-center gap-1.5">
                      <Icon name="check" className="w-3 h-3" />
                      Reviewed {formatDate(request.reviewedAt)}
                      {request.reviewedBy ? ` by ${request.reviewedBy}` : ""}
                      {" • "}
                      {request.emailStatus === "sent" ? "Email delivered" : "Email not delivered"}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
                  <form action={updateProjectStatus} className="flex items-center gap-2">
                    <input name="id" type="hidden" value={request.id} />
                    <select className="input-field !py-1.5 !px-2.5 text-xs font-bold" defaultValue={request.status} name="status">
                      <option value="new">Status: New</option>
                      <option value="contacted">Status: Contacted</option>
                      <option value="in-progress">Status: In Progress</option>
                      <option value="completed">Status: Completed</option>
                    </select>
                    <button type="submit" className="btn-secondary !py-1.5 !px-3 text-xs font-bold">
                      Save
                    </button>
                  </form>
                  {request.reviewStatus === "pending" ? (
                    <>
                      <form action={approveProjectRequest}>
                        <input name="id" type="hidden" value={request.id} />
                        <button type="submit" className="rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-500/15 transition inline-flex items-center gap-1">
                          <Icon name="check" className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </form>
                      <button
                        type="button"
                        onClick={() => setDenyTarget({ type: "project", id: request.id, label: request.businessName })}
                        className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/15 transition inline-flex items-center gap-1"
                      >
                        <Icon name="x" className="w-3.5 h-3.5" />
                        <span>Deny</span>
                      </button>
                    </>
                  ) : null}
                  <form action={deleteRecord}>
                    <input name="id" type="hidden" value={request.id} />
                    <input name="type" type="hidden" value="project" />
                    <button type="submit" className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/15 transition inline-flex items-center gap-1">
                      <Icon name="trash" className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === "payments" && (
        <div className="card space-y-4 animate-in fade-in duration-300">
          <h2 className="heading-3 mb-2 flex items-center justify-between">
            <span>Telebirr Payment Confirmations</span>
            <span className="text-sm font-normal text-muted">{filteredPayments.length} payments</span>
          </h2>
          {filteredPayments.length === 0 ? <p className="text-sm text-muted py-8 text-center">No payment confirmations match your filter.</p> : null}
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-border bg-background p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                        payment.status === "verified"
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : payment.status === "rejected"
                          ? "bg-red-500/10 text-red-600 border border-red-500/20"
                          : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                      }`}
                    >
                      {payment.status}
                    </span>
                    {payment.status !== "pending" && payment.emailStatus ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          payment.emailStatus === "sent" ? "bg-blue-500/10 text-blue-600" : "bg-muted/20 text-muted"
                        }`}
                        title={payment.emailStatus === "sent" ? "Notification email delivered" : "Notification email not sent"}
                      >
                        <Icon name="mail" className="w-3 h-3" />
                        {payment.emailStatus === "sent" ? "Email Sent" : "Email Not Sent"}
                      </span>
                    ) : null}
                    <span className="text-xs text-muted">• {formatDate(payment.createdAt)}</span>
                  </div>
                  <h3 className="font-extrabold text-base pt-1">{payment.packageSelected}</h3>
                  <p className="text-xs font-semibold text-muted">
                    Sender: {payment.fullName} • {payment.email} • {payment.phone}
                  </p>
                  <p className="text-xs font-semibold text-brand-purple pt-1">
                    Sent To: <span className="font-mono font-bold text-foreground">{payment.telebirrRecipient}</span>
                  </p>
                  {payment.status !== "pending" ? (
                    <p className="mt-2 text-[11px] text-muted flex items-center gap-1.5">
                      <Icon name="check" className="w-3 h-3" />
                      Reviewed {formatDate(payment.reviewedAt)}
                      {payment.reviewedBy ? ` by ${payment.reviewedBy}` : ""}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0">
                  {payment.paymentProof ? (
                    <button type="button" onClick={() => setPreviewImage(payment.paymentProof ?? null)} className="block overflow-hidden rounded-xl border border-border transition hover:border-brand-purple" title="View proof of payment">
                      <img src={payment.paymentProof} alt="Proof of payment" className="h-20 w-20 object-cover" />
                    </button>
                  ) : (
                    <div className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted">
                      <Icon name="image" className="w-6 h-6" />
                      <span className="text-[10px]">No proof</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setPreviewImage(payment.paymentProof ?? null)} disabled={!payment.paymentProof} className="btn-secondary !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
                  <Icon name="external-link" className="w-3.5 h-3.5" />
                  <span>View Proof</span>
                </button>
                <form action={updatePaymentStatus}>
                  <input name="id" type="hidden" value={payment.id} />
                  <input name="status" type="hidden" value="verified" />
                  <button type="submit" className="rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-500/15 transition inline-flex items-center gap-1">
                    <Icon name="check" className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </form>
                <form action={updatePaymentStatus}>
                  <input name="id" type="hidden" value={payment.id} />
                  <input name="status" type="hidden" value="rejected" />
                  <button type="submit" className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/15 transition inline-flex items-center gap-1">
                    <Icon name="x" className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </form>
                <form action={deleteRecord} className="ml-auto">
                  <input name="id" type="hidden" value={payment.id} />
                  <input name="type" type="hidden" value="payment" />
                  <button type="submit" className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/15 transition inline-flex items-center gap-1">
                    <Icon name="trash" className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBSCRIBERS TAB */}
      {activeTab === "subscribers" && (
        <div className="card space-y-4 animate-in fade-in duration-300">
          <h2 className="heading-3 mb-2 flex items-center justify-between">
            <span>Newsletter Subscribers</span>
            <span className="text-sm font-normal text-muted">{filteredSubscribers.length} subscribers</span>
          </h2>
          {filteredSubscribers.length === 0 ? <p className="text-sm text-muted py-8 text-center">No subscribers found.</p> : null}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubscribers.map((subscriber) => (
              <div key={subscriber.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-3.5 shadow-sm">
                <div className="truncate">
                  <p className="text-sm font-bold truncate flex items-center gap-1.5">
                    <Icon name="mail" className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                    <span className="truncate">{subscriber.email}</span>
                  </p>
                  <p className="text-xs text-muted pt-0.5">{formatDate(subscriber.createdAt)}</p>
                </div>
                <form action={deleteRecord}>
                  <input name="id" type="hidden" value={subscriber.id} />
                  <input name="type" type="hidden" value="subscriber" />
                  <button type="submit" className="p-1.5 hover:bg-red-500/10 text-red-600 rounded-lg shrink-0 transition" title="Delete subscriber">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] animate-in fade-in duration-300">
          <form action={settingsAction} className="card space-y-5">
            <div>
              <h2 className="heading-3 flex items-center gap-2">
                <Icon name="settings" className="w-5 h-5 text-brand-blue" />
                <span>General Site Settings</span>
              </h2>
              <p className="mt-1 text-sm text-muted">Configure site title, support email, and payment recipients.</p>
            </div>
            {settingsState.message ? (
              <p className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${settingsState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                <Icon name={settingsState.success ? "check" : "x"} className="w-4 h-4 shrink-0" />
                <span>{settingsState.message}</span>
              </p>
            ) : null}
            <div>
              <label className="block text-xs font-bold text-muted mb-1">Website Title</label>
              <input className="input-field" name="siteTitle" defaultValue={settings?.siteTitle ?? "YNA Digitisers — Professional Web Design Solutions"} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-1">Admin / Contact Email</label>
              <input className="input-field" name="contactEmail" defaultValue={settings?.contactEmail ?? "ynadigital.et@gmail.com"} required type="email" />
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <h3 className="font-extrabold text-sm text-brand-purple flex items-center gap-2">
                <Icon name="heart" className="w-4 h-4" />
                <span>Telebirr Payment Accounts</span>
              </h3>
              {[1, 2, 3].map((n) => {
                const name = (settings?.[`telebirrName${n}` as keyof SiteSetting] as string) ?? "";
                const phone = (settings?.[`telebirrPhone${n}` as keyof SiteSetting] as string) ?? "";
                return (
                  <div key={n} className="p-3.5 rounded-xl border border-border bg-muted/10 space-y-2">
                    <p className="text-xs font-bold text-muted">Account {n}</p>
                    <input className="input-field text-sm" name={`telebirrName${n}`} defaultValue={name} placeholder="Account name" />
                    <input className="input-field text-sm font-mono" name={`telebirrPhone${n}`} defaultValue={phone} placeholder="Phone number" />
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <h3 className="font-extrabold text-sm text-brand-blue flex items-center gap-2">
                <Icon name="settings" className="w-4 h-4" />
                <span>Get Started — Budget Ranges</span>
              </h3>
              <p className="text-xs text-muted -mt-2">One option per line. These appear in the Get Started form budget dropdown.</p>
              <div>
                <label className="block text-xs font-bold text-muted mb-1">ETB Budget Ranges</label>
                <textarea
                  className="input-field min-h-40 font-mono text-sm"
                  name="budgetRangesEtb"
                  defaultValue={settings?.budgetRangesEtb ?? defaultBudgetRangesEtbText}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1">USD Budget Ranges</label>
                <textarea
                  className="input-field min-h-40 font-mono text-sm"
                  name="budgetRangesUsd"
                  defaultValue={settings?.budgetRangesUsd ?? defaultBudgetRangesUsdText}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-sm text-brand-blue flex items-center gap-2">
                  <Icon name="external-link" className="w-4 h-4" />
                  <span>Social Media Links</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSocialLinks((prev) => [...prev, { platform: "", url: "" }])}
                  className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5"
                >
                  <Icon name="plus" className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
              <p className="text-xs text-muted -mt-2">
                Add any platform (Facebook, Instagram, TikTok, Telegram, LinkedIn, YouTube, WhatsApp, X, etc.). These appear in the footer and contact page.
              </p>
              {socialLinks.length === 0 ? (
                <p className="text-xs text-muted italic">No social links yet. Click &quot;Add&quot; to create one.</p>
              ) : null}
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    className="input-field text-sm w-1/3"
                    name="socialPlatform"
                    value={link.platform}
                    placeholder="Platform"
                    onChange={(e) =>
                      setSocialLinks((prev) => prev.map((l, i) => (i === index ? { ...l, platform: e.target.value } : l)))
                    }
                  />
                  <input
                    className="input-field text-sm flex-1"
                    name="socialUrl"
                    value={link.url}
                    placeholder="https://..."
                    onChange={(e) =>
                      setSocialLinks((prev) => prev.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)))
                    }
                  />
                  <button
                    type="button"
                    aria-label="Remove social link"
                    onClick={() => setSocialLinks((prev) => prev.filter((_, i) => i !== index))}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-500/10 shrink-0 transition"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button disabled={savingSettings} type="submit" className="btn-primary w-full">
              {savingSettings ? "Saving Settings..." : "Save Settings"}
            </button>
          </form>

          <div className="card space-y-5 h-fit">
            <h2 className="heading-3 flex items-center gap-2">
              <Icon name="image" className="w-5 h-5 text-brand-blue" />
              <span>Logo & Theme Support</span>
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Your site is configured to automatically switch logos depending on the active theme:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-border bg-white text-slate-900 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm">Light Mode Logo</p>
                  <p className="text-xs text-slate-500 font-mono">logo.png</p>
                </div>
                <div className="h-10 px-4 flex items-center bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                  <img src="/logo.png" alt="Light logo" className="h-7 w-auto object-contain" />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 text-white flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm">Dark Mode Logo</p>
                  <p className="text-xs text-slate-400 font-mono">logo-black.png</p>
                </div>
                <div className="h-10 px-4 flex items-center bg-slate-900 border border-slate-800 rounded-xl shrink-0">
                  <img src="/logo-black.png" alt="Dark logo" className="h-7 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPEARANCE TAB */}
      {activeTab === "appearance" && (
        <form action={appearanceAction} className="card space-y-6 animate-in fade-in duration-300">
          <input type="hidden" name="appearance" value={JSON.stringify(appearance)} />
          <input type="hidden" name="faviconUrl" value={faviconUrl} />

          <div>
            <h2 className="heading-3 flex items-center gap-2">
              <Icon name="image" className="w-5 h-5 text-brand-blue" />
              <span>Background Customization</span>
            </h2>
            <p className="mt-1 text-sm text-muted">
              Customize the website background for Light Mode and Dark Mode. Changes apply instantly across the site after saving.
            </p>
          </div>

          {appearanceState.message ? (
            <p className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${appearanceState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
              <Icon name={appearanceState.success ? "check" : "x"} className="w-4 h-4 shrink-0" />
              <span>{appearanceState.message}</span>
            </p>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            {(["light", "dark"] as const).map((mode) => {
              const config = appearance[mode];
              const isDefault = config.type === "default";
              return (
                <div key={mode} className="rounded-2xl border border-border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm capitalize flex items-center gap-2">
                      <Icon name={mode === "light" ? "sun" : "moon"} className="w-4 h-4" />
                      <span>{mode} Mode</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => resetBg(mode)}
                      className="text-xs font-bold text-muted hover:text-red-600 inline-flex items-center gap-1"
                    >
                      <Icon name="refresh" className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="h-24 rounded-xl border border-border overflow-hidden relative" style={!isDefault ? backgroundStyle(config) : undefined}>
                    {isDefault ? <div className={`h-full w-full ${mode === "light" ? "site-background-light-default" : "site-background-dark-default"}`} /> : null}
                    <span className="absolute bottom-1.5 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white">Live Preview</span>
                  </div>

                  <label className="block text-xs font-bold text-muted">
                    Background Type
                    <select
                      className="input-field mt-1 text-sm"
                      value={config.type}
                      onChange={(e) => updateBg(mode, { type: e.target.value as BackgroundType })}
                    >
                      <option value="default">Default (Premium Gradient)</option>
                      <option value="solid">Solid Color</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Background Image</option>
                    </select>
                  </label>

                  {config.type === "solid" ? (
                    <label className="block text-xs font-bold text-muted">
                      Color
                      <input
                        type="color"
                        className="mt-1 h-10 w-full rounded-lg border border-border cursor-pointer"
                        value={config.color || "#f8fafc"}
                        onChange={(e) => updateBg(mode, { color: e.target.value })}
                      />
                    </label>
                  ) : null}

                  {config.type === "gradient" ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block text-xs font-bold text-muted">
                          From
                          <input
                            type="color"
                            className="mt-1 h-10 w-full rounded-lg border border-border cursor-pointer"
                            value={config.gradientFrom || "#2563eb"}
                            onChange={(e) => updateBg(mode, { gradientFrom: e.target.value })}
                          />
                        </label>
                        <label className="block text-xs font-bold text-muted">
                          To
                          <input
                            type="color"
                            className="mt-1 h-10 w-full rounded-lg border border-border cursor-pointer"
                            value={config.gradientTo || "#7c3aed"}
                            onChange={(e) => updateBg(mode, { gradientTo: e.target.value })}
                          />
                        </label>
                      </div>
                      <label className="block text-xs font-bold text-muted">
                        Angle ({config.gradientAngle ?? 135}°)
                        <input
                          type="range"
                          min="0"
                          max="360"
                          className="mt-1 w-full"
                          value={config.gradientAngle ?? 135}
                          onChange={(e) => updateBg(mode, { gradientAngle: Number(e.target.value) })}
                        />
                      </label>
                    </>
                  ) : null}

                  {config.type === "image" ? (
                    <ImageUploader
                      value={config.imageUrl || ""}
                      onChange={(url) => updateBg(mode, { imageUrl: url })}
                      purpose="background"
                      label={`${mode === "light" ? "Light" : "Dark"} Mode Background Image`}
                      accept="image/png,image/jpeg,image/webp"
                    />
                  ) : null}

                  {config.type === "gradient" || config.type === "image" ? (
                    <label className="flex items-center gap-2 text-xs font-bold text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!config.animated}
                        onChange={(e) => updateBg(mode, { animated: e.target.checked })}
                        className="w-4 h-4 rounded border-border text-brand-blue"
                      />
                      <span>Animated Background</span>
                    </label>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="font-extrabold text-sm text-brand-blue flex items-center gap-2">
              <Icon name="settings" className="w-4 h-4" />
              <span>Favicon / Browser Icon</span>
            </h3>
            <p className="text-xs text-muted -mt-2">Upload a .ico, .png, or .svg icon. It updates instantly across browser tabs and bookmarks.</p>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
                {faviconUrl ? <img src={faviconUrl} alt="Favicon preview" className="h-10 w-10 object-contain" /> : <Icon name="image" className="w-6 h-6 text-muted" />}
              </div>
              <div className="flex-1 space-y-2">
                <ImageUploader
                  value={faviconUrl}
                  onChange={setFaviconUrl}
                  purpose="favicon"
                  label="Favicon File"
                  accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                  maxSizeMb={2}
                />
              </div>
            </div>
            {faviconUrl ? (
              <button
                type="button"
                onClick={() => setFaviconUrl("")}
                className="text-xs font-bold text-red-600 hover:underline inline-flex items-center gap-1"
              >
                <Icon name="trash" className="w-3.5 h-3.5" />
                <span>Remove Favicon</span>
              </button>
            ) : null}
          </div>

          <button disabled={savingAppearance} type="submit" className="btn-primary w-full">
            {savingAppearance ? "Saving Appearance..." : "Save Appearance & Favicon"}
          </button>
        </form>
      )}

      {/* HOMEPAGE IMAGES TAB */}
      {activeTab === "homepage-images" && (
        <form action={homepageImagesAction} className="card space-y-6 animate-in fade-in duration-300">
          <input type="hidden" name="homepageImages" value={JSON.stringify(homepageImages)} />
          
          <div>
            <h2 className="heading-3 flex items-center gap-2">
              <Icon name="image" className="w-5 h-5 text-brand-blue" />
              <span>Homepage Image Management</span>
            </h2>
            <p className="mt-1 text-sm text-muted">
              Upload and manage images displayed on the homepage.
            </p>
          </div>

          {homepageImagesState.message ? (
            <p className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${homepageImagesState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
              <Icon name={homepageImagesState.success ? "check" : "x"} className="w-4 h-4 shrink-0" />
              <span>{homepageImagesState.message}</span>
            </p>
          ) : null}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-muted uppercase tracking-wider">Your Images</h3>
              <button
                type="button"
                onClick={() => setHomepageImages(prev => [...prev, ""])}
                className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5"
              >
                <Icon name="plus" className="w-3.5 h-3.5" />
                <span>Add Image Slot</span>
              </button>
            </div>

            {homepageImages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <Icon name="image" className="w-10 h-10 text-muted mx-auto mb-2 opacity-20" />
                <p className="text-sm text-muted italic">No homepage images yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {homepageImages.map((img, index) => (
                  <div key={index} className="card !p-3 space-y-3 relative group">
                    <div className="h-40 rounded-xl border border-border bg-muted/20 overflow-hidden">
                      {img ? (
                        <img src={img} alt={`Homepage ${index}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted opacity-40">
                          <Icon name="image" className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <ImageUploader
                      value={img}
                      onChange={(url) => setHomepageImages(prev => prev.map((item, i) => i === index ? url : item))}
                      purpose="homepage"
                      label="Upload Image"
                    />
                    <button
                      type="button"
                      onClick={() => setHomepageImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Slot"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button disabled={savingHomepageImages} type="submit" className="btn-primary w-full">
            {savingHomepageImages ? "Saving Images..." : "Save Homepage Images"}
          </button>
        </form>
      )}

      {/* BRAND & SEO TAB */}
      {activeTab === "brand" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] animate-in fade-in duration-300">
          <form action={brandAction} className="card space-y-6">
            <div>
              <h2 className="heading-3 flex items-center gap-2">
                <Icon name="search" className="w-5 h-5 text-brand-blue" />
                <span>Brand &amp; Google Search Settings</span>
              </h2>
              <p className="mt-1 text-sm text-muted">
                Control how your website appears in Google Search results, browser tabs, and social shares.
              </p>
            </div>

            {brandState.message ? (
              <p className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${brandState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                <Icon name={brandState.success ? "check" : "x"} className="w-4 h-4 shrink-0" />
                <span>{brandState.message}</span>
              </p>
            ) : null}

            {/* Hidden inputs carry the live-preview + upload values into the action */}
            <input type="hidden" name="searchLogoUrl" value={searchLogoUrl} />
            <input type="hidden" name="faviconUrl" value={brandFaviconUrl} />

            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-muted uppercase tracking-wider">Site Identity</h3>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Google Search Site Name</label>
                <input className="input-field" name="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} maxLength={160} required placeholder="YNA Digitisers" />
                <p className="mt-1 text-xs text-muted">Replaces the name shown beside your site in Google results and browser metadata.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Organization Name</label>
                <input className="input-field" name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={255} placeholder="YNA Digitisers" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Canonical URL</label>
                <input className="input-field" name="canonicalUrl" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} maxLength={255} placeholder="https://yourdomain.com" />
                <p className="mt-1 text-xs text-muted">Your primary domain (used for canonical tags &amp; structured data).</p>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-extrabold text-sm text-muted uppercase tracking-wider">Google Search Logo</h3>
              <p className="text-xs text-muted -mt-2">Recommended: 512 × 512px. PNG, JPG, SVG, or WebP.</p>
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 shrink-0 rounded-xl border border-border bg-muted/20 overflow-hidden flex items-center justify-center">
                  {searchLogoUrl ? (
                    <img src={searchLogoUrl} alt="Search logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <Icon name="image" className="w-8 h-8 text-muted opacity-40" />
                  )}
                </div>
                <div className="flex-1">
                  <ImageUploader value={searchLogoUrl} onChange={setSearchLogoUrl} purpose="favicon" accept="image/png,image/jpeg,image/svg+xml,image/webp" label="Upload Google Search Logo" maxSizeMb={5} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-extrabold text-sm text-muted uppercase tracking-wider">Favicon (Browser Tab Icon)</h3>
              <p className="text-xs text-muted -mt-2">PNG, ICO, or SVG. Updates the browser tab icon automatically.</p>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl border border-border bg-muted/20 overflow-hidden flex items-center justify-center">
                  {brandFaviconUrl ? (
                    <img src={brandFaviconUrl} alt="Favicon preview" className="w-full h-full object-contain" />
                  ) : (
                    <Icon name="image" className="w-6 h-6 text-muted opacity-40" />
                  )}
                </div>
                <div className="flex-1">
                  <ImageUploader value={brandFaviconUrl} onChange={setBrandFaviconUrl} purpose="favicon" accept="image/png,image/x-icon,image/svg+xml,image/vnd.microsoft.icon" label="Upload Favicon" maxSizeMb={2} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-extrabold text-sm text-muted uppercase tracking-wider">SEO Metadata</h3>
              <div>
                <label className="block text-sm font-semibold mb-1.5">SEO Title</label>
                <input className="input-field" name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={255} placeholder="Site title shown in search results" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Meta Description</label>
                <textarea className="input-field min-h-24" name="seoDescription" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={1000} placeholder="Short description shown under your title in search results" />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-extrabold text-sm text-muted uppercase tracking-wider">Social Sharing (Open Graph &amp; Twitter)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Open Graph Title</label>
                  <input className="input-field" name="ogTitle" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} maxLength={255} placeholder="Defaults to SEO Title" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Twitter Card Title</label>
                  <input className="input-field" name="twitterTitle" value={twitterTitle} onChange={(e) => setTwitterTitle(e.target.value)} maxLength={255} placeholder="Defaults to OG Title" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Open Graph Description</label>
                  <textarea className="input-field min-h-20" name="ogDescription" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} maxLength={1000} placeholder="Defaults to Meta Description" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Twitter Card Description</label>
                  <textarea className="input-field min-h-20" name="twitterDescription" value={twitterDescription} onChange={(e) => setTwitterDescription(e.target.value)} maxLength={1000} placeholder="Defaults to OG Description" />
                </div>
              </div>
            </div>

            <button disabled={savingBrand} type="submit" className="btn-primary w-full">
              {savingBrand ? "Saving..." : "Save Brand & SEO Settings"}
            </button>
          </form>

          {/* Live Google Search Preview */}
          <div className="space-y-6">
            <div className="card sticky top-6">
              <h3 className="font-extrabold text-sm text-muted uppercase tracking-wider mb-4">Google Search Preview</h3>
              <div className="rounded-xl border border-border bg-white p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                    {searchLogoUrl || brandFaviconUrl ? (
                      <img src={searchLogoUrl || brandFaviconUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">{(siteName || "Y").charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] leading-tight text-slate-800 truncate">{siteName || "Site Name"}</p>
                    <p className="text-[12px] leading-tight text-slate-500 truncate">
                      {(canonicalUrl || "https://yourdomain.com").replace(/^https?:\/\//, "").replace(/\/+$/, "")}
                    </p>
                  </div>
                </div>
                <p className="text-[18px] leading-snug text-[#1a0dab] hover:underline cursor-pointer truncate">
                  {seoTitle || "Your SEO Title Appears Here"}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-slate-600 line-clamp-2">
                  {seoDescription || "Your meta description appears here. Keep it clear and compelling so people click through from search results."}
                </p>
              </div>
              <p className="mt-3 text-xs text-muted leading-relaxed">
                This preview updates live as you type. Note: Google controls when search results are recrawled, so real results may take time to reflect changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DENY MODAL — used for both Contact Messages and Website Requests */}
      {denyTarget ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDenyTarget(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="card w-full max-w-lg space-y-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="heading-3">Deny {denyTarget.type === "contact" ? "Message" : "Request"}</h3>
                <p className="mt-1 text-sm text-muted">{denyTarget.label}</p>
              </div>
              <button onClick={() => setDenyTarget(null)} type="button" className="p-2 hover:bg-muted/10 rounded-lg">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <form action={denyActionHandler} className="space-y-3">
              <input name="id" type="hidden" value={denyTarget.id} />
              <input name="type" type="hidden" value={denyTarget.type} />
              <label className="block text-xs font-bold text-muted">
                Write a personalized denial message — it will be inserted into the email sent to the client.
                <textarea className="input-field mt-2 min-h-32" name="denialReason" placeholder="Explain why this is being denied..." required />
              </label>
              {denyState.message ? <p className={`text-xs font-semibold ${denyState.success ? "text-green-600" : "text-red-600"}`}>{denyState.message}</p> : null}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <button onClick={() => setDenyTarget(null)} type="button" className="btn-secondary">
                  Cancel
                </button>
                <button disabled={denying} type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-60">
                  {denying ? "Sending..." : "Send Denial Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {previewImage ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <Icon name="x" className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Proof of payment (full size)"
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
