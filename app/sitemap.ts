import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://semillero.cooweb.co"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/empresas`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/postular`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
