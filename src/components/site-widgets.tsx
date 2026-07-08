"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reading localStorage requires the browser, which is only available
    // after mount, so this one-time effect is the correct tool per React's
    // "synchronize with an external system" guidance.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(window.localStorage.getItem("yna-cookie-consent") !== "accepted");
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,760px)] -translate-x-1/2 rounded-2xl border border-border bg-background p-4 shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">
          We use cookies to improve your browsing experience and understand how visitors use the website.
        </p>
        <button
          className="btn-primary shrink-0 px-4 py-2 text-sm"
          onClick={() => {
            window.localStorage.setItem("yna-cookie-consent", "accepted");
            setVisible(false);
          }}
          type="button"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg transition hover:bg-brand-blue-dark"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      type="button"
    >
      <Icon name="arrow-right" className="w-5 h-5 -rotate-90" />
    </button>
  );
}

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-brand-blue hover:bg-muted/10 transition inline-flex items-center gap-1.5 shrink-0"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      type="button"
    >
      <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export function TawkWidget() {
  useEffect(() => {
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
    if (!propertyId || !widgetId || document.getElementById("tawk-widget-script")) {
      return;
    }
    const script = document.createElement("script");
    script.id = "tawk-widget-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
  }, []);

  return null;
}
