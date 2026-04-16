import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Easy Promoter",
    short_name: "EasyPromoter",
    description:
      "CRM leve para promoters: contatos, cooldowns e convites controlados.",
    start_url: "/app",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6c5ce7",
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/window.svg",
        type: "image/svg+xml",
        sizes: "512x512",
        purpose: "any",
      },
    ],
  };
}
