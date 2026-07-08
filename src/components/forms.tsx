"use client";

import { useActionState, useState } from "react";
import { submitContactMessage, submitNewsletter, submitProjectRequest, submitTelebirrConfirmation } from "@/app/actions";
import { Icon } from "@/components/icon";
import { TurnstileField } from "@/components/turnstile-field";
import { budgetRangesByCurrency, pricingPackages, telebirrAccounts, websiteTypes } from "@/lib/site-data";

const initialActionState = { success: false, message: "" };

function StatusMessage({ success, message }: { success: boolean; message: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
      <Icon name={success ? "check" : "x"} className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

function SubmitButton({ label, pendingLabel, pending }: { label: string; pendingLabel: string; pending: boolean }) {
  return (
    <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center justify-center gap-2" disabled={pending} type="submit">
      {pending ? (
        <>
          <Icon name="refresh" className="w-4 h-4 animate-spin" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

/** Shown in place of a form after a successful submission. Keeps the outer
 * container styling consistent with the form it replaces. */
function SuccessPanel({
  title,
  description,
  inverted = false,
}: {
  title: string;
  description: string;
  inverted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          inverted ? "bg-white/15 text-white" : "bg-green-500/10 text-green-600"
        }`}
      >
        <Icon name="check" className="w-7 h-7" />
      </div>
      <div>
        <h3 className={`heading-3 mb-2 ${inverted ? "text-white" : ""}`}>{title}</h3>
        <p className={`text-sm leading-6 ${inverted ? "text-white/80" : "text-muted"}`}>{description}</p>
      </div>
    </div>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactMessage, initialActionState);

  if (state.success) {
    return (
      <div className="card">
        <SuccessPanel
          title="Your message has been sent successfully."
          description="Thank you for contacting YNA Digitisers. Our team will review your message and get back to you soon."
        />
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5">
      <StatusMessage {...state} />
      <label className="block text-sm font-semibold">
        Name <span className="text-brand-blue">*</span>
        <input className="input-field mt-2" name="name" required />
      </label>
      <label className="block text-sm font-semibold">
        Email <span className="text-brand-blue">*</span>
        <input className="input-field mt-2" name="email" required type="email" />
      </label>
      <label className="block text-sm font-semibold">
        Subject <span className="text-brand-blue">*</span>
        <input className="input-field mt-2" name="subject" required />
      </label>
      <label className="block text-sm font-semibold">
        Message <span className="text-brand-blue">*</span>
        <textarea className="input-field mt-2 min-h-36 resize-y" name="message" required />
      </label>
      <TurnstileField />
      <SubmitButton label="Send Message" pending={pending} pendingLabel="Sending..." />
    </form>
  );
}

export function ProjectRequestForm({
  budgetRanges,
}: {
  budgetRanges?: { ETB: string[]; USD: string[] };
} = {}) {
  const [state, action, pending] = useActionState(submitProjectRequest, initialActionState);
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB");
  const ranges = {
    ETB: budgetRanges?.ETB?.length ? budgetRanges.ETB : [...budgetRangesByCurrency.ETB],
    USD: budgetRanges?.USD?.length ? budgetRanges.USD : [...budgetRangesByCurrency.USD],
  };

  if (state.success) {
    return (
      <div className="card">
        <SuccessPanel
          title="Your project request has been submitted successfully."
          description="Thank you for choosing YNA Digitisers. Our team is currently reviewing your project request. We'll contact you by email once the review is complete."
        />
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5">
      <StatusMessage {...state} />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold">
          Full Name <span className="text-brand-blue">*</span>
          <input className="input-field mt-2" name="fullName" required />
        </label>
        <label className="block text-sm font-semibold">
          Business Name <span className="text-brand-blue">*</span>
          <input className="input-field mt-2" name="businessName" required />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold">
          Email <span className="text-brand-blue">*</span>
          <input className="input-field mt-2" name="email" required type="email" />
        </label>
        <label className="block text-sm font-semibold">
          Phone
          <input className="input-field mt-2" name="phone" />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold">
          Type of Website <span className="text-brand-blue">*</span>
          <select className="input-field mt-2" defaultValue="" name="websiteType" required>
            <option disabled value="">
              Select website type
            </option>
            {websiteTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <div>
          <label className="block text-sm font-semibold">
            Budget <span className="text-brand-blue">*</span>
          </label>
          <div className="mt-2 grid grid-cols-[7rem_1fr] gap-3">
            <select
              aria-label="Budget currency"
              className="input-field"
              name="budgetCurrency"
              onChange={(event) => setCurrency(event.target.value as "ETB" | "USD")}
              value={currency}
            >
              <option value="ETB">ETB</option>
              <option value="USD">USD</option>
            </select>
            <select aria-label="Budget range" className="input-field" defaultValue="" key={currency} name="budgetAmount" required>
              <option disabled value="">
                Select budget range
              </option>
              {ranges[currency].map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <label className="block text-sm font-semibold">
        Project Description <span className="text-brand-blue">*</span>
        <textarea className="input-field mt-2 min-h-40 resize-y" name="description" required />
      </label>
      <TurnstileField />
      <SubmitButton label="Submit Request" pending={pending} pendingLabel="Submitting..." />
    </form>
  );
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(submitNewsletter, initialActionState);

  if (state.success) {
    return (
      <div className={compact ? "" : "mx-auto max-w-2xl"}>
        <SuccessPanel
          inverted
          title="Thank you for subscribing!"
          description="Welcome to the YNA Digitisers community. Your subscription has been confirmed successfully. Please check your email for your welcome message."
        />
      </div>
    );
  }

  return (
    <form action={action} className={compact ? "space-y-3" : "mx-auto max-w-2xl space-y-4"}>
      <StatusMessage {...state} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Email address"
          className="input-field flex-1 border-white/30 bg-white text-slate-950 placeholder:text-slate-500"
          name="email"
          placeholder="Enter your email"
          required
          type="email"
        />
        <button
          className="btn-secondary !border-white !bg-transparent !text-white hover:!bg-white hover:!text-brand-blue disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
          disabled={pending}
          type="submit"
        >
          {pending ? (
            <>
              <Icon name="refresh" className="w-4 h-4 animate-spin inline" />
              <span>Subscribing...</span>
            </>
          ) : (
            <span>Subscribe</span>
          )}
        </button>
      </div>
      <TurnstileField className="flex justify-center sm:justify-start" />
    </form>
  );
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function TelebirrForm() {
  const [state, action, pending] = useActionState(submitTelebirrConfirmation, initialActionState);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    setUploadError("");
    setProofUrl("");

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Please upload a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Image is too large. Please upload a file smaller than 5MB.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.url) {
        setProofUrl(data.url);
      } else {
        setUploadError(data.error || "Could not upload image.");
      }
    } catch {
      setUploadError("Could not upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (state.success) {
    return (
      <div className="card border-brand-purple/30 bg-brand-purple/5">
        <SuccessPanel
          title="Your payment confirmation has been received."
          description="Your submission is currently being reviewed by our team. We'll notify you by email once the review has been completed."
        />
      </div>
    );
  }

  return (
    <form action={action} className="card border-brand-purple/30 bg-brand-purple/5 space-y-5">
      <div>
        <h2 className="heading-3 text-brand-purple flex items-center gap-2">
          <Icon name="image" className="w-5 h-5 text-brand-purple shrink-0" />
          <span>Confirm Your Telebirr Payment</span>
        </h2>
        <p className="mt-2 text-sm text-muted">Upload a clear photo or screenshot of your Telebirr payment receipt so we can verify and start your project.</p>
      </div>
      <StatusMessage {...state} />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold">
          Full Name <span className="text-brand-blue">*</span>
          <input className="input-field mt-2" name="fullName" required placeholder="Your Full Name" />
        </label>
        <label className="block text-sm font-semibold">
          Email Address <span className="text-brand-blue">*</span>
          <input className="input-field mt-2" name="email" required type="email" placeholder="you@company.com" />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold">
          Phone Number <span className="text-brand-blue">*</span>
          <input className="input-field mt-2" name="phone" required placeholder="+251..." />
        </label>
        <label className="block text-sm font-semibold">
          Package Selected <span className="text-brand-blue">*</span>
          <select className="input-field mt-2" defaultValue="" name="packageSelected" required>
            <option disabled value="">
              Select a package
            </option>
            {pricingPackages.map((pack) => (
              <option key={pack.key} value={`${pack.name} - ${pack.etb}`}>
                {pack.name} - {pack.etb}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Telebirr Account You Sent To <span className="text-brand-blue">*</span>
        <select className="input-field mt-2 font-medium" defaultValue={telebirrAccounts[0].phone + " — " + telebirrAccounts[0].name} name="telebirrRecipient" required>
          {telebirrAccounts.map((acc) => (
            <option key={acc.id} value={`${acc.phone} — ${acc.name}`}>
              {acc.phone} ({acc.name})
            </option>
          ))}
        </select>
      </label>
      <div>
        <label className="block text-sm font-semibold">
          Proof of Payment <span className="text-brand-blue">*</span>
        </label>
        <input
          accept="image/png,image/jpeg,image/webp"
          className="input-field mt-2 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-blue file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-brand-blue-dark"
          disabled={uploading}
          name="paymentProofFile"
          onChange={(event) => handleFile(event.target.files?.[0])}
          required
          type="file"
        />
        {uploading ? <p className="mt-2 text-xs font-semibold text-brand-purple">Uploading image…</p> : null}
        {uploadError ? <p className="mt-2 text-xs font-semibold text-red-500">{uploadError}</p> : null}
        {proofUrl ? (
          <div className="mt-3 inline-block rounded-xl border border-border p-1.5">
            <img alt="Proof of payment preview" className="h-32 w-auto rounded-lg object-cover" src={proofUrl} />
          </div>
        ) : null}
        <input name="paymentProof" type="hidden" value={proofUrl} />
      </div>
      <TurnstileField />
      <SubmitButton label="Submit Confirmation" pending={pending} pendingLabel="Confirming..." />
    </form>
  );
}
