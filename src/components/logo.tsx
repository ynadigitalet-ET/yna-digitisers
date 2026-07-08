"use client";

import { useEffect, useState } from "react";

export function Logo({
  className = "h-8 w-auto md:h-9",
  showTextFallback = true,
}: {
  className?: string;
  showTextFallback?: boolean;
}) {
  const [lightError, setLightError] = useState(false);
  const [darkError, setDarkError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deferring the text-fallback decision until after mount avoids a
    // server/client hydration mismatch, since image load/error state can
    // only be known in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      {!lightError ? (
        <img
          alt="YNA Digitisers Logo"
          className={`${className} block dark:hidden object-contain transition-opacity duration-200`}
          onError={() => setLightError(true)}
          src="/logo.png"
        />
      ) : null}
      {!darkError ? (
        <img
          alt="YNA Digitisers Logo"
          className={`${className} hidden dark:block object-contain transition-opacity duration-200`}
          onError={() => setDarkError(true)}
          src="/logo-black.png"
        />
      ) : null}

      {(!mounted || lightError || darkError || !showTextFallback) && (
        <span
          className={`text-xl font-extrabold tracking-tight md:text-2xl ${
            mounted && !lightError && !darkError
              ? "sr-only"
              : mounted && lightError && !darkError
              ? "block dark:hidden"
              : mounted && darkError && !lightError
              ? "hidden dark:block"
              : ""
          }`}
        >
          <span className="text-brand-blue">YNA</span> Digitisers
        </span>
      )}
    </div>
  );
}
