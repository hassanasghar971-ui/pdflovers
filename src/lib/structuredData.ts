import { SITE_CONFIG } from "./constants";

export function getSoftwareApplicationSchema(opts: {
  name: string; description: string; slug: string; ratingCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    operatingSystem: "Web Browser",
    applicationCategory: "UtilitiesApplication",
    description: opts.description,
    url: `${SITE_CONFIG.domain}/tools/${opts.slug}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: opts.ratingCount ?? 2847,
      bestRating: "5",
      worstRating: "1",
    },
    author: { "@type": "Person", name: SITE_CONFIG.owner.name },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem", position: i + 1, name: item.name, item: item.url,
    })),
  };
}

export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question", name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/logo.png`,
    founder: { "@type": "Person", name: SITE_CONFIG.owner.name },
    contactPoint: [{
      "@type": "ContactPoint",
      email: SITE_CONFIG.owner.email,
      contactType: "customer support",
    }],
  };
}
