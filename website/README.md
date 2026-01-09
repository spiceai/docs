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

The documentation supports multiple versions to maintain docs for different major releases. Versioned docs are generated at build time from git refs (branches, tags, or commit SHAs) to avoid maintaining duplicate content in the repository.

### How it works

1. **Current docs** (`docs/`) — The working documentation, served as the "Legacy" version in production
2. **Versioned docs** — Generated at build time by extracting docs from git refs

The version generation script ([scripts/generate-versions.sh](scripts/generate-versions.sh)) uses `git archive` to extract docs from each configured git ref without checking out the full repository.

### Creating a new version for a major release

When releasing a new major version (e.g., v1.12), follow these steps:

1. **Create a release branch** for the new version (if not already created):

   ```bash
   git checkout -b release/1.12
   git push origin release/1.12
   ```

2. **Update the version configuration** in [scripts/generate-versions.sh](scripts/generate-versions.sh):

   ```bash
   declare -a VERSIONS=(
     "1.12.x:release/1.12"    # New version (first = latest/default)
     "1.11.x:release/1.11"    # Previous version
   )
   ```

   The `VERSIONS` array format is `"label:git_ref"` where:
   - `label` — The version label shown in the dropdown (e.g., `1.12.x`)
   - `git_ref` — A release branch in the format `release/<major>.<minor>`

3. **Test the build locally**:

   ```bash
   npm run build
   npm run serve
   ```

4. **Commit and push** the updated script.

### Version URL structure

- `/docs/v1.12` — Latest version (default)
- `/docs/v1.11` — Previous version
- `/docs/legacy` — Pre-versioning docs from the `docs/` folder

### Updating existing version docs

To update docs for a released version, push changes directly to the corresponding release branch:

```bash
git checkout release/1.12
# Make changes
git commit -m "Update docs for v1.12.x"
git push origin release/1.12
```

The next build will pick up the updated docs from the release branch.
