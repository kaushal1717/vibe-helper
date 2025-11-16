// Default registry URL
// For local development: keep as http://localhost:3000/api/registry
// For published package: change to https://cursorize.vercel.app/api/registry before publishing
export const DEFAULT_REGISTRY_URL =
  process.env.CURSORIZE_REGISTRY || "http://localhost:3000/api/registry";

