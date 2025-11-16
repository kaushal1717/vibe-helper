import chalk from "chalk"
import { initConfig, ensureCursorDir } from "../utils/config.js"

export async function initCommand() {
  try {
    // Use default registry URL without prompting
    const registryUrl = process.env.CURSORIZE_REGISTRY || "http://localhost:3000/api/registry"

    initConfig(registryUrl)
    ensureCursorDir()

    console.log(chalk.green("✓ Initialized cursorize"))
    console.log(chalk.gray(`  Registry: ${registryUrl}`))
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`))
    process.exit(1)
  }
}

