import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fembo",
    short_name: "Fembo",
    description: "A cute, gentle 16+ companion room.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f7f1ea",
    theme_color: "#c48b7a",
    icons: [{ src: "/images/logo-black.png", sizes: "any", type: "image/png" }],
  };
}
