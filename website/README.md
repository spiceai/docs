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

This command builds static content into the `build` directory.

## Versioned Documentation

The documentation supports multiple versions to maintain docs for different releases. Versioned docs are checked into the repository under `versioned_docs/` and `versioned_sidebars/`.

### How it works

1. **Current docs** (`docs/`) — Working documentation from trunk, served at `/docs/trunk`
2. **Versioned docs** (`versioned_docs/`) — Checked-in snapshots from release branches
   - Listed in `versions.json` in order from newest to oldest
   - Latest version serves at `/docs`
   - Previous versions serve at `/docs/v1.10`, etc.

### Creating a new version for a release

When releasing a new version (e.g., v2.1):

1. Copy the current `docs/` directory to `versioned_docs/version-2.1.x/`
2. Add `"2.1.x"` to the beginning of `versions.json`
3. Create a matching sidebar file at `versioned_sidebars/version-2.1.x-sidebars.json`
4. Commit and push the changes

### Version URL structure

- `/docs` — Latest stable release (default)
- `/docs/trunk` — Working docs from trunk
- `/docs/v1.10` — Previous release versions

### Updating existing version docs

To update docs for a released version, edit the files directly in the corresponding `versioned_docs/version-<version>/` directory and commit the changes.
