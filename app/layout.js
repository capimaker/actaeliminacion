import "./globals.css";

export const metadata = {
  title: "Acta de Eliminación",
  description: "Un cierre simbólico en forma de acta descargable en PDF.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
