"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled global application error", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Arial, Helvetica, sans-serif", background: "#ffffff", color: "#0f172a" }}>
        <div style={{ maxWidth: 480, width: "100%", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Something went wrong</h1>
          <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            The application hit an unexpected error. Please try again.
          </p>
          <button
            onClick={() => reset()}
            type="button"
            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.8rem", padding: "0.85rem 1.5rem", fontWeight: 700, cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
