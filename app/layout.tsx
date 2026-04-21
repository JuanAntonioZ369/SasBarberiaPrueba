import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SasBarbería — Gestión inteligente para barberías",
  description:
    "Gestiona clientes, inventario, finanzas y membresías de tu barbería en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
