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
  "registry": "https://cursorize.vercel.app/api/registry"
}
```

By default, the CLI uses `https://cursorize.vercel.app/api/registry` as the registry URL. You can override this by:
- Setting the `CURSORIZE_REGISTRY` environment variable
- Configuring it in `.cursorrules.json` after running `cursorize init`

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the package
npm run build
```

## Publishing

The package is configured to automatically use the production registry URL (`https://cursorize.vercel.app/api/registry`) when published to npm. The publish process:

1. Automatically updates the registry URL to production
2. Builds the package
3. Publishes to npm
4. Reverts the registry URL back to localhost for local development

To publish:

```bash
npm publish
```

Make sure you're logged in to npm and have the correct permissions for the `cursorize` package.

