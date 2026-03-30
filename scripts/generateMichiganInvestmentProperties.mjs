import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { coerceMichiganProperties } from "./lib/michiganPropertyDataTools.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "src", "lib", "data");
const targetPath = path.join(projectRoot, "src", "lib", "michiganInvestmentProperties.js");

const rawRecords = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const michiganInvestmentProperties = coerceMichiganProperties(rawRecords);

const fileContent = `export const michiganInvestmentProperties = ${JSON.stringify(michiganInvestmentProperties, null, 2)};\n\nexport function parseInvestmentPrice(value) {\n  return Number(String(value || \"0\").replace(/[^0-9.]/g, \"\")) || 0;\n}\n\nexport function getInvestmentPropertyById(propertyId) {\n  return michiganInvestmentProperties.find((property) => property.id === propertyId) || null;\n}\n\nexport function getInvestmentPropertiesSorted(selectedPropertyId) {\n  const properties = [...michiganInvestmentProperties].sort((first, second) => {\n    return parseInvestmentPrice(second.investmentPricePerMonth) - parseInvestmentPrice(first.investmentPricePerMonth);\n  });\n\n  if (!selectedPropertyId) {\n    return properties;\n  }\n\n  const selectedIndex = properties.findIndex((property) => property.id === selectedPropertyId);\n  if (selectedIndex <= 0) {\n    return properties;\n  }\n\n  const [selectedProperty] = properties.splice(selectedIndex, 1);\n  return [selectedProperty, ...properties];\n}\n\nexport function getInvestmentOverview() {\n  const propertyCount = michiganInvestmentProperties.length;\n  const cities = new Set(michiganInvestmentProperties.map((property) => property.city)).size;\n  const monthlyPrices = michiganInvestmentProperties.map((property) => parseInvestmentPrice(property.investmentPricePerMonth));\n\n  return {\n    propertyCount,\n    cities,\n    lowestMonthlyPrice: Math.min(...monthlyPrices),\n    highestMonthlyPrice: Math.max(...monthlyPrices),\n  };\n}\n`;

fs.writeFileSync(targetPath, fileContent, "utf8");

console.log(JSON.stringify({
  rawRecords: rawRecords.length,
  normalizedProperties: michiganInvestmentProperties.length,
  targetPath,
}, null, 2));
