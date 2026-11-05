import type { MetadataRoute } from "next";
import { TOOLS_REGISTRY } from "@/lib/tools-registry";

const BASE_URL = "https://pdflovers.com";

// Update these dates when the page content actually changes.
const LEGAL_PAGES = [
  { path: "/privacy-policy", lastModified: "2026-01-15" },
  { path: "/terms-and-conditions", lastModified: "2026-01-15" },
  { path: "/dmca-notice", lastModified: "2026-01-15" },
  { path: "/about-us", lastModified: "2026-01-15" },
  { path: "/contact-us", lastModified: "2026-01-15" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = Object.keys(TOOLS_REGISTRY).map(
    (slug) => ({
      url: `${BASE_URL}/tools/${slug}`,
      lastModified: new Date("2026-01-15"),
      changeFrequency: "monthly",
      priority: 0.9,
    })
  );

  const legalPages: MetadataRoute.Sitemap = LEGAL_PAGES.map(
    ({ path, lastModified }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(lastModified),
      changeFrequency: "yearly",
      priority: 0.3,
    })
  );

  return [...home, ...toolPages, ...legalPages];
}
