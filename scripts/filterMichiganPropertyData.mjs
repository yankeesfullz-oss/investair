import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  coerceMichiganProperties,
  validateNormalizedMichiganProperties,
} from "./lib/michiganPropertyDataTools.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "src", "lib", "data");
const rawBackupPath = path.join(projectRoot, "src", "lib", "data.raw.json");
const filteredPath = path.join(projectRoot, "src", "lib", "data.filtered.json");
const validationPath = path.join(projectRoot, "src", "lib", "data.validation.json");

const rawRecords = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const filteredProperties = coerceMichiganProperties(rawRecords);
const issues = validateNormalizedMichiganProperties(filteredProperties);

if (!fs.existsSync(rawBackupPath)) {
  fs.writeFileSync(rawBackupPath, `${JSON.stringify(rawRecords, null, 2)}\n`, "utf8");
}

const summary = {
  sourcePath,
  rawBackupPath,
  filteredPath,
  validationPath,
  rawRecordCount: rawRecords.length,
  filteredPropertyCount: filteredProperties.length,
  issueCount: issues.length,
  errorCount: issues.filter((issue) => issue.severity === "error").length,
  warningCount: issues.filter((issue) => issue.severity === "warning").length,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(sourcePath, `${JSON.stringify(filteredProperties, null, 2)}\n`, "utf8");
fs.writeFileSync(filteredPath, `${JSON.stringify(filteredProperties, null, 2)}\n`, "utf8");
fs.writeFileSync(
  validationPath,
  `${JSON.stringify({ summary, issues }, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify(summary, null, 2));
