import { getSiteUrl } from "@/lib/site";

export default function robots() {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/invest/", "/invest/*"],
      disallow: [
        "/admin/",
        "/admin/*",
        "/investor/",
        "/investor/*",
        "/api/",
        "/api/*"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
