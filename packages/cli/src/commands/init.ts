import chalk from "chalk"
import { initConfig, ensureCursorDir } from "../utils/config.js"
import { DEFAULT_REGISTRY_URL } from "../utils/constants.js"

export async function initCommand() {
  try {
    // Use default registry URL without prompting
    const registryUrl = DEFAULT_REGISTRY_URL

    initConfig(registryUrl)
    ensureCursorDir()

    console.log(chalk.green("✓ Initialized cursorize"))
    console.log(chalk.gray(`  Registry: ${registryUrl}`))
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`))
    process.exit(1)
  }
}

