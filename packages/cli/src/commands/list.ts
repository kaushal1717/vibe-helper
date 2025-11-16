import chalk from "chalk";
import { listRules } from "../utils/registry.js";
import { getConfig } from "../utils/config.js";

export async function listCommand(options?: any) {
  try {
    const config = getConfig();
    const registryUrl = config.registry || "http://localhost:3000/api/registry";

    console.log(chalk.blue("Fetching rules..."));
    const rules = await listRules(registryUrl, options?.techStack);

    if (rules.length === 0) {
      console.log(chalk.yellow("No rules found"));
      return;
    }

    console.log(chalk.bold("\nAvailable cursor rules:\n"));
    rules.forEach((rule) => {
      console.log(chalk.cyan(`  ${rule.name}`));
      console.log(chalk.gray(`    ${rule.description}`));
      console.log(chalk.gray(`    Tech Stack: ${rule.techStack}`));
      console.log(chalk.gray(`    ID: ${rule.id}`));
      if (rule.tags && rule.tags.length > 0) {
        console.log(chalk.gray(`    Tags: ${rule.tags.join(", ")}`));
      }
      console.log();
    });
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
