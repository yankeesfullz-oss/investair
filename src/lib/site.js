const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://investair.online").replace(/\/$/, "");

export const PROPERTY_REVALIDATE_SECONDS = 3600;

export function getSiteUrl() {
  return SITE_URL;
}

export function absoluteUrl(path = "/") {
  if (!path) {
    return SITE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = String(path).startsWith("/") ? String(path) : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function getCanonicalPropertySegment(property) {
  return String(property?.slug || property?.id || "").trim();
}

export function getPropertyPath(property) {
  const canonicalSegment = getCanonicalPropertySegment(property);
  return canonicalSegment ? `/invest/${canonicalSegment}` : "/invest";
}