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

      <div className="hero" style={{ marginTop: 60 }}>

        <div className="card" >
          <div className="cardPad">
            <div className="kicker">
              <span className="kickerDot" />
              Ritual simbólico • Documento descargable
            </div>

            <h1 className="h1" style={{ marginTop: 18, marginBottom: 18 }}>
              Cierra una etapa con un acto simple.
            </h1>
            <p className="sub" style={{ maxWidth: 520 }}>
              Escribes una declaración, eliges el momento y generas un PDF listo para
              descargar tras el pago. Tu contenido no se guarda.
            </p>

           <div className="actions ctaGlow" style={{ marginTop: 40 }}>
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
              <b>Privacidad:</b> el documento no se almacena. Descárgalo al finalizar.
            </div>
          </div>
        </div>

        <div className="card" >
          <div className="cardPad" style={{ height: 24 }} >
            <p className="miniTitle">Cómo funciona</p>
            <div className="kv">
              <div className="kvRow"><b>Escribes</b></div>
              <div className="kvRow">Declaración + firma.</div>

              <div className="kvRow"><b>Confirmas</b></div>
              <div className="kvRow">Fecha y hora (tu zona).</div>

              <div className="kvRow"><b>Pagas</b></div>
              <div className="kvRow">9 € con Stripe.</div>

              <div className="kvRow"><b>Recibes</b></div>
              <div className="kvRow">Previsualización + descarga PDF.</div>
            </div>

            <hr className="hr" />

            <p className="miniTitle">Nota</p>
            <p className="sub">
              Piensa en esto como un “punto final” escrito. Sin explicación. Solo decisión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
