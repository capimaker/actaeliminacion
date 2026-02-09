# Acta de Eliminación

Aplicación web para generar un “Acta de Eliminación Simbólica” en PDF. El usuario completa un formulario, realiza el pago con Stripe y obtiene una previsualización y descarga inmediata del documento. El sistema no almacena el contenido.

**Qué hace**
- Landing con explicación del ritual y CTA.
- Formulario con título, declaración, firma, fecha y hora.
- Checkout de Stripe (10 €) y verificación de pago.
- Generación de PDF en tiempo real con `pdf-lib`.
- Previsualización y descarga del PDF sin persistencia.

**Flujo**
1. El usuario completa el formulario en `/form`.
2. Se emite un token firmado (válido 30 min).
3. Se crea una sesión de Stripe Checkout.
4. Stripe redirige a `/success`.
5. Se verifica el pago y se genera el PDF.

**Rutas de la app**
- `/` Landing.
- `/form` Formulario y disparo de pago.
- `/success` Previsualización y descarga.

**API**
- `POST /api/issue-token` Emite token firmado con los datos del formulario.
- `POST /api/checkout` Crea sesión de Stripe Checkout.
- `GET /api/pdf` Verifica pago + token y devuelve el PDF (preview o descarga).

**Variables de entorno**
- `ACTA_TOKEN_SECRET` Secreto para firmar el token del formulario.
- `STRIPE_SECRET_KEY` Clave secreta de Stripe.
- `APP_URL` Base URL opcional si no hay headers de host (útil fuera de Vercel).

**Requisitos**
- Node.js `>= 18.18.0`

**Cómo ejecutar**
```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

**Build y producción**
```bash
npm run build
npm run start
```

**Notas**
- El precio está fijado a 10 € en `app/api/checkout/route.js`.
- Los tokens expiran a los 30 minutos.
- El PDF usa el logo `public/logo_transparent.png`.
- Los scripts usan `--webpack` para evitar Turbopack.
