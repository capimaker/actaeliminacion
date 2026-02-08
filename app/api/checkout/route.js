import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getBaseUrl(req) {
  // En Vercel suele venir el host correcto aquí
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (!host) return process.env.APP_URL ?? "http://localhost:3000";
  return `${proto}://${host}`;
}

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Acta de Eliminación" },
            unit_amount: 900, // 9,00 €
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&token=${encodeURIComponent(
        token
      )}`,
      cancel_url: `${baseUrl}/form?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
