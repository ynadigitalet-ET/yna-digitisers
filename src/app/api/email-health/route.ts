import { NextResponse } from "next/server";

/**
 * Email system health check endpoint.
 * Shows the current email configuration status without exposing secrets.
 */
export async function GET() {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST ? "Configured" : "Not set",
    SMTP_PORT: process.env.SMTP_PORT ? "Configured" : "Not set",
    SMTP_SECURE: process.env.SMTP_SECURE ?? "true (default)",
    SMTP_USER: process.env.SMTP_USER ? "Configured" : "Not set",
    SMTP_PASS: process.env.SMTP_PASS ? "Configured (hidden)" : "Not set",
    EMAIL_FROM: process.env.EMAIL_FROM ? "Configured" : "Not set (will use SMTP_USER)",
  };

  const allConfigured = Object.values(config).every(v => v.includes("Configured") && !v.includes("Not"));

  return NextResponse.json({
    emailSystem: allConfigured ? "Ready" : "Not configured",
    configuration: config,
    instructions: allConfigured 
      ? "Email system is ready. Send a test email to verify it works."
      : "To enable emails, configure the missing variables in your .env file.",
  });
}
