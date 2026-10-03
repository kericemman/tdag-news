import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const live = process.env.PUBLICATION_LIVE === "true";
  return {
    rules: { userAgent: "*", ...(live ? { allow: "/", disallow: ["/api/", "/newsroom/", "/design-preview/", "/account", "/login", "/register", "/search"] } : { disallow: "/" }) },
    sitemap: live ? ["https://news.thedigitalagame.com/sitemap.xml", "https://news.thedigitalagame.com/news-sitemap.xml"] : undefined,
  };
}
