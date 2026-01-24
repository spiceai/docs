#!/bin/bash
# Script to fix markdown file links in Docusaurus docs
# Converts internal .md links to clean URLs (without .md extension)
# This is needed because Docusaurus with versioning doesn't handle .md extensions in links

set -e

DOCS_DIR="${1:-docs}"

if [ ! -d "$DOCS_DIR" ]; then
    echo "Error: Directory '$DOCS_DIR' not found"
    exit 1
fi

echo "Fixing .md links in $DOCS_DIR..."

# Count files before
TOTAL_FILES=$(find "$DOCS_DIR" -name "*.md" -o -name "*.mdx" | wc -l | tr -d ' ')
echo "Found $TOTAL_FILES markdown files to process"

# Fix patterns:
# 1. ](./path/file.md) -> ](./path/file)
# 2. ](./path/file.md#anchor) -> ](./path/file#anchor)
# 3. ](../path/file.md) -> ](../path/file)
# 4. ](../path/file.md#anchor) -> ](../path/file#anchor)
# 5. ](/docs/path/file.md) -> ](/docs/path/file)
# 6. ](/docs/path/file.md#anchor) -> ](/docs/path/file#anchor)
# 7. ](file.md) -> ](file) - bare filename (relative to current dir)
# 8. ](file.md#anchor) -> ](file#anchor)
#
# Exclude external links (https://, http://)

# Use find with -exec to handle files with special characters
# The sed pattern matches internal .md links and removes the .md extension
# It preserves anchors (#section) if present

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS uses BSD sed which requires '' after -i
    find "$DOCS_DIR" \( -name "*.md" -o -name "*.mdx" \) -type f -exec sed -i '' \
        -e 's/\](\([^)]*\)\.md)/](\1)/g' \
        -e 's/\](\([^)]*\)\.md#/](\1#/g' \
        -e 's/\](\([^)]*\)\.mdx)/](\1)/g' \
        -e 's/\](\([^)]*\)\.mdx#/](\1#/g' \
        -e 's/^\(\[.*\]\): \(.*\)\.md$/\1: \2/g' \
        -e 's/^\(\[.*\]\): \(.*\)\.md#/\1: \2#/g' \
        {} \;
else
    # Linux uses GNU sed
    find "$DOCS_DIR" \( -name "*.md" -o -name "*.mdx" \) -type f -exec sed -i \
        -e 's/\](\([^)]*\)\.md)/](\1)/g' \
        -e 's/\](\([^)]*\)\.md#/](\1#/g' \
        -e 's/\](\([^)]*\)\.mdx)/](\1)/g' \
        -e 's/\](\([^)]*\)\.mdx#/](\1#/g' \
        -e 's/^\(\[.*\]\): \(.*\)\.md$/\1: \2/g' \
        -e 's/^\(\[.*\]\): \(.*\)\.md#/\1: \2#/g' \
        {} \;
fi

echo "Done! Fixed .md links in $DOCS_DIR"

# Show remaining .md links (should only be external ones)
REMAINING=$(grep -r '\.md)' "$DOCS_DIR" --include="*.md" --include="*.mdx" 2>/dev/null | grep -v 'https://' | grep -v 'http://' | wc -l | tr -d ' ')
if [ "$REMAINING" -gt 0 ]; then
    echo ""
    echo "Warning: Found $REMAINING remaining internal .md links. Please review:"
    grep -r '\.md)' "$DOCS_DIR" --include="*.md" --include="*.mdx" 2>/dev/null | grep -v 'https://' | grep -v 'http://' | head -20
fi
