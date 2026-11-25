import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/my",
        "/growth",
        "/reset-password",
        "/community/write",
        "/api/",
      ],
    },

    sitemap: "https://like-turtle.vercel.app/sitemap.xml",
  };
}
