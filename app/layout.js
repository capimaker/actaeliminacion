import "./globals.css";

export const metadata = {
  title: "Acta de Eliminación",
  description: "Un cierre simbólico en forma de acta descargable en PDF.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
