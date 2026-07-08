import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { services } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Services | YNA Digitisers",
};

export default function ServicesPage() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mb-14 text-center">
          <h1 className="heading-2 mb-4">Our Services</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted">Professional web design solutions tailored to help your business succeed online.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div className="card flex h-full flex-col" key={service.title}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Icon name={service.icon} className="w-7 h-7" />
                </span>
              </div>
              <h2 className="heading-3 mb-3">{service.title}</h2>
              <p className="text-sm leading-6 text-muted">{service.description}</p>
              <ul className="my-6 space-y-3 text-sm text-muted">
                {service.features.map((feature) => (
                  <li className="flex items-center gap-2.5" key={feature}>
                    <span className="text-brand-blue">
                      <Icon name="check" className="w-4 h-4 inline" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link className="btn-primary mt-auto" href="/get-a-website">
                Get This Service
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
