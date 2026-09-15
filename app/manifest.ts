import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "hepato-renal",
    short_name: "hepato-renal",
    description: "Mesure de l'index hépato-rénal sur image échographique. Outil de mesure, pas un dispositif médical.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1113",
    theme_color: "#0e1113",
    lang: "fr",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
