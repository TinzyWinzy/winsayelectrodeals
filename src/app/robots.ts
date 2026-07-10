import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/leads", "/schedule", "/settings"],
      },
    ],
    sitemap: "https://winsayelectrodeals.co.zw/sitemap.xml",
  };
}
