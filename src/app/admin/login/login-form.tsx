"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { TurnstileField } from "@/components/turnstile-field";
import { loginAction } from "./actions";

const initialState = { success: false, message: "" };

export function AdminLoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success && state.message) {
      router.replace(state.message);
    }
  }, [router, state.message, state.success]);

  return (
    <form action={action} className="card mx-auto w-full max-w-md space-y-5">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          <Logo className="h-10 w-auto" />
        </div>
        <h1 className="heading-3">Admin Portal</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage your website</p>
      </div>

      {state.message ? (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <Icon name="x" className="w-4 h-4 shrink-0" />
          <span>{state.message}</span>
        </p>
      ) : null}

      <label className="block text-sm font-semibold">
        Email <span className="text-brand-blue">*</span>
        <input autoComplete="off" className="input-field mt-2" name="adminEmail" required spellCheck={false} type="email" placeholder="Enter admin email" />
      </label>
      <label className="block text-sm font-semibold">
        Password <span className="text-brand-blue">*</span>
        <input autoComplete="off" className="input-field mt-2" name="adminPassword" required type="password" placeholder="Enter admin password" />
      </label>
      <TurnstileField />
      <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center justify-center gap-2" disabled={pending} type="submit">
        {pending ? (
          <>
            <Icon name="refresh" className="w-4 h-4 animate-spin inline" />
            <span>Signing In...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
}
