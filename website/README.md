# Website

This site is built with [Docusaurus](https://docusaurus.io/).

## Installation

```bash
npm install
```

## Local Development

```bash
npm start
```

This starts a local development server and opens the site in your browser. Most edits hot-reload automatically.

## Build

```bash
npm run build
```

The build command emits static assets into the `build` directory, which can be deployed to any static host.

## Spice Search Configuration

The global search bar now calls the Spice Search HTTP API via the `/spice-search` edge function (`website/functions/spice-search.js`). The function proxies every POST request to `https://data.spiceai.io/v1/search` with the managed API key, so the browser never exposes credentials directly. Set the server-side `SPICEAI_API_KEY` environment variable to the desired key (it is read automatically by the function at runtime).

Override search behavior at runtime with the following environment variables before running `npm start` or `npm run build`:

```bash
SPICE_SEARCH_API_ENDPOINT=/spice-search
SPICE_SEARCH_PRECONNECT=https://data.spiceai.io
SPICE_SEARCH_TITLE_FIELD=title
SPICE_SEARCH_URL_FIELD=url
SPICE_SEARCH_DESCRIPTION_FIELD=summary
```

- `SPICEAI_API_KEY` is required on the deployment environment hosting `/spice-search`; the server injects it automatically and the browser never needs direct access.
- `SPICE_SEARCH_API_ENDPOINT` defaults to `/spice-search`. Point it at another endpoint if you host your own proxy.
- `SPICE_SEARCH_PRECONNECT` controls the origin inserted as a `<link rel="preconnect">` hint (defaults to `https://data.spiceai.io`).
- Title/URL/description field overrides are optional and scoped to how the UI displays matches.

If no endpoint is configured the search button disappears, which is useful for preview deployments where search is disabled.
