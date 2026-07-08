import type { Metadata } from "next";
import { ProjectRequestForm } from "@/components/forms";
import { getSiteSettings } from "@/lib/settings";
import { budgetRangesByCurrency, parseBudgetRanges } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Get a Website | YNA Digitisers",
};

export const dynamic = "force-dynamic";

const steps = [
  { title: "Submit Request", description: "Fill out the form with your project details." },
  { title: "We Contact You Within 24 Hours", description: "Our team reviews your request and reaches out." },
  { title: "We Build & Launch", description: "We design, develop, and launch your website." },
];

export default async function GetAWebsitePage() {
  const settings = await getSiteSettings();
  const budgetRanges = {
    ETB: parseBudgetRanges(settings?.budgetRangesEtb, budgetRangesByCurrency.ETB),
    USD: parseBudgetRanges(settings?.budgetRangesUsd, budgetRangesByCurrency.USD),
  };

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h1 className="heading-2 mb-4">Get Your Website</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted">Tell us about your project and we&apos;ll get back to you within 24 hours with a tailored proposal.</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <ProjectRequestForm budgetRanges={budgetRanges} />
          <div className="card h-fit">
            <h2 className="heading-3 mb-2">How It Works</h2>
            <p className="mb-6 text-sm text-muted">Three simple steps to your new website.</p>
            <div className="space-y-5">
              {steps.map((step, index) => (
                <div className="flex gap-4" key={step.title}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-black text-white">{index + 1}</span>
                  <div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
