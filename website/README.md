# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

## Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

During local development, only the current docs (in the `docs/` folder) are served without versioning. This provides a faster development experience.

## Build

```bash
npm run build
```

This command generates versioned docs from git refs, then builds static content into the `build` directory.

To build without generating versions (uses only the current `docs/` folder):

```bash
npm run build:local
```

## Versioned Documentation

The documentation supports multiple versions to maintain docs for different releases. Versioned docs are generated at build time from git release branches to avoid maintaining duplicate content in the repository.

### How it works

1. **Current docs** (`docs/`) — The working documentation from trunk, served as "Unreleased" at `/docs/next`
2. **Versioned docs** — Auto-generated at build time from `release/<major>.<minor>` branches

The version generation script ([scripts/generate-versions.sh](scripts/generate-versions.sh)) auto-detects release branches and uses `git archive` to extract docs from each without checking out the full repository.

### Creating a new version for a release

When releasing a new version (e.g., v1.12):

1. **Create a release branch** for the new version:

   ```bash
   git checkout -b release/1.12
   git push origin release/1.12
   ```

2. **That's it!** The build script auto-detects release branches matching the `release/<major>.<minor>` pattern. The next build will automatically include the new version.

3. **Test the build locally**:

   ```bash
   npm run build
   npm run serve
   ```

### Version URL structure

- `/docs` — Latest release version (default)
- `/docs/next` — Unreleased docs from trunk
- `/docs/v1.11` — Previous release versions

### Updating existing version docs

To update docs for a released version, push changes directly to the corresponding release branch:

```bash
git checkout release/1.12
# Make changes
git commit -m "Update docs for v1.12.x"
git push origin release/1.12
```

The next build will pick up the updated docs from the release branch.
