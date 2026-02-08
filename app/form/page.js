"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function FormInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const canceled = sp.get("canceled") === "1";

  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const scheduledAtLocal = date && time ? `${date}T${time}` : "";
  const canSubmit =
    title.trim() &&
    statement.trim() &&
    fullName.trim() &&
    scheduledAtLocal;

  async function onFinish() {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const resToken = await fetch("/api/issue-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          statement,
          fullName,
          scheduledAtLocal,
          timeZone,
        }),
      });

      const dataToken = await resToken.json().catch(() => null);
      if (!resToken.ok) {
        alert(dataToken?.error ?? "Error preparando el documento");
        return;
      }

      const resCheckout = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: dataToken.token }),
      });

      const dataCheckout = await resCheckout.json().catch(() => null);
      if (!resCheckout.ok) {
        alert(dataCheckout?.error ?? "Error iniciando el pago");
        return;
      }

      window.location.href = dataCheckout.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="topbar formTopbar">
        <div className="brand" role="button" onClick={() => router.push("/")}>
          <span className="brandMark" />
          <span className="actabtn">Acta de Eliminación</span>
        </div>
        <div className="pills">
          <div className="pill">
            Precio: <b>10 €</b>
          </div>
          <div className="pill">Zona: {timeZone}</div>
        </div>
      </div>

      <div className="hero heroForm">
        <div className="card">
          <div className="cardPad">
            <div className="kicker">
              <span className="kickerDot" />
              Formulario • Paso 1 de 3
            </div>

            <h1 className="h1 h1Hero">
              Escribe la Declaración de Cierre
            </h1>
            <p className="sub">
              Tras pagar podrás previsualizar y descargar el PDF inmediatamente.
            </p>

            {canceled && (
              <div className="notice noticeDanger">
                El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.
              </div>
            )}

            <div className="notice">
              <b>Importante:</b> este documento <b>no se guarda</b>. Descárgalo al
              finalizar.
            </div>

            <div className="steps">
              <div className="step stepActive">1) Formulario</div>
              <div className="step">2) Pago</div>
              <div className="step">3) PDF</div>
            </div>

            <label className="label">Título</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cierro este ciclo"
            />

            <label className="label">Declaración</label>
            <textarea
              className="textarea"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Escribe tu declaración aquí…"
            />

            <label className="label">Firma (nombre y apellidos)</label>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: María Pérez"
            />

            <div className="grid2" style={{ marginTop: 8 }}>
              <div>
                <label className="label">Fecha</label>
                <input
                  className="input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Hora</label>
                <input
                  className="input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="actions">
              <button
                className="btn btnPrimary"
                onClick={onFinish}
                disabled={!canSubmit || loading}
              >
                {loading ? "Abriendo pago…" : "Generar mi acta"}
              </button>

              <button
                className="btn btnGhost"
                onClick={() => {
                  setTitle("");
                  setStatement("");
                  setFullName("");
                  setDate("");
                  setTime("");
                }}
                disabled={loading}
              >
                Limpiar
              </button>
            </div>

            {!canSubmit && (
              <p className="sub" style={{ marginTop: 10 }}>
                Nota: El importe corresponde exclusivamente al acto formal y emisión del documento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense
      fallback={
        <div className="container">
          <div className="topbar formTopbar">
            <div className="brand">
              <span className="brandMark" />
              <span>Acta de Eliminación</span>
            </div>
            <div className="pills">
              <div className="pill">Cargando…</div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 18 }}>
            <div className="cardPad">
              <p className="sub">Preparando el formulario…</p>
            </div>
          </div>
        </div>
      }
    >
      <FormInner />
    </Suspense>
  );
}




