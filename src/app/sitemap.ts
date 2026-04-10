import type { MetadataRoute } from "next";
import { getAllSellers, getAllFiguresForSitemap } from "@/data/figures";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figurehub.xyz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sellers, figures] = await Promise.all([
    getAllSellers(),
    getAllFiguresForSitemap(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const sellerPages: MetadataRoute.Sitemap = sellers.map((seller) => ({
    url: `${SITE_URL}/u/${seller.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const figurePages: MetadataRoute.Sitemap = figures.map((fig) => ({
    url: `${SITE_URL}/u/${fig.slug}/figure/${fig.id}`,
    lastModified: fig.createdAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...sellerPages, ...figurePages];
}
