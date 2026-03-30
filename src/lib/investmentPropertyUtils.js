const FALLBACK_PROPERTY_IMAGE = "https://res.cloudinary.com/daiii0a2n/image/upload/v1774103631/homes-scraper/rwml3x1ds15jre3tf9el.webp";

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function toSlug(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function compactList(values) {
  return [...new Set((values || []).map((value) => normalizeWhitespace(value)).filter(Boolean))];
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatMonthlyInvestment(value) {
  const amount = Number(value || 0);
  return amount > 0 ? formatUsd(amount) : "$0";
}

function toBedLabel(value) {
  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue >= 0) {
    return numericValue === 0 ? "Studio" : `${numericValue} bed${numericValue === 1 ? "" : "s"}`;
  }

  const normalizedValue = normalizeWhitespace(value);
  if (!normalizedValue) {
    return "Bed info on listing";
  }

  return /bed|studio/i.test(normalizedValue) ? normalizedValue : `${normalizedValue} beds`;
}

function toBathLabel(value) {
  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return `${numericValue} bath${numericValue === 1 ? "" : "s"}`;
  }

  const normalizedValue = normalizeWhitespace(value);
  if (!normalizedValue) {
    return "Bath info on listing";
  }

  return /bath/i.test(normalizedValue) ? normalizedValue : `${normalizedValue} baths`;
}

function toSqftLabel(value) {
  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return `${numericValue.toLocaleString("en-US")} sqft`;
  }

  const normalizedValue = normalizeWhitespace(value);
  if (!normalizedValue) {
    return "Sqft on listing";
  }

  return /sq\s*ft/i.test(normalizedValue) ? normalizedValue : `${normalizedValue} sqft`;
}

function prettifyListingType(listingType, propertyType) {
  const rawValue = normalizeWhitespace(listingType || propertyType);

  if (!rawValue) {
    return "Rental listing";
  }

  if (/short[_\s-]?stay/i.test(rawValue)) {
    return "Short-stay rental";
  }

  if (/single[_\s-]?family/i.test(rawValue)) {
    return "Single-family home";
  }

  if (/multi[_\s-]?family/i.test(rawValue)) {
    return "Multi-family home";
  }

  return rawValue
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildAddress(record) {
  const addressParts = [
    record.addressLine1,
    record.addressLine2,
    record.city,
    record.state,
    record.postalCode,
  ]
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean);

  if (addressParts.length > 0) {
    return addressParts.join(", ");
  }

  return normalizeWhitespace(record.location || record.name || "Property address unavailable");
}

function buildSummary(record, description) {
  const investorSummary = normalizeWhitespace(record.investorSummary);
  if (investorSummary) {
    return investorSummary;
  }

  const summary = normalizeWhitespace(record.description || description);
  if (!summary) {
    return "Property details available in the live Investair inventory.";
  }

  return summary.split(/(?<=[.!?])\s+/)[0];
}

function buildAvailability(record) {
  const explicitAvailability = normalizeWhitespace(record.availabilityWindowLabel);
  if (explicitAvailability) {
    return explicitAvailability;
  }

  if (String(record.status || record.investmentStatus || "").toLowerCase() === "sold_out") {
    return "Sold out";
  }

  if (record.nextAvailableStartDate) {
    const nextAvailableDate = new Date(record.nextAvailableStartDate);
    if (!Number.isNaN(nextAvailableDate.getTime())) {
      return `Open from ${nextAvailableDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
  }

  return "Open for reservations";
}

function getFundingStatus(fundedPercentage) {
  if (fundedPercentage >= 90) {
    return "nearly_funded";
  }

  if (fundedPercentage >= 65) {
    return "building";
  }

  return "open";
}

function normalizeAllowedDurations(record) {
  const durations = Array.isArray(record.allowedDurations)
    ? record.allowedDurations
    : [record.minimumInvestmentMonths, record.maximumInvestmentMonths].filter(Boolean);

  const cleaned = [...new Set(durations.map(Number).filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => a - b);
  return cleaned.length > 0 ? cleaned : [2, 3, 6, 12];
}

export function parseInvestmentPrice(value) {
  return Number(String(value || "0").replace(/[^0-9.]/g, "")) || 0;
}

export function normalizeBackendProperty(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const monthlyInvestmentAmount = Number(record.slotBasePriceMonthly || 0);
  const name = normalizeWhitespace(record.name || "Investair Property");
  const city = normalizeWhitespace(record.city || "");
  const state = normalizeWhitespace(record.state || "");
  const allowedDurations = normalizeAllowedDurations(record);
  const occupancyScore = Number(record.occupancyScore || 0);
  const demandScore = Number(record.demandScore || 0);
  const fundedPercentage = Number(record.fundedPercentage || 0);
  const currentDailyPayoutAmount = Number(record.currentDailyPayoutAmount || 0);
  const projectedMonthlyPayoutAmount = Number(record.projectedMonthlyPayoutAmount || currentDailyPayoutAmount * 30);
  const projectedAnnualPayoutAmount = Number(record.projectedAnnualPayoutAmount || projectedMonthlyPayoutAmount * 12);
  const description = normalizeWhitespace(record.description || record.investorSummary || "Property details available in the live Investair inventory.");
  const summary = buildSummary(record, description);
  const images = compactList([record.coverImage, ...(Array.isArray(record.images) ? record.images : [])]);
  const resolvedImages = images.length > 0 ? images : [FALLBACK_PROPERTY_IMAGE];
  const locationLabel = normalizeWhitespace(record.location || [city, state].filter(Boolean).join(", "));
  const investorHeadline = normalizeWhitespace(
    record.investorHeadline || `${locationLabel || state || "Prime market"} income opportunity`
  );
  const trustBadges = compactList(record.trustBadges);
  const highlights = compactList(record.highlights);
  const sourceUrl = normalizeWhitespace(record.sourceUrl || "");
  const propertySlug = normalizeWhitespace(record.slug || "");
  const normalizedId = propertySlug || String(record._id || record.id || toSlug(name));

  return {
    ...record,
    id: normalizedId,
    propertyId: normalizeWhitespace(record.sourceListingId || propertySlug || record._id || record.id || normalizedId),
    propertyName: name,
    name,
    slug: propertySlug,
    source: normalizeWhitespace(record.sourceName || "InvestAir"),
    sourceUrl,
    sourceUrls: compactList([sourceUrl]),
    listingType: prettifyListingType(record.listingType, record.propertyType),
    price: formatMonthlyInvestment(monthlyInvestmentAmount),
    investmentPricePerMonth: formatMonthlyInvestment(monthlyInvestmentAmount),
    monthlyInvestmentAmount,
    currentDailyPayoutAmount,
    projectedMonthlyPayoutAmount,
    projectedAnnualPayoutAmount,
    occupancyScore,
    demandScore,
    fundedPercentage,
    totalInvestors: Number(record.totalInvestors || 0),
    minimumInvestmentMonths: Number(record.minimumInvestmentMonths || allowedDurations[0] || 2),
    allowedDurations,
    riskLevel: normalizeWhitespace(record.riskLevel || "moderate") || "moderate",
    investorHeadline,
    investorSummary: normalizeWhitespace(record.investorSummary || `${summary} Positioned for ${occupancyScore}% occupancy with admin-managed payout guidance of ${formatUsd(currentDailyPayoutAmount)}.`),
    highlights,
    trustBadges,
    fundingStatus: getFundingStatus(fundedPercentage),
    beds: toBedLabel(record.beds),
    baths: toBathLabel(record.baths),
    bedsCount: Number(record.beds || 0),
    bathsCount: Number(record.baths || 0),
    sqft: toSqftLabel(record.sqft),
    address: buildAddress(record),
    city,
    state,
    zip: normalizeWhitespace(record.postalCode || ""),
    description,
    summary,
    amenities: compactList(record.amenities),
    image: resolvedImages[0],
    images: resolvedImages,
    floorPlans: [],
    manager: normalizeWhitespace(record.sourceName || "InvestAir asset team"),
    phone: "",
    availability: buildAvailability(record),
    availabilityWindowLabel: normalizeWhitespace(record.availabilityWindowLabel || ""),
    pets: [],
    virtualTours: [],
    coverImage: resolvedImages[0],
    scrapedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
  };
}

export function filterPublicInvestmentProperties(records) {
  return (Array.isArray(records) ? records : [])
    .filter((record) => {
      if (!record) {
        return false;
      }

      if (record.isPublished === false) {
        return false;
      }

      const status = String(record.status || "").toLowerCase();
      const investmentStatus = String(record.investmentStatus || "").toLowerCase();

      if ([status, investmentStatus].includes("sold_out") || [status, investmentStatus].includes("paused")) {
        return false;
      }

      return status === "active" || investmentStatus === "active";
    })
    .map(normalizeBackendProperty)
    .filter(Boolean);
}

export function matchInvestmentProperty(properties, propertyId) {
  if (!propertyId) {
    return null;
  }

  const normalizedNeedle = toSlug(propertyId);

  return properties.find((property) => {
    return [property.id, property._id, property.slug, property.propertyId]
      .filter(Boolean)
      .some((candidate) => toSlug(candidate) === normalizedNeedle);
  }) || null;
}

export function sortInvestmentProperties(properties, selectedPropertyId) {
  const sortedProperties = [...(Array.isArray(properties) ? properties : [])].sort((first, second) => {
    return parseInvestmentPrice(second.investmentPricePerMonth) - parseInvestmentPrice(first.investmentPricePerMonth);
  });

  if (!selectedPropertyId) {
    return sortedProperties;
  }

  const selectedIndex = sortedProperties.findIndex((property) => property.id === selectedPropertyId);
  if (selectedIndex <= 0) {
    return sortedProperties;
  }

  const [selectedProperty] = sortedProperties.splice(selectedIndex, 1);
  return [selectedProperty, ...sortedProperties];
}

export function getInvestmentOverview(properties) {
  const normalizedProperties = Array.isArray(properties) ? properties : [];
  const monthlyPrices = normalizedProperties
    .map((property) => parseInvestmentPrice(property.investmentPricePerMonth))
    .filter((value) => Number.isFinite(value) && value > 0);

  return {
    propertyCount: normalizedProperties.length,
    cities: new Set(normalizedProperties.map((property) => `${property.city},${property.state}`)).size,
    lowestMonthlyPrice: monthlyPrices.length > 0 ? Math.min(...monthlyPrices) : 0,
    highestMonthlyPrice: monthlyPrices.length > 0 ? Math.max(...monthlyPrices) : 0,
  };
}
