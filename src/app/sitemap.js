import { getInvestmentProperties } from "@/lib/investmentProperties";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://investair.example.com";

  // Get dynamic listings from the backend/database
  const properties = await getInvestmentProperties();

  // Map backend properties into sitemap objects
  const propertyEntries = properties.map((property) => ({
    url: `${baseUrl}/invest/${property.id}`,
    lastModified: new Date(property.updatedAt || new Date()), // ideally fallback to current date or actual updatedAt
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Define static core routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/invest`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...propertyEntries];
}
