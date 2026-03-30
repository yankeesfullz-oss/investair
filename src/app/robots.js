export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://investair.example.com";

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
