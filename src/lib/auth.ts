import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "yna_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  email: string;
  expiresAt: number;
};

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET;
  if (secret) {
    return secret;
  }
  // In production, refuse to fall back to a predictable secret — a guessable
  // signing key would let anyone forge admin session cookies.
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production. Set it in your environment variables.");
  }
  return "local-development-session-secret";
}

function configuredAdmin() {
  return {
    email: process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || process.env.ADMIN_USER,
    password: process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS,
  };
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function decode(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.email || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function isAdminConfigured() {
  const admin = configuredAdmin();
  return Boolean(admin.email && admin.password);
}

export async function createAdminSession(email: string) {
  const token = encode({ email, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return decode(token);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const admin = configuredAdmin();
  if (!admin.email || !admin.password) {
    return { ok: false, message: "Admin credentials are not configured. Add ADMIN_EMAIL and ADMIN_PASSWORD to .env." };
  }

  // Timing-safe comparison for both fields so response time doesn't leak
  // whether the email or password was the incorrect one.
  const emailMatches = safeEqual(email.trim().toLowerCase(), admin.email.trim().toLowerCase());
  const passwordMatches = safeEqual(password, admin.password);

  if (!emailMatches || !passwordMatches) {
    return { ok: false, message: "Invalid email or password." };
  }

  return { ok: true, message: "Signed in." };
}
