"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const token = sp.get("token") ?? "";
  const sessionId = sp.get("session_id") ?? "";
  const ready = Boolean(token && sessionId);

  const previewSrc = useMemo(() => {
    if (!ready) return "";
    return `/api/pdf?token=${encodeURIComponent(token)}&session_id=${encodeURIComponent(
      sessionId
    )}&preview=1`;
  }, [ready, token, sessionId]);

  const downloadHref = useMemo(() => {
    if (!ready) return "";
    return `/api/pdf?token=${encodeURIComponent(token)}&session_id=${encodeURIComponent(
      sessionId
    )}`;
  }, [ready, token, sessionId]);

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand" role="button" onClick={() => router.push("/")}>
          <span className="brandMark" />
          <span>Acta de Eliminación</span>
        </div>
        <div className="pills">
          <div className="pill">Pago verificado</div>
          <div className="pill">Listo</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="cardPad">
          <div className="kicker">
            <span className="kickerDot" />
            Éxito • Paso 3 de 3
          </div>

          <h1 className="h1" style={{ fontSize: 34, marginTop: 12 }}>
            Tu acta está preparada.
          </h1>
          <p className="sub">
            Previsualízala aquí y descárgala. El documento no se almacena.
          </p>

          <div className="notice">
            <b>Importante:</b> descárgalo ahora. Si cierras esta página, no podremos
            regenerarlo.
          </div>

          <div className="actions">
            <button className="btn btnGhost" onClick={() => router.push("/form")}>
              Crear otra
            </button>
            <button
              className="btn btnPrimary"
              disabled={!ready}
              onClick={() => window.location.assign(downloadHref)}
            >
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="cardPad">
          <p className="miniTitle">Previsualización</p>
          {!ready ? (
            <div className="notice noticeDanger">
              Falta información de la sesión. Vuelve al formulario.
            </div>
          ) : (
            <iframe
              className="iframe"
              src={previewSrc}
              title="Previsualización PDF"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container">
          <div className="topbar">
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
              <p className="sub">Preparando el documento…</p>
            </div>
          </div>
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
