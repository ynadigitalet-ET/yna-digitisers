import Link from "next/link";
import { NewsletterForm } from "@/components/forms";
import { Icon } from "@/components/icon";
import { faqs, services, values } from "@/lib/site-data";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="container-custom flex flex-col items-center text-center">
          <div className="flex flex-col items-center text-center">
            <p className="badge mb-6">Professional Web Design Agency</p>
            <h1 className="heading-1">
              Connecting Your Business to the <span className="text-brand-blue">Digital World.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
              Professional Web Design Solutions by YNA Digitisers. We create stunning, high-performance websites tailored to your business needs, ensuring a premium digital presence that drives results.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
              <Link className="btn-primary px-8 py-4 text-base" href="/get-a-website">
                Get Started
              </Link>
              <Link className="btn-secondary px-8 py-4 text-base" href="/contact">
                Request a Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-border/30">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="heading-2 mb-4">Why Choose Us</h2>
            <p className="mx-auto max-w-2xl text-muted">We deliver exceptional web design solutions tailored to your business needs.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div className="card h-full text-center flex flex-col items-center" key={value.title}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Icon name={value.icon} className="w-6 h-6" />
                </div>
                <h3 className="heading-3 mb-2">{value.title}</h3>
                <p className="text-sm leading-6 text-muted">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="heading-2 mb-4">Our Services</h2>
              <p className="max-w-2xl text-muted">Comprehensive web design solutions to help your business thrive online.</p>
            </div>
            <Link className="btn-secondary" href="/services">
              View All Services
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div className="card group h-full transition hover:-translate-y-1 hover:border-brand-blue/50 flex flex-col" key={service.title}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition group-hover:bg-brand-blue group-hover:text-white">
                  <Icon name={service.icon} className="w-6 h-6" />
                </div>
                <h3 className="heading-3 mb-2">{service.title}</h3>
                <p className="mb-4 text-sm leading-6 text-muted flex-1">{service.description}</p>
                <div className="flex items-center justify-end pt-2 border-t border-border/50">
                  <Link className="text-sm font-medium text-brand-blue hover:underline inline-flex items-center gap-1" href="/get-a-website">
                    Learn More <Icon name="arrow-right" className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-border/30">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
            <p className="mx-auto max-w-2xl text-muted">Find answers to common questions about our web design services.</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <details className="card group !p-0 overflow-hidden" key={faq.question}>
                <summary className="cursor-pointer list-none p-5 font-semibold marker:hidden flex items-center justify-between">
                  <span>{faq.question}</span>
                  <Icon name="chevron-down" className="w-5 h-5 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2 text-muted" />
                </summary>
                <p className="border-t border-border px-5 pb-5 pt-3 text-sm leading-6 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-brand-blue text-white">
        <div className="container-custom text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
              <Icon name="mail" className="w-6 h-6" />
            </div>
            <h2 className="heading-2 mb-4 text-white">Stay Updated</h2>
            <p className="mb-8 text-white/80">Subscribe to our newsletter for web design tips, special offers, and company updates.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
