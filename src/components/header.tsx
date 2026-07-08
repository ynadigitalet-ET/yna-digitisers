"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { navLinks } from "@/lib/site-data";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Reading localStorage/matchMedia requires the browser, which is only
    // available after mount, so this one-time effect is the correct tool
    // per React's "synchronize with an external system" guidance.
    const stored = window.localStorage.getItem("yna-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = stored ? stored === "dark" : prefersDark;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("yna-theme", next ? "dark" : "light");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-custom flex h-16 items-center justify-between md:h-20">
        <Link className="flex items-center" href="/" onClick={() => setOpen(false)}>
          <Logo className="h-8 w-auto md:h-9" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-blue ${active ? "text-brand-blue" : "text-muted"}`}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button aria-label="Switch theme" className="rounded-lg p-2 transition-colors hover:bg-border text-foreground" onClick={toggleTheme} type="button">
            {dark ? <Icon name="sun" className="w-5 h-5" /> : <Icon name="moon" className="w-5 h-5" />}
          </button>
          <Link className="btn-primary px-4 py-2 text-xs" href="/get-a-website">
            Get Started
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button aria-label="Switch theme" className="rounded-lg p-2 transition-colors hover:bg-border text-foreground" onClick={toggleTheme} type="button">
            {dark ? <Icon name="sun" className="w-5 h-5" /> : <Icon name="moon" className="w-5 h-5" />}
          </button>
          <button aria-label="Toggle menu" className="rounded-lg p-2 hover:bg-border text-foreground" onClick={() => setOpen((value) => !value)} type="button">
            {open ? <Icon name="x" className="w-5 h-5" /> : <Icon name="menu" className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-custom flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-border hover:text-brand-blue"
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link className="btn-primary mt-2" href="/get-a-website" onClick={() => setOpen(false)}>
              Get Started
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
