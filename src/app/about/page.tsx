import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { values } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About Us | YNA Digitisers",
};

export default function AboutPage() {
  return (
    <>
      <section className="section-padding">
        <div className="container-custom grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="badge mb-6">About Us</p>
            <h1 className="heading-2 mb-5">About YNA Digitisers</h1>
            <p className="text-lg leading-8 text-muted">We are a passionate team of web designers and developers dedicated to helping businesses thrive in the digital world.</p>
          </div>
          <div className="card prose-copy">
            <h2>Our Story</h2>
            <p>YNA Digitisers was founded with a simple belief: every business deserves a professional online presence, regardless of size or budget.</p>
            <p>What started as a small web design studio has grown into a full-service digital agency, helping hundreds of businesses connect with their customers online.</p>
            <p>We combine creative design with technical expertise to deliver websites that not only look stunning but also drive real business results.</p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-border/30">
        <div className="container-custom grid gap-6 md:grid-cols-2">
          <div className="card">
            <h2 className="heading-3 mb-4">Our Mission</h2>
            <p className="text-xl font-semibold leading-8 text-muted">“To make professional web design accessible to every business.”</p>
          </div>
          <div className="card">
            <h2 className="heading-3 mb-4">Our Vision</h2>
            <p className="text-xl font-semibold leading-8 text-muted">“To become the most trusted digital partner for growing businesses.”</p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="heading-2 mb-4">Why Choose Us</h2>
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
    </>
  );
}
