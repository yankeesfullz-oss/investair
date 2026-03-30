export function normalizeWhitespace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

export function toSlug(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function titleCaseWords(value = "") {
  return normalizeWhitespace(value)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && ["and", "at", "by", "for", "in", "of", "on", "per", "the", "to"].includes(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function isGenericAddress(address) {
  return /rental listings/i.test(String(address || ""));
}

export function cleanDisplayName(name) {
  return normalizeWhitespace(name)
    .replace(/\s*\|\s*.*$/, "")
    .replace(/\s*\-\s*[A-Za-z .'-]+,\s*MI$/i, "")
    .replace(/\s+For rent$/i, "")
    .trim();
}

export function baseSourceUrl(url = "") {
  return String(url).split("#")[0];
}

export function extractSourceCity(sourceUrl = "") {
  const apartmentsMatch = sourceUrl.match(/\/apartments\/([a-z-]+)-mi\//i);
  if (apartmentsMatch) {
    return titleCaseWords(apartmentsMatch[1]);
  }

  const rentalsMatch = sourceUrl.match(/\/([a-z-]+)-mi\/rentals\//i);
  if (rentalsMatch) {
    return titleCaseWords(rentalsMatch[1]);
  }

  return "";
}

export function extractAddressCandidate(text = "") {
  const candidates = normalizeWhitespace(text).match(/(?:\(undisclosed Address\)|[0-9][^,|]{1,120}),\s*[A-Za-z .'-]+,\s*MI(?:\s+\d{5})?/gi) || [];
  return candidates.length ? normalizeWhitespace(candidates[candidates.length - 1]) : "";
}

export function extractCityFromAddress(address = "") {
  const match = normalizeWhitespace(address).match(/,\s*([^,]+),\s*MI(?:\s+\d{5})?$/i);
  return match ? normalizeWhitespace(match[1]) : "";
}

export function extractNameFromDescription(description = "") {
  const normalized = normalizeWhitespace(description);
  if (!normalized) {
    return "";
  }

  if (normalized.includes("|")) {
    let candidate = normalized.split("|")[0];
    candidate = candidate.split(/Fees may apply/i).pop();
    candidate = candidate.replace(/^[^A-Za-z]+/, "");
    candidate = candidate.replace(/\$\s*\d[\d,]*(?:\.\d{1,2})?(?:\+|\/mo)?/gi, " ");
    candidate = candidate.replace(/\b\d+\+?\s*bd[s]?\b/gi, " ");
    candidate = candidate.replace(/\b\d+\+?\s*ba\b/gi, " ");
    candidate = candidate.replace(/\b\d[\d,]*\+?\s*sqft\b/gi, " ");
    candidate = candidate.replace(/\b(?:Apartment|Apartments|House) for rent\b/gi, " ");
    return cleanDisplayName(candidate);
  }

  const parsedAddress = extractAddressCandidate(normalized);
  if (!parsedAddress) {
    return "";
  }

  let candidate = normalized.split(parsedAddress)[0];
  candidate = candidate.split(/Fees may apply/i).pop();
  candidate = candidate.replace(/^[^A-Za-z]+/, "");
  candidate = candidate.replace(/\b(?:Apartment|Apartments|House) for rent\b/gi, " ");
  candidate = normalizeWhitespace(candidate);

  return candidate.length > 3 ? cleanDisplayName(candidate) : "";
}

export function buildName(record, parsedAddress, sourceCity) {
  const rawAddress = normalizeWhitespace(record.address);

  if (rawAddress && !isGenericAddress(rawAddress) && !/,\s*[A-Za-z .'-]+,\s*MI/i.test(rawAddress)) {
    return cleanDisplayName(rawAddress);
  }

  const descriptionName = extractNameFromDescription(record.description);
  if (descriptionName) {
    return descriptionName;
  }

  if (rawAddress && !isGenericAddress(rawAddress)) {
    return cleanDisplayName(rawAddress);
  }

  if (parsedAddress) {
    return cleanDisplayName(parsedAddress.split(",")[0]);
  }

  const sourceNameMatch = String(record.sourceUrl || "").match(/\/apartments\/[a-z-]+-mi\/([^/]+)\//i);
  if (sourceNameMatch) {
    return titleCaseWords(sourceNameMatch[1]);
  }

  return sourceCity ? `${sourceCity} Rental` : "Michigan Rental";
}

export function buildAddress(record, parsedAddress, sourceCity, name) {
  const rawAddress = normalizeWhitespace(record.address);

  if (rawAddress && !isGenericAddress(rawAddress) && /,\s*[A-Za-z .'-]+,\s*MI/i.test(rawAddress)) {
    return rawAddress;
  }

  if (parsedAddress) {
    return parsedAddress;
  }

  if (rawAddress && !isGenericAddress(rawAddress) && rawAddress !== name) {
    return rawAddress;
  }

  return sourceCity ? `${sourceCity}, MI` : "Michigan";
}

export function extractCurrencyCandidates(text = "", source = "text") {
  const normalized = String(text || "");
  return [...normalized.matchAll(/\$\s*\d[\d,]*(?:\.\d{1,2})?(?:\+)?(?:\/mo)?/gi)]
    .map((match) => {
      const amount = Number(match[0].replace(/[^0-9.]/g, ""));
      const context = normalized.slice(Math.max(0, match.index - 32), Math.min(normalized.length, match.index + match[0].length + 32)).toLowerCase();
      let score = source === "price" ? 3 : 1;

      if (amount >= 300) {
        score += 1;
      } else {
        score -= 2;
      }

      if (/deposit|security|off|save|special offer/.test(context)) {
        score -= 4;
      }

      if (/bd|ba|sqft|for rent|month|\/mo|\+/.test(context)) {
        score += 1;
      }

      return {
        amount,
        score,
        source,
      };
    })
    .filter((candidate) => Number.isFinite(candidate.amount) && candidate.amount > 0);
}

export function getBedsValue(record) {
  const values = [];
  const directMatch = String(record.beds || "").match(/^\d+$/);
  if (directMatch) {
    values.push(Number(directMatch[0]));
  }

  const variantMatch = String(record.sourceUrl || "").match(/#bedrooms-(\d+)/i);
  if (variantMatch) {
    values.push(Number(variantMatch[1]));
  }

  const textMatches = `${record.description || ""} ${record.beds || ""}`.match(/(\d+)\+?\s*bd[s]?/gi) || [];
  for (const textMatch of textMatches) {
    const numberMatch = textMatch.match(/\d+/);
    if (numberMatch) {
      values.push(Number(numberMatch[0]));
    }
  }

  const cleaned = values.filter((value) => Number.isFinite(value) && value > 0 && value < 10);
  return cleaned.length ? Math.max(...cleaned) : null;
}

export function getBathsValue(record) {
  const values = [];
  const directMatch = String(record.baths || "").match(/^\d+(?:\.\d+)?$/);
  if (directMatch) {
    values.push(Number(directMatch[0]));
  }

  const textMatches = `${record.description || ""} ${record.baths || ""} ${record.beds || ""}`.match(/(\d+(?:\.\d+)?)\+?\s*ba/gi) || [];
  for (const textMatch of textMatches) {
    const numberMatch = textMatch.match(/\d+(?:\.\d+)?/);
    if (numberMatch) {
      values.push(Number(numberMatch[0]));
    }
  }

  const cleaned = values.filter((value) => Number.isFinite(value) && value > 0 && value < 10);
  return cleaned.length ? Math.max(...cleaned) : null;
}

export function choosePrimaryRecord(records) {
  return [...records].sort((first, second) => {
    const firstScore = Number(String(first.sourceUrl || "").includes("/apartments/")) + Number(!isGenericAddress(first.address));
    const secondScore = Number(String(second.sourceUrl || "").includes("/apartments/")) + Number(!isGenericAddress(second.address));

    if (secondScore !== firstScore) {
      return secondScore - firstScore;
    }

    return normalizeWhitespace(second.description).length - normalizeWhitespace(first.description).length;
  })[0];
}

export function buildSummary(description, name, city) {
  let text = normalizeWhitespace(description)
    .replace(/\bShow more\b/gi, "")
    .replace(/Save Previous photo Next photo/gi, "")
    .replace(/Check availability/gi, "")
    .replace(/More \d+ days ago/gi, "")
    .trim();

  if (!text) {
    return `${name} rental opportunity in ${city}, Michigan.`;
  }

  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  const summary = normalizeWhitespace(firstSentence);

  if (summary.length <= 180) {
    return summary;
  }

  return `${summary.slice(0, 177).trimEnd()}...`;
}

export function mergeUniqueStrings(values) {
  return [...new Set(values.map((value) => normalizeWhitespace(value)).filter(Boolean))];
}

export function choosePrice(records) {
  const candidates = [];

  for (const record of records) {
    const generic = isGenericAddress(record.address);
    const sourceBonus = String(record.sourceUrl || "").includes("/apartments/") ? 1 : 0;
    const addressBonus = generic ? 0 : 1;
    const fields = [
      [record.price, "price"],
      [record.description, "description"],
      [record.beds, "beds"],
      [record.baths, "baths"],
    ];

    for (const [value, source] of fields) {
      for (const candidate of extractCurrencyCandidates(value, source)) {
        let score = candidate.score + sourceBonus + addressBonus;
        const descriptionText = normalizeWhitespace(`${record.description || ""} ${record.beds || ""} ${record.baths || ""}`).replace(/,/g, "").toLowerCase();
        const amountText = String(candidate.amount).replace(/\.0+$/, "");
        const amountPattern = new RegExp(`\\$\\s*${amountText}(?:\\.0{1,2})?[^$]{0,40}(deposit|off)|(?:deposit|off)[^$]{0,40}\\$\\s*${amountText}(?:\\.0{1,2})?`, "i");
        if (amountPattern.test(descriptionText)) {
          score -= 4;
        }

        candidates.push({
          amount: candidate.amount,
          score,
        });
      }
    }
  }

  if (!candidates.length) {
    return "$0";
  }

  candidates.sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }
    return first.amount - second.amount;
  });

  const best = candidates[0];
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(best.amount);
}

export function normalizeRawMichiganProperties(rawRecords) {
  const grouped = new Map();

  for (const record of rawRecords) {
    const parsedAddress = extractAddressCandidate(record.description);
    const sourceCity = extractSourceCity(record.sourceUrl);
    const name = buildName(record, parsedAddress, sourceCity);
    const address = buildAddress(record, parsedAddress, sourceCity, name);
    const city = extractCityFromAddress(address) || sourceCity || "Michigan";
    const id = toSlug(`${name}-${city}`) || toSlug(baseSourceUrl(record.sourceUrl)) || `michigan-property-${grouped.size + 1}`;

    if (!grouped.has(id)) {
      grouped.set(id, []);
    }

    grouped.get(id).push({
      ...record,
      _normalizedName: name,
      _normalizedAddress: address,
      _normalizedCity: city,
    });
  }

  return [...grouped.entries()].map(([id, records]) => {
    const primaryRecord = choosePrimaryRecord(records);
    const images = mergeUniqueStrings(records.flatMap((record) => Array.isArray(record.images) ? record.images : []));
    const sourceUrls = mergeUniqueStrings(records.map((record) => record.sourceUrl));
    const uploadFailures = records.flatMap((record) => Array.isArray(record.uploadFailures) ? record.uploadFailures : []);
    const descriptions = records
      .filter((record) => normalizeWhitespace(record.description))
      .sort((first, second) => {
        const firstScore = Number(!isGenericAddress(first.address)) * 1000 + normalizeWhitespace(first.description).length;
        const secondScore = Number(!isGenericAddress(second.address)) * 1000 + normalizeWhitespace(second.description).length;
        return secondScore - firstScore;
      });
    const description = descriptions.length ? normalizeWhitespace(descriptions[0].description).replace(/\bShow more\b/gi, "").trim() : "";
    const beds = records.map(getBedsValue).filter((value) => value !== null);
    const baths = records.map(getBathsValue).filter((value) => value !== null);
    const scrapedAt = records
      .map((record) => String(record.scrapedAt || ""))
      .filter(Boolean)
      .sort()
      .at(-1) || "";

    return {
      id,
      name: primaryRecord._normalizedName,
      city: primaryRecord._normalizedCity,
      state: "MI",
      address: primaryRecord._normalizedAddress,
      beds: beds.length ? Math.max(...beds) : null,
      baths: baths.length ? Math.max(...baths) : null,
      investmentPricePerMonth: choosePrice(records),
      summary: buildSummary(description, primaryRecord._normalizedName, primaryRecord._normalizedCity),
      image: images[0] || "",
      images,
      description,
      listingType: primaryRecord.listingType || "rent",
      price: primaryRecord.price || choosePrice(records),
      scrapedAt,
      sourceUrl: baseSourceUrl(primaryRecord.sourceUrl),
      sourceUrls,
      uploadFailures,
      variants: records.map((record) => ({
        address: normalizeWhitespace(record.address),
        beds: normalizeWhitespace(record.beds),
        baths: normalizeWhitespace(record.baths),
        price: normalizeWhitespace(record.price),
        scrapedAt: record.scrapedAt || "",
        sourceUrl: record.sourceUrl || "",
      })),
    };
  });
}

export function isNormalizedMichiganPropertyRecord(record) {
  return Boolean(
    record
    && typeof record === "object"
    && typeof record.id === "string"
    && typeof record.name === "string"
    && typeof record.city === "string"
    && typeof record.state === "string"
    && typeof record.investmentPricePerMonth === "string"
    && Array.isArray(record.images),
  );
}

export function coerceMichiganProperties(records) {
  if (!Array.isArray(records)) {
    return [];
  }

  if (records.every(isNormalizedMichiganPropertyRecord)) {
    return records;
  }

  return normalizeRawMichiganProperties(records);
}

export function validateNormalizedMichiganProperties(properties) {
  const issues = [];

  for (const property of properties) {
    if (!property.name || property.name.length < 3) {
      issues.push({ severity: "error", id: property.id, rule: "missing-name", message: "Property name is missing or too short." });
    }

    if (!property.address || property.address === "Michigan" || property.address.length < 5) {
      issues.push({ severity: "error", id: property.id, rule: "missing-address", message: "Property address could not be resolved." });
    }

    if (!property.city || property.city === "Michigan") {
      issues.push({ severity: "warning", id: property.id, rule: "missing-city", message: "Property city appears unresolved." });
    }

    if (!property.image) {
      issues.push({ severity: "error", id: property.id, rule: "missing-primary-image", message: "Property has no primary image." });
    }

    if (!Array.isArray(property.images) || property.images.length === 0) {
      issues.push({ severity: "error", id: property.id, rule: "missing-images", message: "Property has no image gallery." });
    }

    if (!property.description || property.description.length < 40) {
      issues.push({ severity: "warning", id: property.id, rule: "short-description", message: "Property description is short or missing." });
    }

    const monthlyPrice = Number(String(property.investmentPricePerMonth || "").replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(monthlyPrice) || monthlyPrice <= 0) {
      issues.push({ severity: "error", id: property.id, rule: "invalid-price", message: "Monthly price could not be parsed." });
    } else if (monthlyPrice < 300) {
      issues.push({ severity: "warning", id: property.id, rule: "suspicious-price", message: `Monthly price looks suspiciously low: ${property.investmentPricePerMonth}.` });
    }

    if (!property.sourceUrl) {
      issues.push({ severity: "warning", id: property.id, rule: "missing-source-url", message: "Primary source URL is missing." });
    }

    if (!Array.isArray(property.sourceUrls) || property.sourceUrls.length === 0) {
      issues.push({ severity: "warning", id: property.id, rule: "missing-source-variants", message: "No source URL variants were captured." });
    }
  }

  return issues;
}
