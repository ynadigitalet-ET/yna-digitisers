import Link from "next/link";
import type { Metadata } from "next";
import { TelebirrForm } from "@/components/forms";
import { Icon } from "@/components/icon";
import { CopyButton } from "@/components/site-widgets";
import { pricingPackages, telebirrAccounts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Pricing | YNA Digitisers",
};

function paymentLink(key: string) {
  const links: Record<string, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PAYMENT_LINK,
    professional: process.env.STRIPE_PROFESSIONAL_PAYMENT_LINK,
    enterprise: process.env.STRIPE_ENTERPRISE_PAYMENT_LINK,
  };
  return links[key] || "/get-a-website";
}

export default function PricingPage() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mb-14 text-center">
          <h1 className="heading-2 mb-4">Simple, Transparent Pricing</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted">
            Choose the package that best fits your business. Pay with Stripe internationally or Telebirr locally.
          </p>
        </div>

        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="card border-brand-purple/30 bg-brand-purple/5 flex flex-col justify-between">
            <div>
              <h2 className="heading-3 text-brand-purple flex items-center gap-2">
                <Icon name="heart" className="w-6 h-6 text-brand-purple shrink-0" />
                <span>Pay with Telebirr (Ethiopia)</span>
              </h2>
              <p className="mt-4 text-sm font-semibold text-foreground">
                Send your payment to any of our verified Telebirr accounts:
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-1">
                {telebirrAccounts.map((account) => (
                  <div key={account.id} className="rounded-2xl border border-border bg-background p-4 shadow-sm transition hover:border-brand-purple/40">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                          <Icon name="smartphone" className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                          <span>Number</span>
                        </div>
                        <p className="mt-1 font-mono text-base font-bold text-foreground">{account.phone}</p>
                      </div>
                      <CopyButton value={account.phone} />
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-2">
                      <Icon name="user" className="w-3.5 h-3.5 text-muted shrink-0" />
                      <p className="text-sm font-medium text-muted">
                        Account Name: <span className="font-bold text-foreground">{account.name}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-brand-purple/20">
              <p className="text-sm text-muted">After payment, send your receipt to:</p>
              <p className="mt-1.5 font-bold flex items-center gap-2 text-foreground">
                <Icon name="mail" className="w-4 h-4 text-brand-purple shrink-0" />
                <span>ynadigital.et@gmail.com</span>
              </p>
              <p className="mt-3 text-sm text-muted flex items-center gap-1.5">
                <span>We&apos;ll confirm and start your project within 24 hours!</span>
                <Icon name="rocket" className="w-4 h-4 text-brand-purple inline shrink-0" />
              </p>
            </div>
          </div>

          <TelebirrForm />
        </div>

        <div className="mb-8 text-center">
          <p className="badge">Or Pay with Stripe</p>
          <p className="mt-3 text-sm text-muted">International card payments — secure checkout powered by Stripe.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingPackages.map((pack) => (
            <div className={`card relative flex h-full flex-col ${pack.popular ? "border-brand-blue ring-4 ring-brand-blue/10" : ""}`} key={pack.key}>
              {pack.popular ? <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-4 py-1 text-xs font-bold text-white">Most Popular</span> : null}
              <h2 className="heading-3">{pack.name}</h2>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-2xl font-black">$</span>
                <span className="text-5xl font-black tracking-tight">{pack.usd}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-brand-purple">{pack.etb} via Telebirr</p>
              <ul className="my-8 space-y-3 text-sm text-muted">
                {pack.features.map((feature) => (
                  <li className="flex items-center gap-2.5" key={feature}>
                    <span className="text-brand-blue">
                      <Icon name="check" className="w-4 h-4 inline" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link className="btn-primary mt-auto" href={paymentLink(pack.key)}>
                Buy Now — ${pack.usd}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
