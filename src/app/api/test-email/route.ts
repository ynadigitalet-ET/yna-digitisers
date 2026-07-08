import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";

/**
 * Test endpoint to verify email configuration.
 * 
 * Usage:
 *   POST /api/test-email
 *   Body: { "to": "email@example.com", "subject": "Test", "message": "Hello" }
 * 
 * This helps debug email issues by showing exactly what's failing.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject = "YNA Digitisers - Email Test", message = "This is a test email from your website." } = body;

    if (!to) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing 'to' field",
          hint: "Send a POST request with: { \"to\": \"your-email@example.com\" }"
        },
        { status: 400 }
      );
    }

    // Check if SMTP is configured
    const smtpConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    if (!smtpConfigured) {
      return NextResponse.json({
        success: false,
        error: "SMTP is not configured",
        details: {
          SMTP_HOST: process.env.SMTP_HOST ? "✓ Set" : "✗ Missing",
          SMTP_PORT: process.env.SMTP_PORT ? "✓ Set" : "✗ Missing",
          SMTP_USER: process.env.SMTP_USER ? "✓ Set" : "✗ Missing",
          SMTP_PASS: process.env.SMTP_PASS ? "✓ Set (not shown)" : "✗ Missing",
        },
        instructions: {
          step1: "Enable 2-Step Verification on your Gmail account",
          step2: "Generate an App Password at https://myaccount.google.com/apppasswords",
          step3: "Add these to your .env file:",
          envVars: [
            'SMTP_HOST="smtp.gmail.com"',
            'SMTP_PORT="465"',
            'SMTP_SECURE="true"',
            'SMTP_USER="your-email@gmail.com"',
            'SMTP_PASS="your-16-character-app-password"',
          ],
          step4: "Restart your dev server (npm run dev)",
          step5: "Try this endpoint again",
        },
      });
    }

    // Try to send the email
    const result = await sendEmail({
      to,
      subject,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Email Test Successful! ✓</h2>
        <p>Your email system is working correctly.</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This email was sent from your YNA Digitisers website to verify email configuration.
        </p>
      </div>`,
      text: `Email Test Successful!\n\nYour email system is working correctly.\n\nMessage: ${message}\n\nSent at: ${new Date().toISOString()}`,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email sent successfully to ${to}`,
        messageId: result.id,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Email sending failed",
        details: result.error,
        troubleshooting: [
          "Check if your Gmail App Password is correct (16 characters, no spaces)",
          "Verify 2-Step Verification is enabled on your Gmail account",
          "Check if Gmail is blocking the login attempt (check your email for security alerts)",
          "Try using port 587 with SMTP_SECURE=\"false\" as an alternative",
        ],
      });
    }
  } catch (error) {
    console.error("[test-email] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test endpoint failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email Test Endpoint",
    usage: "Send a POST request to /api/test-email with { \"to\": \"email@example.com\" }",
    smtpConfigured: !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ),
  });
}
