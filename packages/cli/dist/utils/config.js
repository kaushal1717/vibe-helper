import fs from "fs-extra";
import * as path from "path";
import { DEFAULT_REGISTRY_URL } from "./constants.js";
const CONFIG_FILE = ".cursorrules.json";
export function getConfig() {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    if (fs.existsSync(configPath)) {
        return fs.readJsonSync(configPath);
    }
    return {
        registry: DEFAULT_REGISTRY_URL,
    };
}
export function initConfig(registryUrl) {
    const config = {
        registry: registryUrl || DEFAULT_REGISTRY_URL,
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
