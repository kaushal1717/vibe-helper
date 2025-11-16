import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import * as path from "path";
import { fetchRule, listRules } from "../utils/registry.js";
import { getConfig, ensureCursorDir } from "../utils/config.js";
export async function addCommand(ruleName, options) {
    try {
        const config = getConfig();
        const registryUrl = config.registry || "http://localhost:3000/api/registry";
        let ruleId = ruleName;
        // If no rule specified, show interactive list
        if (!ruleId) {
            console.log(chalk.blue("Fetching available rules..."));
            const rules = await listRules(registryUrl, options?.techStack);
            if (rules.length === 0) {
                console.log(chalk.yellow("No rules found"));
                return;
            }
            const { selectedRule } = await inquirer.prompt([
                {
                    type: "list",
                    name: "selectedRule",
                    message: "Select a cursor rule to add:",
                    choices: rules.map((r) => ({
                        name: `${r.name} (${r.techStack})`,
                        value: r.id,
                    })),
                },
            ]);
            ruleId = selectedRule;
        }
        if (!ruleId) {
            console.error(chalk.red("No rule selected"));
            process.exit(1);
        }
        // Fetch rule details
        console.log(chalk.blue("Fetching rule details..."));
        const rule = await fetchRule(registryUrl, ruleId);
        if (!rule) {
            console.error(chalk.red("Rule not found"));
            process.exit(1);
        }
        // Determine filename
        const fileName = options?.file || rule.files[0].path.split("/").pop() || "rules.mdc";
        const filePath = path.join(process.cwd(), ".cursor", "rules", fileName);
        // Ensure .cursor/rules directory exists
        ensureCursorDir();
        // Check if file exists
        if (fs.existsSync(filePath)) {
            const { overwrite } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "overwrite",
                    message: `File ${filePath} already exists. Overwrite?`,
                    default: false,
                },
            ]);
            if (!overwrite) {
                console.log(chalk.yellow("Cancelled"));
                return;
            }
        }
        // Write file
        fs.writeFileSync(filePath, rule.files[0].content, "utf-8");
        console.log(chalk.green(`✓ Added cursor rule: ${rule.name}`));
        console.log(chalk.gray(`  Location: ${filePath}`));
    }
    catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
    }
}
