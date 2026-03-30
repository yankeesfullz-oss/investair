import { michiganInvestmentProperties as rawMichiganInvestmentProperties } from "@/lib/michiganInvestmentProperties";
import { floridaInvestmentProperties as rawFloridaInvestmentProperties } from "@/lib/floridaInvestmentProperties";

const NON_PROPERTY_IMAGE_PATTERNS = [
  /app-store-badge/i,
  /google-play-badge/i,
  /footer-art/i,
  /facebook\.com\/tr/i,
  /bat\.bing\.com/i,
  /teads\.tv/i,
  /maps\.googleapis\.com\/maps\/api\/staticmap/i,
  /zillowstatic\.com\/static\/images\/nophoto/i,
];

const PET_PATTERNS = [/dogs?\s*allowed/i, /cats?\s*allowed/i, /pet[-\s]?friendly/i, /no pets/i];

const TOUR_HOST_PATTERNS = [
  /youtube\.com/i,
  /youtu\.be/i,
  /matterport\.com/i,
  /ricoh360\.com/i,
  /tourbuilder\.com/i,
  /zillow\.com\/homedetails\//i,
  /view\./i,
  /viewer\./i,
];

const demoImagePool = [
  "https://res.cloudinary.com/daiii0a2n/image/upload/v1774103631/homes-scraper/rwml3x1ds15jre3tf9el.webp",
  "https://res.cloudinary.com/daiii0a2n/image/upload/v1774103714/homes-scraper/q0wo74wll6ghygaz1rds.webp",
  "https://res.cloudinary.com/daiii0a2n/image/upload/v1774104297/homes-scraper/yysu9tw3eei0lbjbim7h.webp",
  "https://res.cloudinary.com/daiii0a2n/image/upload/v1774104387/homes-scraper/vmthabluv7uloba9ldsx.webp",
  "https://res.cloudinary.com/daiii0a2n/image/upload/v1774109509/homes-scraper/kfmpewdwvjazzs0v5hr9.jpg",
];

function createStableHash(value) {
  return String(value || '').split('').reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) % 1000003;
  }, 7);
}

function seededRange(seed, min, max) {
  const hash = createStableHash(seed);
  const span = max - min;
  return min + (hash % (span + 1));
}

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

const usaDemoMarkets = [
  { state: "AL", stateName: "Alabama", city: "Birmingham", neighborhood: "Downtown", beds: 2, baths: 2, price: "$1,420" },
  { state: "AK", stateName: "Alaska", city: "Anchorage", neighborhood: "Midtown", beds: 2, baths: 1, price: "$1,680" },
  { state: "AZ", stateName: "Arizona", city: "Scottsdale", neighborhood: "Old Town", beds: 2, baths: 2, price: "$1,950" },
  { state: "AR", stateName: "Arkansas", city: "Bentonville", neighborhood: "Market District", beds: 2, baths: 2, price: "$1,375" },
  { state: "CA", stateName: "California", city: "San Diego", neighborhood: "Little Italy", beds: 1, baths: 1, price: "$2,950" },
  { state: "CO", stateName: "Colorado", city: "Denver", neighborhood: "RiNo", beds: 2, baths: 2, price: "$2,240" },
  { state: "CT", stateName: "Connecticut", city: "Stamford", neighborhood: "Harbor Point", beds: 1, baths: 1, price: "$2,180" },
  { state: "DE", stateName: "Delaware", city: "Wilmington", neighborhood: "Riverfront", beds: 2, baths: 2, price: "$1,560" },
  { state: "GA", stateName: "Georgia", city: "Atlanta", neighborhood: "Midtown", beds: 2, baths: 2, price: "$1,890" },
  { state: "HI", stateName: "Hawaii", city: "Honolulu", neighborhood: "Waikiki", beds: 1, baths: 1, price: "$2,480" },
  { state: "ID", stateName: "Idaho", city: "Boise", neighborhood: "Downtown", beds: 2, baths: 2, price: "$1,640" },
  { state: "IL", stateName: "Illinois", city: "Chicago", neighborhood: "West Loop", beds: 2, baths: 2, price: "$2,360" },
  { state: "IN", stateName: "Indiana", city: "Indianapolis", neighborhood: "Mass Ave", beds: 2, baths: 2, price: "$1,520" },
  { state: "IA", stateName: "Iowa", city: "Des Moines", neighborhood: "East Village", beds: 2, baths: 2, price: "$1,430" },
  { state: "KS", stateName: "Kansas", city: "Overland Park", neighborhood: "Downtown", beds: 2, baths: 2, price: "$1,460" },
  { state: "KY", stateName: "Kentucky", city: "Louisville", neighborhood: "NuLu", beds: 2, baths: 1, price: "$1,390" },
  { state: "LA", stateName: "Louisiana", city: "New Orleans", neighborhood: "Warehouse District", beds: 1, baths: 1, price: "$1,840" },
  { state: "ME", stateName: "Maine", city: "Portland", neighborhood: "Old Port", beds: 1, baths: 1, price: "$1,720" },
  { state: "MD", stateName: "Maryland", city: "Baltimore", neighborhood: "Harbor East", beds: 2, baths: 2, price: "$1,760" },
  { state: "MA", stateName: "Massachusetts", city: "Boston", neighborhood: "Seaport", beds: 1, baths: 1, price: "$2,880" },
  { state: "MN", stateName: "Minnesota", city: "Minneapolis", neighborhood: "North Loop", beds: 2, baths: 2, price: "$1,940" },
  { state: "MS", stateName: "Mississippi", city: "Biloxi", neighborhood: "Beach Boulevard", beds: 2, baths: 2, price: "$1,280" },
  { state: "MO", stateName: "Missouri", city: "Kansas City", neighborhood: "Crossroads", beds: 2, baths: 2, price: "$1,510" },
  { state: "MT", stateName: "Montana", city: "Bozeman", neighborhood: "Main Street", beds: 2, baths: 1, price: "$1,820" },
  { state: "NE", stateName: "Nebraska", city: "Omaha", neighborhood: "Old Market", beds: 2, baths: 2, price: "$1,410" },
  { state: "NV", stateName: "Nevada", city: "Las Vegas", neighborhood: "Summerlin", beds: 2, baths: 2, price: "$1,870" },
  { state: "NH", stateName: "New Hampshire", city: "Portsmouth", neighborhood: "Market Square", beds: 1, baths: 1, price: "$1,860" },
  { state: "NJ", stateName: "New Jersey", city: "Jersey City", neighborhood: "Exchange Place", beds: 1, baths: 1, price: "$2,540" },
  { state: "NM", stateName: "New Mexico", city: "Santa Fe", neighborhood: "Railyard", beds: 2, baths: 2, price: "$1,690" },
  { state: "NY", stateName: "New York", city: "Buffalo", neighborhood: "Elmwood Village", beds: 2, baths: 1, price: "$1,760" },
  { state: "NC", stateName: "North Carolina", city: "Charlotte", neighborhood: "South End", beds: 2, baths: 2, price: "$1,920" },
  { state: "ND", stateName: "North Dakota", city: "Fargo", neighborhood: "Broadway", beds: 2, baths: 1, price: "$1,280" },
  { state: "OH", stateName: "Ohio", city: "Columbus", neighborhood: "Short North", beds: 2, baths: 2, price: "$1,640" },
  { state: "OK", stateName: "Oklahoma", city: "Oklahoma City", neighborhood: "Bricktown", beds: 2, baths: 2, price: "$1,360" },
  { state: "OR", stateName: "Oregon", city: "Portland", neighborhood: "Pearl District", beds: 1, baths: 1, price: "$1,980" },
  { state: "PA", stateName: "Pennsylvania", city: "Philadelphia", neighborhood: "Fishtown", beds: 2, baths: 2, price: "$1,960" },
  { state: "RI", stateName: "Rhode Island", city: "Providence", neighborhood: "College Hill", beds: 1, baths: 1, price: "$1,650" },
  { state: "SC", stateName: "South Carolina", city: "Charleston", neighborhood: "Upper King", beds: 2, baths: 2, price: "$1,880" },
  { state: "SD", stateName: "South Dakota", city: "Sioux Falls", neighborhood: "Downtown", beds: 2, baths: 2, price: "$1,310" },
  { state: "TN", stateName: "Tennessee", city: "Nashville", neighborhood: "The Gulch", beds: 1, baths: 1, price: "$2,120" },
  { state: "TX", stateName: "Texas", city: "Austin", neighborhood: "South Congress", beds: 2, baths: 2, price: "$2,060" },
  { state: "UT", stateName: "Utah", city: "Salt Lake City", neighborhood: "Sugar House", beds: 2, baths: 2, price: "$1,740" },
  { state: "VT", stateName: "Vermont", city: "Burlington", neighborhood: "Waterfront", beds: 1, baths: 1, price: "$1,700" },
  { state: "VA", stateName: "Virginia", city: "Arlington", neighborhood: "Clarendon", beds: 1, baths: 1, price: "$2,260" },
  { state: "WA", stateName: "Washington", city: "Seattle", neighborhood: "Capitol Hill", beds: 1, baths: 1, price: "$2,420" },
  { state: "WV", stateName: "West Virginia", city: "Morgantown", neighborhood: "High Street", beds: 2, baths: 2, price: "$1,240" },
  { state: "WI", stateName: "Wisconsin", city: "Milwaukee", neighborhood: "Third Ward", beds: 2, baths: 2, price: "$1,570" },
  { state: "WY", stateName: "Wyoming", city: "Jackson", neighborhood: "Town Square", beds: 2, baths: 1, price: "$2,140" },
];

function toSlug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function compactList(values) {
  return [...new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractPropertyId(url, fallbackId) {
  const cleanedUrl = String(url || "").split(/[?#]/)[0].replace(/\/$/, "");
  const lastSegment = cleanedUrl.split("/").filter(Boolean).pop();

  return lastSegment || fallbackId || toSlug(cleanedUrl || "property");
}

function isPropertyImage(url) {
  if (!url || !/^https?:/i.test(url)) {
    return false;
  }

  if (NON_PROPERTY_IMAGE_PATTERNS.some((pattern) => pattern.test(url))) {
    return false;
  }

  return /\.(?:webp|jpg|jpeg|png|gif)(?:$|\?)/i.test(url) || /photos\.zillowstatic\.com/i.test(url);
}

function sanitizeImages(...collections) {
  const images = compactList(collections.flat().filter(isPropertyImage));
  return images;
}

function sanitizeVirtualTours(...collections) {
  return compactList(
    collections
      .flat()
      .filter((url) => /^https?:/i.test(String(url || "")))
      .filter((url) => TOUR_HOST_PATTERNS.some((pattern) => pattern.test(url)))
  );
}

function prettifyListingType(...values) {
  const rawValue = values.find((value) => typeof value === "string" && value.trim());

  if (!rawValue) {
    return "Rental listing";
  }

  const normalizedValue = normalizeWhitespace(rawValue).toLowerCase();

  if (normalizedValue.includes("condo")) {
    return "Condo building";
  }

  if (normalizedValue.includes("building") || normalizedValue.includes("apartment")) {
    return "Apartment building";
  }

  if (normalizedValue.includes("townhouse")) {
    return "Townhouse";
  }

  return rawValue;
}

function extractPhone(...values) {
  const joined = values.map((value) => String(value || "")).join(" ");
  const match = joined.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  return match ? match[0].replace(/\s+/g, " ").trim() : "";
}

function toBedLabel(value, fallbackText = "") {
  if (typeof value === "number") {
    return value === 0 ? "Studio" : `${value} bed${value === 1 ? "" : "s"}`;
  }

  const normalizedValue = normalizeWhitespace(value);

  if (!normalizedValue) {
    const fallback = normalizeWhitespace(fallbackText);
    if (/studio/i.test(fallback)) {
      return "Studio";
    }

    const match = fallback.match(/(\d+)\s*(?:bd|bed)/i);
    if (match) {
      const count = Number(match[1]);
      return `${count} bed${count === 1 ? "" : "s"}`;
    }

    return "Bed info on listing";
  }

  if (/studio/i.test(normalizedValue)) {
    return normalizedValue === "Studio" ? "Studio" : normalizedValue;
  }

  if (/bed/i.test(normalizedValue)) {
    return normalizedValue;
  }

  const numericValue = Number(normalizedValue);
  if (!Number.isNaN(numericValue) && numericValue > 0) {
    return `${numericValue} bed${numericValue === 1 ? "" : "s"}`;
  }

  return normalizedValue;
}

function toBathLabel(value, fallbackText = "") {
  if (typeof value === "number") {
    return `${value} bath${value === 1 ? "" : "s"}`;
  }

  const normalizedValue = normalizeWhitespace(value);

  if (!normalizedValue) {
    const fallback = normalizeWhitespace(fallbackText);
    const match = fallback.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath)/i);
    if (match) {
      return `${match[1]} bath${match[1] === "1" ? "" : "s"}`;
    }

    return "Bath info on listing";
  }

  if (/bath/i.test(normalizedValue)) {
    return normalizedValue;
  }

  const numericValue = Number(normalizedValue);
  if (!Number.isNaN(numericValue) && numericValue > 0) {
    return `${numericValue} bath${numericValue === 1 ? "" : "s"}`;
  }

  return normalizedValue;
}

function extractCount(label) {
  if (/studio/i.test(String(label || ""))) {
    return 0;
  }

  const match = String(label || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function normalizeSqft(value, fallbackText = "") {
  const normalizedValue = normalizeWhitespace(value);

  if (normalizedValue) {
    return /sq\s*ft/i.test(normalizedValue) ? normalizedValue : `${normalizedValue} sqft`;
  }

  const fallbackMatch = String(fallbackText || "").match(/(\d[\d,]*)\s*sq\s*ft/i);
  if (fallbackMatch) {
    return `${fallbackMatch[1]} sqft`;
  }

  return "Sqft on listing";
}

function deriveAmenities(record) {
  const seedAmenities = compactList(record.amenities || []);
  const inferredAmenities = [];

  if (record.centralAir) {
    inferredAmenities.push("Central air conditioning");
  }

  if (record.sharedLaundry) {
    inferredAmenities.push("Shared laundry");
  }

  if (record.poolAvailable || record.pool) {
    inferredAmenities.push("Pool access");
  }

  if (record.gym) {
    inferredAmenities.push("Fitness center");
  }

  if (record.attachedGarage) {
    inferredAmenities.push("Attached garage");
  }

  if (record.furnishedAvailable || record.furnished) {
    inferredAmenities.push("Furnished options");
  }

  return compactList([...seedAmenities, ...inferredAmenities]).filter(
    (amenity) => !PET_PATTERNS.some((pattern) => pattern.test(amenity))
  );
}

function derivePets(record) {
  const petEntries = compactList([...(record.pets || []), ...(record.amenities || [])]).filter((item) =>
    PET_PATTERNS.some((pattern) => pattern.test(item))
  );

  if (petEntries.length > 0) {
    return petEntries;
  }

  if (record.petFriendly) {
    return ["Pet-friendly policy listed on source"]; 
  }

  return [];
}

function deriveAvailability(record, description) {
  const explicitAvailability = normalizeWhitespace(record.availability);
  if (explicitAvailability) {
    return explicitAvailability;
  }

  const text = `${record.description || ""} ${record.summary || ""} ${description || ""}`;
  const juneMatch = text.match(/available\s+in\s+([A-Za-z]+)/i);
  if (juneMatch) {
    return `Available in ${juneMatch[1]}`;
  }

  if (/available now/i.test(text)) {
    return "Available now";
  }

  if (/check availability/i.test(text)) {
    return "Check availability";
  }

  return "Contact for availability";
}

function buildAddress(record, propertyName) {
  const rawAddress = normalizeWhitespace(record.address);

  if (rawAddress && rawAddress !== propertyName) {
    return rawAddress;
  }

  const locationParts = [record.city, record.state].filter(Boolean);
  if (locationParts.length > 0) {
    return `${propertyName}, ${locationParts.join(", ")}`;
  }

  return propertyName;
}

function buildDescription(record) {
  return normalizeWhitespace(record.description || record.summary || "Property details available on the source listing.");
}

function buildSummary(record, description) {
  if (normalizeWhitespace(record.summary)) {
    return normalizeWhitespace(record.summary);
  }

  const sentence = description.split(/(?<=[.!?])\s+/)[0];
  return normalizeWhitespace(sentence || description);
}

function normalizeCatalogProperty(record, stateOverride) {
  const propertyName = normalizeWhitespace(record.propertyName || record.name || "Property");
  const url = record.url || record.sourceUrl || "";
  const description = buildDescription(record);
  const amenities = deriveAmenities(record);
  const images = sanitizeImages(record.images, record.rawImageUrls, record.image ? [record.image] : []);
  const virtualTours = sanitizeVirtualTours(record.virtualTours, record.virtualTourLinks, record.videoLinks);
  const floorPlans = compactList([...(record.floorPlans || []), ...(record.floorPlanImageUrls || [])]);
  const beds = toBedLabel(record.beds, `${description} ${record.price || ""}`);
  const baths = toBathLabel(record.baths, `${description} ${record.price || ""}`);
  const propertyId = normalizeWhitespace(record.propertyId || extractPropertyId(url, record.id));
  const normalizedAddress = buildAddress(record, propertyName);
  const summary = buildSummary(record, description);
  const monthlyPrice = parseInvestmentPrice(record.investmentPricePerMonth || record.price || '$0');
  const currentDailyPayoutAmount = Number(record.currentDailyPayoutAmount || Math.max(22, Math.round(monthlyPrice / 18)));
  const projectedMonthlyPayoutAmount = Number(record.projectedMonthlyPayoutAmount || currentDailyPayoutAmount * 30);
  const occupancyScore = Number(record.occupancyScore || seededRange(`${propertyId}-occupancy`, 72, 96));
  const demandScore = Number(record.demandScore || seededRange(`${propertyId}-demand`, 68, 95));
  const fundedPercentage = Number(record.fundedPercentage || seededRange(`${propertyId}-funded`, 22, 91));
  const totalInvestors = Number(record.totalInvestors || seededRange(`${propertyId}-investors`, 3, 28));
  const allowedDurations = Array.isArray(record.allowedDurations) && record.allowedDurations.length > 0
    ? compactList(record.allowedDurations).map(Number).filter((value) => Number.isFinite(value) && value > 0)
    : [2, 3, 6, 12];
  const riskLevel = record.riskLevel
    || (occupancyScore >= 88 && demandScore >= 88 ? 'low' : occupancyScore >= 78 ? 'moderate' : 'elevated');
  const investorHeadline = normalizeWhitespace(
    record.investorHeadline || `${record.city || stateOverride || 'Prime'} short-stay cashflow corridor`
  );
  const investorSummary = normalizeWhitespace(
    record.investorSummary
      || `${summary} Positioned for ${occupancyScore}% occupancy strength with admin-managed daily payout guidance of ${formatUsd(currentDailyPayoutAmount)}.`
  );
  const highlights = compactList(
    record.highlights || [
      `${occupancyScore}% occupancy score for this market story`,
      `${formatUsd(currentDailyPayoutAmount)} current admin-set daily payout`,
      `${fundedPercentage}% of the slot allocation already committed`,
    ]
  );
  const trustBadges = compactList(
    record.trustBadges || ['Admin-managed payout policy', 'Structured duration ladder', 'Normalized listing due diligence']
  );
  const fundingStatus = fundedPercentage >= 90 ? 'nearly_funded' : fundedPercentage >= 65 ? 'building' : 'open';

  return {
    ...record,
    id: record.id || `${toSlug(propertyName)}-${toSlug(record.city || stateOverride || "usa")}`,
    source: normalizeWhitespace(record.source || "Zillow"),
    propertyId,
    propertyName,
    name: propertyName,
    url,
    sourceUrl: record.sourceUrl || url,
    sourceUrls: compactList([record.sourceUrl, url, ...(record.sourceUrls || [])]),
    listingType: prettifyListingType(record.listingType, record.propertyType),
    price: normalizeWhitespace(record.price || record.investmentPricePerMonth || "$0"),
    investmentPricePerMonth: normalizeWhitespace(record.investmentPricePerMonth || record.price || "$0"),
    monthlyInvestmentAmount: monthlyPrice,
    currentDailyPayoutAmount,
    projectedMonthlyPayoutAmount,
    projectedAnnualPayoutAmount: Number(record.projectedAnnualPayoutAmount || projectedMonthlyPayoutAmount * 12),
    occupancyScore,
    demandScore,
    fundedPercentage,
    totalInvestors,
    minimumInvestmentMonths: Number(record.minimumInvestmentMonths || allowedDurations[0] || 2),
    allowedDurations,
    riskLevel,
    investorHeadline,
    investorSummary,
    highlights,
    trustBadges,
    fundingStatus,
    beds,
    baths,
    bedsCount: extractCount(beds),
    bathsCount: extractCount(baths),
    sqft: normalizeSqft(record.sqft || record.livingArea, description),
    address: normalizedAddress,
    city: normalizeWhitespace(record.city || ""),
    state: normalizeWhitespace(record.state || stateOverride || ""),
    zip: normalizeWhitespace(record.zip || record.zipCode || ""),
    description,
    summary,
    amenities,
    image: images[0] || record.image || demoImagePool[0],
    images,
    floorPlans,
    manager: normalizeWhitespace(record.manager || `${propertyName} leasing team`),
    phone: extractPhone(record.phone, record.description, record.summary),
    availability: deriveAvailability(record, description),
    pets: derivePets(record),
    virtualTours,
    coverImage: record.coverImage || images[0] || record.image || demoImagePool[0],
    scrapedAt: record.scrapedAt || new Date().toISOString(),
  };
}

function createDemoProperty(market, index) {
  return normalizeCatalogProperty(
    {
      id: `${toSlug(market.stateName)}-${toSlug(market.city)}-demo-property`,
      propertyId: `${toSlug(market.stateName)}-${toSlug(market.city)}-demo`,
      propertyName: `${market.city} Executive Stay`,
      city: market.city,
      state: market.state,
      address: `${market.neighborhood}, ${market.city}, ${market.state}`,
      beds: market.beds,
      baths: market.baths,
      sqft: "750 sqft",
      price: market.price,
      investmentPricePerMonth: market.price,
      summary: `Demo investment opportunity in ${market.city}, ${market.stateName}, positioned for short-term rental demand near ${market.neighborhood}.`,
      description: `Demo property in ${market.city}, ${market.stateName} created to keep nationwide inventory coverage while live sourced markets grow.`,
      images: [demoImagePool[index % demoImagePool.length]],
      amenities: ["Central air conditioning", "Flexible lease structure", "Prime neighborhood access"],
      manager: "Investair demo sourcing",
      availability: "Available now",
      url: `https://www.zillow.com/${market.state.toLowerCase()}/rentals/`,
    },
    market.state
  );
}

const featuredInvestmentProperties = [
  normalizeCatalogProperty(
    {
      id: 'the-watts-hampton-cove',
      propertyId: 'the-watts-hampton-cove',
      name: 'The Watts at Hampton Cove',
      slug: 'the-watts-hampton-cove',
      location: 'Huntsville, AL',
      address: '7235 Highway 431 S, Owens Cross Roads, AL 35763',
      city: 'Huntsville',
      state: 'AL',
      zip: '35763',
      description: 'Modern rental asset in the Huntsville growth corridor with investor-friendly daily payout structure.',
      summary: 'Reserve rental income access and receive daily profits with flexible withdrawals.',
      totalValue: 325000,
      availableUnits: 0,
      expectedAnnualYield: 0,
      price: '$1,200',
      investmentPricePerMonth: '$1,200',
      slotBasePriceMonthly: 1200,
      minimumInvestmentMonths: 3,
      maximumInvestmentMonths: 15,
      allowedDurations: [3, 6, 9, 12, 15],
      payoutCurrency: 'USDT',
      currentDailyPayoutAmount: 18,
      payoutMode: 'manual_daily',
      investmentStatus: 'active',
      featured: true,
      verified: true,
      profitsWithdrawAnytime: true,
      capitalWithdrawAnytime: true,
      adminWithdrawalApproval: true,
      estimatedMonthlyProfit: 540,
      estimatedQuarterlyProfit: 1620,
      estimatedYearlyProfit: 6480,
      projectedMonthlyPayoutAmount: 540,
      projectedAnnualPayoutAmount: 6480,
      occupancyScore: 91,
      demandScore: 87,
      riskLevel: 'low',
      operatorManaged: true,
      investorHeadline: 'Modern Huntsville rental asset with daily earning potential',
      investorSummary: 'Reserve a rental income period and receive daily profits while maintaining flexible withdrawals.',
      fundedPercentage: 68,
      totalInvestors: 12,
      activeReservations: 7,
      recentPayoutsCount: 84,
      nextAvailableStartDate: '2026-04-05',
      blockedDateRanges: [
        { start: '2026-04-10', end: '2026-07-10' },
        { start: '2026-08-01', end: '2026-11-01' },
      ],
      listingType: 'Apartment Building',
      marketType: 'Short-Term Rental',
      source: 'Zillow',
      sourceUrl: 'https://www.zillow.com/apartments/huntsville-al/the-watts/CqC3KZ/',
      beds: '1-3 Beds',
      baths: '1-2 Baths',
      sqft: '871-1,228 sqft',
      yearBuilt: 2022,
      amenities: [
        'Resort-style saltwater pool',
        'Fitness studio',
        'Washer and dryer in all homes',
        'Smart keyless entry',
      ],
      images: [
        'https://photos.zillowstatic.com/fp/ffa7a49407b03ec4a31897b4f26e605f-sr_960_640.webp',
        'https://photos.zillowstatic.com/fp/b1351592fcd307f4193b745f086e4eb7-sr_960_640.webp',
      ],
      status: 'active',
      isPublished: true,
    },
    'AL'
  ),
];

const demoInvestmentProperties = usaDemoMarkets.map(createDemoProperty);

export const michiganInvestmentProperties = rawMichiganInvestmentProperties.map((property) =>
  normalizeCatalogProperty(property, "MI")
);

export const floridaInvestmentProperties = rawFloridaInvestmentProperties.map((property) =>
  normalizeCatalogProperty(property, "FL")
);

export const investmentProperties = [
  ...featuredInvestmentProperties,
  ...michiganInvestmentProperties,
  ...floridaInvestmentProperties,
  ...demoInvestmentProperties,
];

export function parseInvestmentPrice(value) {
  return Number(String(value || "0").replace(/[^0-9.]/g, "")) || 0;
}

export function getInvestmentPropertyById(propertyId) {
  return investmentProperties.find((property) => property.id === propertyId) || null;
}

export function getInvestmentPropertiesSorted(selectedPropertyId) {
  const properties = [...investmentProperties].sort((first, second) => {
    return parseInvestmentPrice(second.investmentPricePerMonth) - parseInvestmentPrice(first.investmentPricePerMonth);
  });

  if (!selectedPropertyId) {
    return properties;
  }

  const selectedIndex = properties.findIndex((property) => property.id === selectedPropertyId);
  if (selectedIndex <= 0) {
    return properties;
  }

  const [selectedProperty] = properties.splice(selectedIndex, 1);
  return [selectedProperty, ...properties];
}

export function getInvestmentOverview() {
  const propertyCount = investmentProperties.length;
  const cities = new Set(investmentProperties.map((property) => `${property.city},${property.state}`)).size;
  const monthlyPrices = investmentProperties.map((property) => parseInvestmentPrice(property.investmentPricePerMonth));

  return {
    propertyCount,
    cities,
    lowestMonthlyPrice: Math.min(...monthlyPrices),
    highestMonthlyPrice: Math.max(...monthlyPrices),
  };
}
