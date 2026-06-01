import type { MetadataRoute } from "next";
import { getActiveProperties } from "@/features/properties/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const properties = await getActiveProperties();
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, priority: 1, changeFrequency: "weekly" },
    { url: `${base}/galeria`, lastModified: now, priority: 0.5 },
    { url: `${base}/contacto`, lastModified: now, priority: 0.5 },
    { url: `${base}/politicas`, lastModified: now, priority: 0.3 },
  ];

  const propertyPaths: MetadataRoute.Sitemap = properties.flatMap((p) => {
    const entries: MetadataRoute.Sitemap = [
      {
        url: `${base}/${p.slug}`,
        lastModified: p.updatedAt ?? now,
        priority: 0.9,
        changeFrequency: "weekly",
      },
    ];
    if (p.eventsEnabled) {
      entries.push({
        url: `${base}/${p.slug}/eventos`,
        lastModified: p.updatedAt ?? now,
        priority: 0.7,
        changeFrequency: "monthly",
      });
    }
    return entries;
  });

  return [...staticPaths, ...propertyPaths];
}
