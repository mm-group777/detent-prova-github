import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16: il caching è opt-in. Attivare Cache Components abilita la
  // direttiva "use cache" con cacheLife/cacheTag. Senza questo flag,
  // tutto resta dinamico — che è il default sicuro.
  cacheComponents: true,

  // La build NON deve passare con errori di tipo o di lint: in una factory di
  // agenti, un errore ignorato viene ereditato dal task successivo, che non sa
  // se è intenzionale. Non impostare mai queste due opzioni a `true`.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.example.com" }],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
