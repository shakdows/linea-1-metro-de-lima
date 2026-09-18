import type { NextConfig } from "next";

/**
 * Exportación estática: `npm run build` deja el sitio listo en `out/`,
 * publicable en GitHub Pages o Vercel sin servidor.
 *
 * BASE_PATH se usa solo en GitHub Pages, donde el sitio cuelga de
 * /<repo>/ en lugar de la raíz del dominio.
 */
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
