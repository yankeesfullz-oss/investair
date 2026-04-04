import { auth0 } from "./src/lib/auth0";
import { normalizeCountryCode } from "./src/lib/countryConfig";

const COUNTRY_COOKIE = "user-country";
const FALLBACK_COUNTRY = "US";

function detectCountry(request) {
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code");

  return (
    normalizeCountryCode(request.geo?.country) ||
    normalizeCountryCode(headerCountry) ||
    FALLBACK_COUNTRY
  );
}

export async function proxy(request) {
  const response = await auth0.middleware(request);
  const country = detectCountry(request);

  if (request.cookies.get(COUNTRY_COOKIE)?.value !== country) {
    response.cookies.set(COUNTRY_COOKIE, country, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
