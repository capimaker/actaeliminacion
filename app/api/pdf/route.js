export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import crypto from "crypto";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ---------------- Token helpers ---------------- */

function base64urlToBuffer(s) {
  const b64 =
    s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Buffer.from(b64, "base64");
}

function verifyAndParseToken(token, secret) {
  const parts = (token ?? "").split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest();

  const gotSig = base64urlToBuffer(sigB64);
  if (gotSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(gotSig, expectedSig)) return null;

  let payload;
  try {
    payload = JSON.parse(base64urlToBuffer(payloadB64).toString("utf8"));
  } catch {
    return null;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload?.exp || nowSec > payload.exp) return null;

  return payload;
}

/* ---------------- Helpers ---------------- */

function safeText(input, maxLen = 2000) {
  const s = (input ?? "").toString().trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function formatHumanDate(localISO, timeZone) {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone,
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(localISO));
  } catch {
    return localISO;
  }
}

/* ---------------- PDF helpers ---------------- */


const A4 = { w: 595, h: 842 };

function drawFrame(page, margin) {
  const m = margin;
  page.drawRectangle({
    x: m,
    y: m,
    width: A4.w - m * 2,
    height: A4.h - m * 2,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });

  page.drawRectangle({
    x: m + 6,
    y: m + 6,
    width: A4.w - (m + 6) * 2,
    height: A4.h - (m + 6) * 2,
    borderWidth: 0.5,
    borderColor: rgb(0, 0, 0),
  });
}

function drawCenteredText(page, text, y, font, fontSize, pageWidth) {
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const x = (pageWidth - textWidth) / 2;
  page.drawText(text, { x, y, size: fontSize, font });
}

function wrapTextPreserveNewlines({ text, font, fontSize, maxWidth }) {
  const paragraphs = (text ?? "").split(/\r?\n/);
  const out = [];

  for (const p of paragraphs) {
    const paragraph = p.trim();
    if (!paragraph) {
      out.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        current = test;
      } else {
        if (current) out.push(current);
        current = word;
      }
    }
    if (current) out.push(current);
  }

  return out;
}

function newPage(pdfDoc, fonts, title, subtitle, pageNumber) {
  const page = pdfDoc.addPage([A4.w, A4.h]);
  const margin = 40;

  page.drawRectangle({
  x: 0,
  y: 0,
  width: A4.w,
  height: A4.h,
  color: rgb(0.96, 0.93, 0.86),
});

  drawFrame(page, margin);

  // Header (ASCII only)
drawCenteredText(
  page,
  "ACTA DE ELIMINACION",
  A4.h - margin - 60,
  fonts.bold,
  22,
  A4.w
);



drawCenteredText(
  page,
  title,
  A4.h - margin - 95,
  fonts.bold,
  13,
  A4.w
);

drawCenteredText(
  page,
  subtitle,
  A4.h - margin - 120,
  fonts.regular,
  10,
  A4.w
);


  // Footer
  page.drawText(`- ${pageNumber} -`, {
    x: A4.w / 2 - 15,
    y: margin - 10,
    size: 9,
    font: fonts.regular,
  });

 const columnWidth = 360;
const columnX = (A4.w - columnWidth) / 2;

return {
  page,
  x: columnX,
  y: A4.h - margin - 160,
  maxWidth: columnWidth,
  bottom: margin + 40,
};

}

/* ---------------- Route ---------------- */

export async function GET(req) {
  const secret = process.env.ACTA_TOKEN_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { error: "Missing ACTA_TOKEN_SECRET" },
      { status: 500 }
    );
  }
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const sessionId = searchParams.get("session_id");
  const isPreview = searchParams.get("preview") === "1";

  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });
  if (!sessionId)
    return NextResponse.json({ error: "session_id required" }, { status: 400 });

  // 1) Verify Stripe payment
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session_id" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Not paid" }, { status: 403 });
  }

  // 2) Verify token
  const payload = verifyAndParseToken(token, secret);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  // 3) Extract
  const title = safeText(payload.title, 120);
  const statement = safeText(payload.statement, 12000);
  const fullName = safeText(payload.fullName, 120);
  const scheduledAtLocal = safeText(payload.scheduledAtLocal, 40);
  const timeZone = safeText(payload.timeZone, 80);

  if (!title || !statement || !fullName || !scheduledAtLocal || !timeZone) {
    return NextResponse.json({ error: "Missing fields in token" }, { status: 400 });
  }

  const humanDate = formatHumanDate(scheduledAtLocal, timeZone);
  const subtitle = `Cierre: ${humanDate} (${timeZone})`;

  // 4) Build PDF
  const pdfDoc = await PDFDocument.create();
  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };

  const fontSize = 11;
  const lineHeight = 16;

  let pageNumber = 1;
  let ctx = newPage(pdfDoc, fonts, title, subtitle, pageNumber);
  let y = ctx.y;

  const ensureSpace = (needed) => {
    if (y < ctx.bottom + needed) {
      pageNumber++;
      ctx = newPage(pdfDoc, fonts, title, subtitle, pageNumber);
      y = ctx.y;
    }
  };

  const section = (label) => {
    ensureSpace(50);
    ctx.page.drawText(`~ ${label} ~`, {
      x: ctx.x,
      y,
      size: 12,
      font: fonts.bold,
    });
    y -= 22;
  };

  const writeLines = (lines) => {
    for (const line of lines) {
      ensureSpace(24);
      ctx.page.drawText(line || " ", {
        x: ctx.x,
        y,
        size: fontSize,
        font: fonts.regular,
      });
      y -= lineHeight;
    }
  };

  section("Invocacion");
  writeLines(
    wrapTextPreserveNewlines({
      text:
        "Por medio de este acto consciente y deliberado, se establece el cierre simbolico de lo aqui expresado.",
      font: fonts.regular,
      fontSize,
      maxWidth: ctx.maxWidth,
    })
  );

  y -= 10;

  section("Declaracion");
  writeLines(
    wrapTextPreserveNewlines({
      text: statement,
      font: fonts.regular,
      fontSize,
      maxWidth: ctx.maxWidth,
    })
  );

  y -= 10;

  section("Firma");
  writeLines(
    wrapTextPreserveNewlines({
      text: fullName,
      font: fonts.bold,
      fontSize: 12,
      maxWidth: ctx.maxWidth,
    })
  );

  y -= 8;
  ensureSpace(30);
  ctx.page.drawLine({
    start: { x: ctx.x, y },
    end: { x: ctx.x + 260, y },
    thickness: 1,
  });
  y -= 18;

  ensureSpace(24);
  ctx.page.drawText("Estado: CERRADO ", {
    x: ctx.x,
    y,
    size: 10,
    font: fonts.regular,
  });
  y -= 22;

  section("Clausura");
  writeLines(
    wrapTextPreserveNewlines({
      text:
        "Con este acto, la etapa descrita queda simbolicamente cerrada y liberada.\n" ,
      font: fonts.regular,
      fontSize,
      maxWidth: ctx.maxWidth,
    })
  );

  const bytes = await pdfDoc.save();

  const headers = {
    "Content-Type": "application/pdf",
    "Cache-Control": "no-store",
  };

  if (!isPreview) {
    headers["Content-Disposition"] = `attachment; filename="acta.pdf"`;
  }

  return new NextResponse(Buffer.from(bytes), { headers });
}
