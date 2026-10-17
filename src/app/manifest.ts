import { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Free Online PDF Tools`,
    short_name: "PDF Lovers Pro",
    description: "Free, private, browser-based PDF tools powered by WebAssembly. No uploads, no servers.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#DC2626",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
