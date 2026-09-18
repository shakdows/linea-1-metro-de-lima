import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LimpiarServiceWorker } from "@/components/LimpiarServiceWorker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Línea 1 — Metro de Lima",
    template: "%s",
  },
  description:
    "Planifica tu viaje en la Línea 1 del Metro de Lima: mapa interactivo de ida y vuelta, seguimiento del tren, próximos trenes y afluencia por franja horaria.",
  applicationName: "Línea 1",
};

export const viewport: Viewport = {
  themeColor: "#009B3A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PE" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <LimpiarServiceWorker />
        {children}
      </body>
    </html>
  );
}
