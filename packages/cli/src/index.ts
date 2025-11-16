#!/usr/bin/env node

import { Command } from "commander"
import { addCommand } from "./commands/add.js"
import { initCommand } from "./commands/init.js"
import { listCommand } from "./commands/list.js"

const program = new Command()

program
  .name("cursorize")
  .description("CLI to add cursor rules to your project")
  .version("1.0.0")

program
  .command("init")
  .description("Initialize cursorize in your project")
  .action(initCommand)

program
  .command("add")
  .description("Add a cursor rule to your project")
  .argument("[rule]", "Rule name or ID")
  .option("-t, --tech-stack <stack>", "Filter by tech stack")
  .option("-f, --file <filename>", "Custom filename")
  .action(addCommand)

program
  .command("list")
  .description("List available cursor rules")
  .option("-t, --tech-stack <stack>", "Filter by tech stack")
  .action(listCommand)

program.parse()

