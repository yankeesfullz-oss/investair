import {
  filterPublicInvestmentProperties,
  getInvestmentOverview,
  matchInvestmentProperty,
  parseInvestmentPrice,
  sortInvestmentProperties,
} from "@/lib/investmentPropertyUtils";

function getBackendApiBaseUrl() {
  return (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
}

async function fetchBackendProperties() {
  const response = await fetch(`${getBackendApiBaseUrl()}/api/properties`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load backend properties (${response.status})`);
  }

  const data = await response.json();
  return filterPublicInvestmentProperties(data);
}

export async function getInvestmentProperties() {
  try {
    return await fetchBackendProperties();
  } catch (error) {
    console.error("Unable to load backend investment properties", error);
    return [];
  }
}

export async function getInvestmentPropertyById(propertyId) {
  const properties = await getInvestmentProperties();
  return matchInvestmentProperty(properties, propertyId);
}

export async function getInvestmentPropertiesSorted(selectedPropertyId) {
  const properties = await getInvestmentProperties();
  return sortInvestmentProperties(properties, selectedPropertyId);
}

export async function getInvestmentOverviewFromBackend() {
  const properties = await getInvestmentProperties();
  return getInvestmentOverview(properties);
}

export {
  filterPublicInvestmentProperties,
  getInvestmentOverview,
  matchInvestmentProperty,
  parseInvestmentPrice,
  sortInvestmentProperties,
};
