import { NextResponse } from "next/server";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/validate";

/** Best-effort client IP for rate limiting (works on Vercel & most proxies). */
function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// Magic bytes for validating actual file content (not just MIME header)
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

function isVectorOrIcon(mimeType: string) {
  return mimeType === "image/svg+xml" || mimeType === "image/x-icon" || mimeType === "image/vnd.microsoft.icon";
}

function validateMagicBytes(buffer: Buffer, declaredType: string): boolean {
  const signatures = MAGIC_BYTES[declaredType];
  if (!signatures) return true; // SVG/ICO don't have simple magic bytes
  return signatures.some((sig) =>
    sig.every((byte, index) => buffer.length > index && buffer[index] === byte)
  );
}

function sanitizeSvg(buffer: Buffer): Buffer {
  let content = buffer.toString("utf-8");
  // Strip script tags, event handlers, and dangerous elements
  content = content.replace(/<script[\s\S]*?<\/script>/gi, "");
  content = content.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "");
  content = content.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  content = content.replace(/javascript\s*:/gi, "removed:");
  content = content.replace(/data\s*:\s*text\/html/gi, "removed:text/html");
  return Buffer.from(content, "utf-8");
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    // Rate limit uploads per IP to prevent abuse / memory-based DoS.
    const rl = checkRateLimit(`upload:${clientIp(request)}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many uploads. Please wait a minute and try again." }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const purpose = String(formData.get("purpose") || "generic").slice(0, 20);

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Upload JPG, PNG, WEBP, SVG, or ICO." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "File is too large. Maximum size is 8MB." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    let bytes = Buffer.from(await file.arrayBuffer()) as Buffer;
    let mimeType = file.type;

    // Validate actual file content matches declared MIME type
    if (!isVectorOrIcon(file.type) && !validateMagicBytes(bytes, file.type)) {
      return NextResponse.json({ error: "File content does not match declared type." }, { status: 400 });
    }

    // Sanitize SVG to remove script injection vectors
    if (file.type === "image/svg+xml") {
      bytes = sanitizeSvg(bytes) as Buffer;
    }

    let outputBuffer: Buffer = bytes;

    if (!isVectorOrIcon(file.type)) {
      try {
        if (purpose === "favicon") {
          outputBuffer = await sharp(bytes)
            .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png({ quality: 90 })
            .toBuffer();
          mimeType = "image/png";
        } else if (purpose === "homepage") {
          outputBuffer = await sharp(bytes)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();
          mimeType = "image/webp";
        } else if (purpose === "background") {
          outputBuffer = await sharp(bytes)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 78 })
            .toBuffer();
          mimeType = "image/webp";
        } else {
          outputBuffer = await sharp(bytes)
            .resize({ width: 1600, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
          mimeType = "image/webp";
        }
      } catch (err) {
        console.error("[upload] Image optimization failed, using original:", err instanceof Error ? err.message : err);
        outputBuffer = bytes;
        mimeType = file.type;
      }
    }

    const dataUrl = `data:${mimeType};base64,${outputBuffer.toString("base64")}`;
    return NextResponse.json({ url: dataUrl });
  } catch (err) {
    console.error("[upload] Upload failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to upload image. Please try again." }, { status: 500 });
  }
}
