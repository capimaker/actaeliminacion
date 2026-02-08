"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <span className="brandMark" />
          <span>Acta de Eliminación</span>
        </div>
        <div className="pills">
          <div className="pill">Sin cuenta</div>
          <div className="pill">Sin almacenamiento</div>
          <div className="pill">PDF inmediato</div>
        </div>
      </div>

      <div className="hero heroSpacious">

        <div className="card" >
          <div className="cardPad">
            <div className="kicker">
              <span className="kickerDot" />
              Ritual simbólico • Documento descargable
            </div>

            <h1 className="h1 h1Hero">
              Cierra una etapa con un acto simple.
            </h1>
            <p className="sub subNarrow">
              Si deseas cerrar una etapa, una vivencia o una experiencia, este es un procedimiento SIMBÓLICO para hacerlo.
            </p>

           <div className="actions ctaGlow actionsHero">
  <button
    className="btn btnPrimary"
    style={{ padding: "16px 26px", fontSize: 16 }}
    onClick={() => router.push("/form")}
  >
    Crear mi acta
  </button>
</div>



            <div className="steps">
              <div className="step stepActive">1) Formulario</div>
              <div className="step">2) Pago</div>
              <div className="step">3) PDF</div>
            </div>

            <div className="notice">
              <b>Privacidad:</b> el documento no se guarda. Descárgalo al finalizar.
            </div>
          </div>
        </div>

        <div className="card" >
          <div className="cardPad">
            <p className="miniTitle">Cómo funciona</p>
            <div className="kv">
              <div className="kvRow"><b>Escribe</b></div>
              <div className="kvRow">Declaración + firma.</div>

              <div className="kvRow"><b>Confirma</b></div>
              <div className="kvRow">Fecha y hora (tu zona).</div>

              <div className="kvRow"><b>Paga</b></div>
              <div className="kvRow">10 € con Stripe.</div>

              <div className="kvRow"><b>Recibe</b></div>
              <div className="kvRow">Previsualización + descarga PDF.</div>
            </div>

            <hr className="hr" />

            <p className="miniTitle">Nota importante:</p>
            <p className="sub">
              No sustituye procesos terapéuticos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

