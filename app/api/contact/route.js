export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

function safe(input, max = 5000) {
  return (input ?? "").toString().trim().slice(0, max);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!resendKey) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }
    if (!toEmail) {
      return NextResponse.json({ error: "Missing CONTACT_TO_EMAIL" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const fullName = safe(body.fullName, 120);
    const email = safe(body.email, 160);
    const message = safe(body.message, 4000);

    // Honeypot anti-spam (campo oculto)
    const company = safe(body.company, 80);
    if (company) {
      return NextResponse.json({ ok: true }); // fingimos OK
    }

    if (!fullName || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const resend = new Resend(resendKey);

    const subject = `Soporte Acta — ${fullName}`;
    const text = [
      "Nuevo mensaje de soporte",
      "------------------------",
      `Nombre: ${fullName}`,
      `Email: ${email}`,
      "",
      "Mensaje:",
      message,
      "",
      `Fecha: ${new Date().toISOString()}`,
    ].join("\n");

    // Importante: para empezar, este from funciona sin dominio propio en Resend.
    // Cuando verifiques tu dominio, cámbialo a algo tipo: soporte@tudominio.com
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: toEmail,
      replyTo: email,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
