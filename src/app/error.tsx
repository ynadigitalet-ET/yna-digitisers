"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/icon";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <section className="section-padding">
      <div className="container-custom flex justify-center">
        <div className="card max-w-lg w-full text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <Icon name="x" className="w-7 h-7" />
          </div>
          <div>
            <h1 className="heading-3">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted">
              We hit an unexpected error. Please try again, and if the problem continues, contact us.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button className="btn-primary" onClick={() => reset()} type="button">
              Try Again
            </button>
            <Link className="btn-secondary" href="/">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
