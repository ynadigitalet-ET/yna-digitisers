import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | YNA Digitisers",
};

export default function PrivacyPage() {
  return (
    <section className="section-padding">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-2 mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: 6/30/2026</p>
        <div className="prose-copy mt-8">
          <p>At YNA Digitisers, we respect your privacy and are committed to protecting your personal data.</p>
          <h2>Information We Collect</h2>
          <p>We collect information you provide through our contact forms, project request forms, and newsletter signup.</p>
          <h2>How We Use Your Information</h2>
          <p>We use your information to respond to inquiries, process orders, and send relevant updates.</p>
          <h2>Cookies</h2>
          <p>We use cookies to improve your browsing experience. You can accept or decline cookies via our cookie banner.</p>
          <h2>Contact</h2>
          <p>For privacy-related questions, contact us at ynadigital.et@gmail.com.</p>
        </div>
      </div>
    </section>
  );
}
