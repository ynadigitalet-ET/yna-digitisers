"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/validate";

export type LoginState = {
  success: boolean;
  message: string;
};

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("adminEmail") || formData.get("email") || "").trim();
  const password = String(formData.get("adminPassword") || formData.get("password") || "");

  // Human verification (bot / credential-stuffing protection).
  const token = String(formData.get("cf-turnstile-response") || "");
  const human = await verifyTurnstileToken(token);
  if (!human.ok) {
    return { success: false, message: human.message || "Please complete human verification." };
  }

  // Brute-force protection: limit attempts per email address.
  const rl = checkRateLimit(`admin-login:${email || "unknown"}`, 5, 300_000);
  if (!rl.allowed) {
    return { success: false, message: "Too many login attempts. Please wait a few minutes and try again." };
  }

  try {
    const result = await verifyAdminCredentials(email, password);

    if (!result.ok) {
      return { success: false, message: result.message };
    }

    await createAdminSession(email);
    return { success: true, message: "/admin/dashboard" };
  } catch {
    return { success: false, message: "Unable to sign in right now. Please check the admin configuration and try again." };
  }
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
