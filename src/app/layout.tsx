import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VALENLOG — Logística e Triagem",
  description:
    "Portal de gestão operacional — almoxarifado, pátio, ocorrências e escala",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
