#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Revert constants.ts back to localhost after publishing
const constantsPath = path.join(__dirname, "../src/utils/constants.ts");
const constantsContent = fs.readFileSync(constantsPath, "utf-8");

const devConstants = constantsContent.replace(
  /process\.env\.CURSORIZE_REGISTRY \|\| "https:\/\/cursorize\.vercel\.app\/api\/registry"/,
  'process.env.CURSORIZE_REGISTRY || "http://localhost:3000/api/registry"'
);

fs.writeFileSync(constantsPath, devConstants, "utf-8");
console.log("✓ Reverted registry URL back to localhost for development");

