#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update constants.ts with production URL before publishing
const constantsPath = path.join(__dirname, "../src/utils/constants.ts");
const constantsContent = fs.readFileSync(constantsPath, "utf-8");

const productionConstants = constantsContent.replace(
  /process\.env\.CURSORIZE_REGISTRY \|\| "http:\/\/localhost:3000\/api\/registry"/,
  'process.env.CURSORIZE_REGISTRY || "https://cursorize.vercel.app/api/registry"'
);

fs.writeFileSync(constantsPath, productionConstants, "utf-8");
console.log("✓ Updated registry URL to production for publishing");

