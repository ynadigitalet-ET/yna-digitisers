import Link from "next/link";
import { Logo } from "@/components/logo";
import { SocialLinks, parseSocialLinks } from "@/components/social-links";
import { getSiteSettings } from "@/lib/settings";
import { contactEmail, navLinks, services } from "@/lib/site-data";

export async function Footer() {
  const settings = await getSiteSettings();
  const socialLinks = parseSocialLinks(settings?.socialLinks);

  return (
    <footer className="border-t border-border bg-background">
      <div className="container-custom grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link className="inline-block" href="/">
            <Logo className="h-8 w-auto md:h-9" />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Connecting businesses to the digital world with professional web design solutions.
          </p>
          {socialLinks.length > 0 ? <SocialLinks links={socialLinks} className="mt-6" /> : null}
        </div>

        <div>
          <h3 className="font-bold">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link className="hover:text-brand-blue" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="hover:text-brand-blue" href="/get-a-website">
                Get a Website
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {services.map((service) => (
              <li key={service.title}>{service.title}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <a className="hover:text-brand-blue" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </li>
            <li>
              <Link className="hover:text-brand-blue" href="/contact">
                Send us a message
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand-blue" href="/get-a-website">
                Request a quote
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <div className="container-custom flex flex-col justify-between gap-4 text-sm text-muted md:flex-row">
          <p>© 2026 YNA Digitisers. All rights reserved.</p>
          <div className="flex gap-5">
            <Link className="hover:text-brand-blue" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-brand-blue" href="/terms">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Subtle "Website by" developer credit — tasteful branding badge */}
        <div className="container-custom mt-6 flex justify-center">
          <a
            href="https://ynadigitisers.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Made by YNA Digitisers — opens in a new tab"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/50 hover:text-brand-blue hover:shadow-[0_0_18px_-4px_var(--color-brand-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-brand-blue transition-transform duration-300 group-hover:scale-125"
            />
            <span>
              Made by <span className="font-semibold">YNA Digitisers</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
