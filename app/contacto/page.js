"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContactoPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot (oculto)
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const canSend =
    fullName.trim().length >= 3 &&
    email.trim().length >= 6 &&
    message.trim().length >= 10;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSend || loading) return;

    setLoading(true);
    setSent(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, message, company }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error ?? "No se pudo enviar. Inténtalo de nuevo.");
        return;
      }

      setSent(true);
      setFullName("");
      setEmail("");
      setMessage("");
      setCompany("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand" role="button" onClick={() => router.push("/")}>
          <span className="brandMark" />
          <span>Acta de Eliminación</span>
        </div>
        <div className="pills">
          <div className="pill">Soporte</div>
        </div>
      </div>

      <div className="hero" style={{ gridTemplateColumns: "1fr .9fr", marginTop: 22 }}>
        <div className="card">
          <div className="cardPad">
            <h1 className="h1" style={{ fontSize: 34, marginTop: 2 }}>
              Contacto
            </h1>
            <p className="sub">
              Cuéntanos tu duda o incidencia. Te responderemos lo antes posible.
            </p>

            {sent && (
              <div className="notice" style={{ marginTop: 14 }}>
                <b>Enviado.</b> Hemos recibido tu mensaje.
              </div>
            )}

            <form onSubmit={onSubmit}>
              <label className="label">Nombre y apellidos</label>
              <input
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: John Doe"
                autoComplete="name"
              />

              <label className="label">Correo</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuemail@correo.com"
                autoComplete="email"
              />

              {/* Honeypot anti-spam: oculto */}
              <div style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
                <label>Company</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <label className="label">Mensaje</label>
              <textarea
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe el problema y, si aplica, el momento aproximado del pago."
              />

              <div className="actions" style={{ marginTop: 16 }}>
                <button className="btn btnPrimary" type="submit" disabled={!canSend || loading}>
                  {loading ? "Enviando..." : "Enviar"}
                </button>

                <button className="btn btnGhost" type="button" onClick={() => router.push("/")}>
                  Volver
                </button>
              </div>

              {!canSend && (
                <p className="sub" style={{ marginTop: 10 }}>
                  Para enviar: nombre, correo y un mensaje (mínimo 10 caracteres).
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="card">
          <div className="cardPad">
            <p className="miniTitle">Privacidad</p>
            <p className="sub">
              Por diseño, no almacenamos el contenido del acta. Si el problema es técnico,
              describe el paso donde ocurre y el momento aproximado.
            </p>

            <hr className="hr" />

            <p className="miniTitle">Consejo</p>
            <p className="sub">
              Si el error es del pago, indícanos el email usado en Stripe (si lo recuerdas).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
