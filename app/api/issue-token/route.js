import { NextResponse } from "next/server";
import crypto from "crypto";
export const runtime = "nodejs";


function safeText(input, maxLen = 2000) {
  const s = (input ?? "").toString().trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function base64url(input) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(payloadJson, secret) {
  const payloadB64 = base64url(payloadJson);
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest();
  const sigB64 = base64url(sig);
  return `${payloadB64}.${sigB64}`;
}

export async function POST(req) {
  const secret = process.env.ACTA_TOKEN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Missing ACTA_TOKEN_SECRET" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = safeText(body.title, 120);
  const statement = safeText(body.statement, 3000);
  const fullName = safeText(body.fullName, 120);
  const scheduledAtLocal = safeText(body.scheduledAtLocal, 40);
  const timeZone = safeText(body.timeZone, 80);

  if (!title || !statement || !fullName || !scheduledAtLocal || !timeZone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Token válido 30 minutos (MVP)
  const nowSec = Math.floor(Date.now() / 1000);
  const exp = nowSec + 30 * 60;

  const payload = {
    title,
    statement,
    fullName,
    scheduledAtLocal,
    timeZone,
    exp,
  };

  const token = sign(JSON.stringify(payload), secret);

  return NextResponse.json({ token });
}
