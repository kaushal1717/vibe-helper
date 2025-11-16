# Cursorize CLI

CLI tool to add cursor rules to your project from the Vibe Helper registry.

## Installation

```bash
npm install -g cursorize
# or
npx cursorize@latest
```

## Usage

### Initialize

```bash
cursorize init
```

This creates a `.cursorrules.json` config file in your project.

### List available rules

```bash
cursorize list
```

Filter by tech stack:
```bash
cursorize list --tech-stack React
```

### Add a rule

```bash
cursorize add
```

Add a specific rule by ID:
```bash
cursorize add <rule-id>
```

Add with custom filename:
```bash
cursorize add <rule-id> --file my-rules.mdc
```

## Configuration

The CLI reads from `.cursorrules.json`:

```json
{
  "registry": "https://your-app.com/api/registry"
}
```

