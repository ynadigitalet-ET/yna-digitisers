import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { SocialLinks, parseSocialLinks } from "@/components/social-links";
import { getSiteSettings } from "@/lib/settings";
import { contactEmail } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact | YNA Digitisers",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const socialLinks = parseSocialLinks(settings?.socialLinks);
  const email = settings?.contactEmail || contactEmail;

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h1 className="heading-2 mb-4">Contact Us</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted">Have a question or ready to start your project? We&apos;d love to hear from you.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <div className="card">
              <h2 className="heading-3 mb-4">Get In Touch</h2>
              <a className="font-semibold text-brand-blue" href={`mailto:${email}`}>
                {email}
              </a>
            </div>
            {socialLinks.length > 0 ? (
              <div className="card">
                <h2 className="heading-3 mb-4">Follow Us</h2>
                <SocialLinks links={socialLinks} />
              </div>
            ) : null}
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
