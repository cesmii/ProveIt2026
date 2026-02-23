#!/bin/bash
# ProveIT Asset Cleanup Script
# Finds and optionally deletes unreferenced assets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ProveIT Asset Cleanup Script       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Files to search for references (exclude sw.js since it's auto-generated)
SEARCH_FILES=$(find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.md" \) ! -name "sw.js" ! -path "./Back*")
# Also search presentation.js and slide-config.js specifically
SEARCH_FILES="$SEARCH_FILES ./js/presentation.js ./js/slide-config.js ./js/preloader.js"

# Track unused assets
declare -a UNUSED_ASSETS=()
TOTAL_ASSETS=0
TOTAL_SIZE=0

echo -e "${YELLOW}Scanning assets for references...${NC}"
echo ""

# Function to check if a file is referenced
is_referenced() {
    local filename="$1"
    local basename=$(basename "$filename")

    # Search for the filename in all relevant files
    # Check both the full path and just the filename
    if grep -q "$basename" $SEARCH_FILES 2>/dev/null; then
        return 0  # Found - is referenced
    else
        return 1  # Not found - unused
    fi
}

# Scan all assets
while IFS= read -r -d '' asset; do
    TOTAL_ASSETS=$((TOTAL_ASSETS + 1))

    # Get just the filename
    filename=$(basename "$asset")

    # Skip hidden files
    if [[ "$filename" == .* ]]; then
        continue
    fi

    # Check if referenced
    if ! is_referenced "$asset"; then
        # Get file size
        size=$(stat -f%z "$asset" 2>/dev/null || stat -c%s "$asset" 2>/dev/null || echo "0")
        size_kb=$((size / 1024))
        TOTAL_SIZE=$((TOTAL_SIZE + size))

        # Get relative path
        rel_path="${asset#$SCRIPT_DIR/}"

        UNUSED_ASSETS+=("$rel_path|$size_kb")
    fi
done < <(find "$SCRIPT_DIR/assets" -type f -print0)

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}              SCAN RESULTS              ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "Total assets scanned: ${GREEN}${TOTAL_ASSETS}${NC}"
echo -e "Unused assets found:  ${YELLOW}${#UNUSED_ASSETS[@]}${NC}"

if [ ${#UNUSED_ASSETS[@]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}All assets are in use! Nothing to clean up.${NC}"
    exit 0
fi

# Calculate total size
TOTAL_SIZE_MB=$(echo "scale=2; $TOTAL_SIZE / 1048576" | bc)
echo -e "Space to recover:     ${YELLOW}${TOTAL_SIZE_MB} MB${NC}"
echo ""

echo -e "${YELLOW}Unused assets:${NC}"
echo ""

# Sort by size (largest first) and display
for item in "${UNUSED_ASSETS[@]}"; do
    path="${item%%|*}"
    size="${item##*|}"
    printf "  ${RED}%-60s${NC} %6s KB\n" "$path" "$size"
done

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Ask for confirmation
if [ "$1" == "--delete" ]; then
    echo -e "${RED}Deleting unused assets...${NC}"
    echo ""

    for item in "${UNUSED_ASSETS[@]}"; do
        path="${item%%|*}"
        rm -f "$SCRIPT_DIR/$path"
        echo -e "  ${RED}Deleted:${NC} $path"
    done

    echo ""
    echo -e "${GREEN}Cleanup complete! Deleted ${#UNUSED_ASSETS[@]} files.${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Run ${BLUE}./build.sh${NC} to update service worker"
    echo -e "  2. Test the presentation locally"
    echo -e "  3. Commit and deploy"
else
    echo -e "${YELLOW}To delete these files, run:${NC}"
    echo ""
    echo -e "  ${BLUE}./cleanup-assets.sh --delete${NC}"
    echo ""
    echo -e "${YELLOW}Or delete specific files manually.${NC}"
fi
