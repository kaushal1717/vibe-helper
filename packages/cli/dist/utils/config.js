import fs from "fs-extra";
import * as path from "path";
const CONFIG_FILE = ".cursorrules.json";
export function getConfig() {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    if (fs.existsSync(configPath)) {
        return fs.readJsonSync(configPath);
    }
    return {
        registry: process.env.CURSORIZE_REGISTRY || "http://localhost:3000/api/registry",
    };
}
export function initConfig(registryUrl) {
    const config = {
        registry: registryUrl ||
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
