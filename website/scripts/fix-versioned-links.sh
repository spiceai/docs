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

# Determine sed in-place flag based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE="sed -i ''"
else
  SED_INPLACE="sed -i"
fi

# Fix file-formats links to use relative paths (for files in data-connectors folder)
find "$VERSIONED_DOCS" -name "*.md" -path "*/data-connectors/*" -exec $SED_INPLACE 's|\[File Formats\](/docs/components/data-connectors#file-formats)|[File Formats](./#file-formats)|g' {} \;
find "$VERSIONED_DOCS" -name "*.md" -path "*/data-connectors/*" -exec $SED_INPLACE 's|\[supported file formats\](/docs/components/data-connectors#file-formats)|[supported file formats](./#file-formats)|g' {} \;
find "$VERSIONED_DOCS" -name "*.md" -path "*/data-connectors/*" -exec $SED_INPLACE 's|\[supported file\](/docs/components/data-connectors#file-formats)|[supported file](./#file-formats)|g' {} \;

# Fix document-formats/document-support links
# v1.5-v1.10 have #document-support section, v1.11+ has #document-formats  

# For older versions, keep document-support (it exists in their index.md)
find "$VERSIONED_DOCS" -name "sharepoint.md" -exec $SED_INPLACE 's|\[Document Formats\](/docs/components/data-connectors#document-formats)|[Document Formats](./#document-support)|g' {} \;
find "$VERSIONED_DOCS" -name "sharepoint.md" -exec $SED_INPLACE 's|\[Document Support\](/docs/components/data-connectors/index.md#document-support)|[Document Support](./#document-support)|g' {} \;
find "$VERSIONED_DOCS" -path "*/embeddings/index.md" -exec $SED_INPLACE 's|\[Document Tables\](/docs/components/data-connectors#document-formats)|[Document Tables](../data-connectors#document-support)|g' {} \;
find "$VERSIONED_DOCS" -path "*/embeddings/index.md" -exec $SED_INPLACE 's|\[Document Tables\](/docs/components/data-connectors/index.md#document-support)|[Document Tables](../data-connectors#document-support)|g' {} \;

# For v1.11.x (next), fix to use document-formats (run AFTER the general fixes above)
find "$VERSIONED_DOCS/version-1.11.x" -name "sharepoint.md" -exec $SED_INPLACE 's|#document-support|#document-formats|g' {} \;
find "$VERSIONED_DOCS/version-1.11.x" -path "*/embeddings/index.md" -exec $SED_INPLACE 's|#document-support|#document-formats|g' {} \;

# Fix type-casting-operators links (in reference/datatypes/index.md)
find "$VERSIONED_DOCS" -path "*/reference/datatypes/index.md" -exec $SED_INPLACE 's|\[Type Casting Operators\](/docs/reference/sql/operators#type-casting-operators)|[Type Casting Operators](../sql/operators#type-casting-operators)|g' {} \;

# Fix parameterized-queries links in SDKs
find "$VERSIONED_DOCS" -path "*/sdks/*/index.md" -exec $SED_INPLACE 's|/docs/features/query-federation/parameterized-queries|../../features/query-federation/parameterized-queries|g' {} \;

# Fix runtimetemp_directory links in duckdb.md
# The anchor #runtimequerytemp_directory doesn't exist in v1.5-v1.8, remove the anchor for those versions
for version in "1.5.x" "1.6.x" "1.7.x" "1.8.x"; do
  find "$VERSIONED_DOCS/version-$version" -name "duckdb.md" -path "*/data-accelerators/*" -exec $SED_INPLACE 's|/docs/reference/spicepod/runtime.md#runtimetemp_directory|../../reference/spicepod/runtime|g' {} \;
  find "$VERSIONED_DOCS/version-$version" -name "duckdb.md" -path "*/data-accelerators/*" -exec $SED_INPLACE 's|/docs/trunk/reference/spicepod/runtime#runtimetemp_directory|../../reference/spicepod/runtime|g' {} \;
done

# Fix full-text#sql-udtf link - in v1.5 the section doesn't exist, link to the file instead
find "$VERSIONED_DOCS/version-1.5.x" -path "*/features/search/index.md" -exec $SED_INPLACE 's|/docs/features/search/full-text#sql-udtf|./full-text|g' {} \;

# Fix client links - these are in features/observability and api/jdbc directories
# v1.5.x uses DBeaver, Datadog (capital case folders) - note trailing slashes in links
find "$VERSIONED_DOCS/version-1.5.x" -path "*/api/jdbc/index.md" -exec $SED_INPLACE 's|\[Full instruction\](/docs/clients/DBeaver)|[Full instruction](../../clients/DBeaver)|g' {} \;
find "$VERSIONED_DOCS/version-1.5.x" -path "*/features/observability/index.md" -exec $SED_INPLACE 's|\[Grafana\](/docs/clients/grafana/)|[Grafana](../../clients/grafana)|g' {} \;
find "$VERSIONED_DOCS/version-1.5.x" -path "*/features/observability/index.md" -exec $SED_INPLACE 's|\[Datadog\](/docs/clients/Datadog/)|[Datadog](../../clients/Datadog)|g' {} \;
find "$VERSIONED_DOCS/version-1.5.x" -path "*/deployment/kubernetes/index.md" -exec $SED_INPLACE 's|/docs/clients/grafana|../../clients/grafana|g' {} \;

# v1.6.x uses lowercase folder names
find "$VERSIONED_DOCS/version-1.6.x" -path "*/features/observability/index.md" -exec $SED_INPLACE 's|\[Grafana\](/docs/clients/grafana)|[Grafana](../../clients/grafana)|g' {} \;
find "$VERSIONED_DOCS/version-1.6.x" -path "*/features/observability/index.md" -exec $SED_INPLACE 's|\[Datadog\](/docs/clients/datadog)|[Datadog](../../clients/datadog)|g' {} \;

# Remove .md extensions from all links in versioned docs
# Docusaurus with versioning doesn't handle .md extensions in links
echo "Removing .md extensions from versioned docs links..."
"$SCRIPT_DIR/fix-md-links.sh" "$VERSIONED_DOCS"

echo "Done fixing versioned docs links"
