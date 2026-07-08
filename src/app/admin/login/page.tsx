import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login | YNA Digitisers",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <section className="section-padding">
      <div className="container-custom">
        <AdminLoginForm />
      </div>
    </section>
  );
}
