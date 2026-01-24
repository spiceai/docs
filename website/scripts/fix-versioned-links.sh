#!/bin/bash
# Fixes broken links in versioned docs after generation
# This script is called by generate-versions.sh after extracting docs from git branches
#
# These fixes are needed because older release branches may have:
# - Absolute links that don't work across versions
# - Links to renamed/moved pages
# - Case sensitivity issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="$(dirname "$SCRIPT_DIR")"
VERSIONED_DOCS="$WEBSITE_DIR/versioned_docs"

if [ ! -d "$VERSIONED_DOCS" ]; then
  echo "No versioned_docs directory found, skipping link fixes"
  exit 0
fi

echo "Fixing broken links in versioned docs..."

# Create a helper function for sed that handles OS differences
run_sed() {
  local pattern="$1"
  local file="$2"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$pattern" "$file"
  else
    sed -i "$pattern" "$file"
  fi
}
export -f run_sed

# Fix file-formats links to use relative paths (for files in data-connectors folder)
find "$VERSIONED_DOCS" -name "*.md" -path "*/data-connectors/*" -exec bash -c 'run_sed "s|\[File Formats\](/docs/components/data-connectors#file-formats)|[File Formats](./#file-formats)|g" "$0"' {} \;
find "$VERSIONED_DOCS" -name "*.md" -path "*/data-connectors/*" -exec bash -c 'run_sed "s|\[supported file formats\](/docs/components/data-connectors#file-formats)|[supported file formats](./#file-formats)|g" "$0"' {} \;
find "$VERSIONED_DOCS" -name "*.md" -path "*/data-connectors/*" -exec bash -c 'run_sed "s|\[supported file\](/docs/components/data-connectors#file-formats)|[supported file](./#file-formats)|g" "$0"' {} \;

# Fix document-formats/document-support links
# v1.5-v1.10 have #document-support section, v1.11+ has #document-formats  

# For older versions, keep document-support (it exists in their index.md)
find "$VERSIONED_DOCS" -name "sharepoint.md" -exec bash -c 'run_sed "s|\[Document Formats\](/docs/components/data-connectors#document-formats)|[Document Formats](./#document-support)|g" "$0"' {} \;
find "$VERSIONED_DOCS" -name "sharepoint.md" -exec bash -c 'run_sed "s|\[Document Support\](/docs/components/data-connectors/index.md#document-support)|[Document Support](./#document-support)|g" "$0"' {} \;
find "$VERSIONED_DOCS" -path "*/embeddings/index.md" -exec bash -c 'run_sed "s|\[Document Tables\](/docs/components/data-connectors#document-formats)|[Document Tables](../data-connectors#document-support)|g" "$0"' {} \;
find "$VERSIONED_DOCS" -path "*/embeddings/index.md" -exec bash -c 'run_sed "s|\[Document Tables\](/docs/components/data-connectors/index.md#document-support)|[Document Tables](../data-connectors#document-support)|g" "$0"' {} \;

# For v1.11.x (next), fix to use document-formats (run AFTER the general fixes above)
find "$VERSIONED_DOCS/version-1.11.x" -name "sharepoint.md" -exec bash -c 'run_sed "s|#document-support|#document-formats|g" "$0"' {} \;
find "$VERSIONED_DOCS/version-1.11.x" -path "*/embeddings/index.md" -exec bash -c 'run_sed "s|#document-support|#document-formats|g" "$0"' {} \;

# Fix type-casting-operators links (in reference/datatypes/index.md)
find "$VERSIONED_DOCS" -path "*/reference/datatypes/index.md" -exec bash -c 'run_sed "s|\[Type Casting Operators\](/docs/reference/sql/operators#type-casting-operators)|[Type Casting Operators](../sql/operators#type-casting-operators)|g" "$0"' {} \;

# Fix parameterized-queries links in SDKs
find "$VERSIONED_DOCS" -path "*/sdks/*/index.md" -exec bash -c 'run_sed "s|/docs/features/query-federation/parameterized-queries|../../features/query-federation/parameterized-queries|g" "$0"' {} \;

# Fix runtimetemp_directory links in duckdb.md
# The anchor #runtimequerytemp_directory doesn't exist in v1.5-v1.8, remove the anchor for those versions
for version in "1.5.x" "1.6.x" "1.7.x" "1.8.x"; do
  find "$VERSIONED_DOCS/version-$version" -name "duckdb.md" -path "*/data-accelerators/*" -exec bash -c 'run_sed "s|/docs/reference/spicepod/runtime.md#runtimetemp_directory|../../reference/spicepod/runtime|g" "$0"' {} \;
  find "$VERSIONED_DOCS/version-$version" -name "duckdb.md" -path "*/data-accelerators/*" -exec bash -c 'run_sed "s|/docs/trunk/reference/spicepod/runtime#runtimetemp_directory|../../reference/spicepod/runtime|g" "$0"' {} \;
done

# Fix full-text#sql-udtf link - in v1.5 the section doesn't exist, link to the file instead
find "$VERSIONED_DOCS/version-1.5.x" -path "*/features/search/index.md" -exec bash -c 'run_sed "s|/docs/features/search/full-text#sql-udtf|./full-text|g" "$0"' {} \;

# Fix client links - these are in features/observability and api/jdbc directories
# v1.5.x uses DBeaver, Datadog (capital case folders) - note trailing slashes in links
find "$VERSIONED_DOCS/version-1.5.x" -path "*/api/jdbc/index.md" -exec bash -c 'run_sed "s|\[Full instruction\](/docs/clients/DBeaver)|[Full instruction](../../clients/DBeaver)|g" "$0"' {} \;
find "$VERSIONED_DOCS/version-1.5.x" -path "*/features/observability/index.md" -exec bash -c 'run_sed "s|\[Grafana\](/docs/clients/grafana/)|[Grafana](../../clients/grafana)|g" "$0"' {} \;
find "$VERSIONED_DOCS/version-1.5.x" -path "*/features/observability/index.md" -exec bash -c 'run_sed "s|\[Datadog\](/docs/clients/Datadog/)|[Datadog](../../clients/Datadog)|g" "$0"' {} \;
find "$VERSIONED_DOCS/version-1.5.x" -path "*/deployment/kubernetes/index.md" -exec bash -c 'run_sed "s|/docs/clients/grafana|../../clients/grafana|g" "$0"' {} \;

# v1.6.x uses lowercase folder names
find "$VERSIONED_DOCS/version-1.6.x" -path "*/features/observability/index.md" -exec bash -c 'run_sed "s|\[Grafana\](/docs/clients/grafana)|[Grafana](../../clients/grafana)|g" "$0"' {} \;
find "$VERSIONED_DOCS/version-1.6.x" -path "*/features/observability/index.md" -exec bash -c 'run_sed "s|\[Datadog\](/docs/clients/datadog)|[Datadog](../../clients/datadog)|g" "$0"' {} \;

# Fix MDX syntax issues in versioned docs
# The {#anchor} syntax in headings causes MDX compilation errors
# Remove custom anchor syntax from headings - Docusaurus generates anchors automatically
echo "Fixing MDX syntax issues in versioned docs..."
find "$VERSIONED_DOCS" -name "*.md" -exec bash -c 'run_sed "s/ {#[^}]*}//g" "$0"' {} \;

# Remove .md extensions from all links in versioned docs
# Docusaurus with versioning doesn't handle .md extensions in links
echo "Removing .md extensions from versioned docs links..."
"$SCRIPT_DIR/fix-md-links.sh" "$VERSIONED_DOCS"

echo "Done fixing versioned docs links"
