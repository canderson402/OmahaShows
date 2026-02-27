#!/bin/bash
# Image optimization script using ImageMagick
# Converts PNGs to WebP and optimizes JPGs

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Image Optimization ==="
echo ""

# Optimize bg.jpg
BG_PATH="$WEB_DIR/src/assets/bg.jpg"
if [ -f "$BG_PATH" ]; then
    ORIGINAL_SIZE=$(stat -f%z "$BG_PATH" 2>/dev/null || stat -c%s "$BG_PATH")
    echo "Optimizing bg.jpg ($(($ORIGINAL_SIZE / 1024))KB)..."

    # Create optimized version (quality 80, strip metadata)
    magick "$BG_PATH" -strip -quality 80 -resize "1920x1920>" "$BG_PATH.optimized.jpg"

    NEW_SIZE=$(stat -f%z "$BG_PATH.optimized.jpg" 2>/dev/null || stat -c%s "$BG_PATH.optimized.jpg")
    echo "  -> Optimized: $(($NEW_SIZE / 1024))KB (saved $(( ($ORIGINAL_SIZE - $NEW_SIZE) / 1024 ))KB)"

    mv "$BG_PATH.optimized.jpg" "$BG_PATH"
fi

# Convert Astro PNGs to WebP
ASTRO_DIR="$WEB_DIR/public/images/astro"
if [ -d "$ASTRO_DIR" ]; then
    echo ""
    echo "Converting Astro images to WebP..."

    TOTAL_SAVED=0
    COUNT=0

    for PNG in "$ASTRO_DIR"/*.png; do
        if [ -f "$PNG" ]; then
            FILENAME=$(basename "$PNG" .png)
            WEBP_PATH="$ASTRO_DIR/$FILENAME.webp"

            ORIGINAL_SIZE=$(stat -f%z "$PNG" 2>/dev/null || stat -c%s "$PNG")

            # Convert to WebP with quality 85, resize to max 800px
            magick "$PNG" -strip -quality 85 -resize "800x800>" "$WEBP_PATH"

            NEW_SIZE=$(stat -f%z "$WEBP_PATH" 2>/dev/null || stat -c%s "$WEBP_PATH")
            SAVED=$(( ($ORIGINAL_SIZE - $NEW_SIZE) / 1024 ))
            TOTAL_SAVED=$(( $TOTAL_SAVED + $SAVED ))
            COUNT=$(( $COUNT + 1 ))

            echo "  $FILENAME: $(($ORIGINAL_SIZE / 1024))KB -> $(($NEW_SIZE / 1024))KB (saved ${SAVED}KB)"

            # Remove original PNG
            rm "$PNG"
        fi
    done

    echo ""
    echo "Converted $COUNT images, total saved: ${TOTAL_SAVED}KB ($(($TOTAL_SAVED / 1024))MB)"
fi

echo ""
echo "=== Done ==="
