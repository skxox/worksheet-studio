import type { MetadataRoute } from "next";
import { COPYBOOK_TYPES } from "@/app/copybook/copybook-metadata";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const top = [
    { url: "/", priority: 1 },
    { url: "/copybook", priority: 0.9 },
    { url: "/handwriting", priority: 0.8 },
    { url: "/paper", priority: 0.8 },
  ];

  const copybook = COPYBOOK_TYPES.map((t) => ({
    url: `/copybook/${t.value}`,
    priority: 0.7,
  }));

  return [...top, ...copybook].map((entry) => ({
    url: `${SITE_URL}${entry.url}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: entry.priority,
  }));
}
