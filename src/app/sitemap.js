import { getInvestmentProperties } from "@/lib/investmentProperties";
import { absoluteUrl, getPropertyPath, getSiteUrl, PROPERTY_REVALIDATE_SECONDS } from "@/lib/site";

export const revalidate = PROPERTY_REVALIDATE_SECONDS;

export default async function sitemap() {
  const baseUrl = getSiteUrl();

  // Get dynamic listings from the backend/database
  const properties = await getInvestmentProperties();

  // Map backend properties into sitemap objects
  const propertyEntries = properties.map((property) => ({
    url: absoluteUrl(getPropertyPath(property)),
    lastModified: new Date(property.updatedAt || property.createdAt || Date.now()),
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
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...propertyEntries];
}
