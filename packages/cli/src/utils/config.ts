import fs from "fs-extra";
import * as path from "path";

export interface CursorRulesConfig {
  registry?: string;
  style?: string;
}

const CONFIG_FILE = ".cursorrules.json";

export function getConfig(): CursorRulesConfig {
  const configPath = path.join(process.cwd(), CONFIG_FILE);

  if (fs.existsSync(configPath)) {
    return fs.readJsonSync(configPath);
  }

  return {
    registry:
      process.env.CURSORIZE_REGISTRY || "http://localhost:3000/api/registry",
  };
}

export function initConfig(registryUrl?: string) {
  const config: CursorRulesConfig = {
    registry:
      registryUrl ||
      process.env.CURSORIZE_REGISTRY ||
      "http://localhost:3000/api/registry",
  };

  fs.writeJsonSync(path.join(process.cwd(), CONFIG_FILE), config, {
    spaces: 2,
  });

  console.log(`✓ Created ${CONFIG_FILE}`);
}

export function ensureCursorDir() {
  const cursorDir = path.join(process.cwd(), ".cursor", "rules");
  fs.ensureDirSync(cursorDir);
}
