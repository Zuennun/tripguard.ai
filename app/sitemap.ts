import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPosts();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/hotel-price-tracker`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE}/hotel-price-alert-after-booking`, lastModified: now, changeFrequency: "weekly", priority: 0.92 },
    { url: `${BASE}/blog`,              lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/hotels`,            lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/impressum`,         lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/datenschutz`,       lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/agb`,               lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/cookies`,           lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Blog articles
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // City/hotel pages — loaded dynamically so sitemap updates automatically
  let cityPages: MetadataRoute.Sitemap = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAllCities } = require("@/lib/cities");
    const topCities = new Set(["amsterdam", "paris", "barcelona", "london", "rom", "wien", "budapest", "athen", "istanbul", "dubai"]);
    cityPages = getAllCities().map((city: { slug: string }) => ({
      url: `${BASE}/hotels/${city.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: topCities.has(city.slug) ? 0.85 : 0.75,
    }));
  } catch {}

  return [...staticPages, ...blogPages, ...cityPages];
}
