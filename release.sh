#!/bin/bash

# Define the output filename
OUTPUT_FILE="TabSpotlight.zip"

# Clean up previous build
if [ -f "$OUTPUT_FILE" ]; then
    echo "Removing existing $OUTPUT_FILE..."
    rm "$OUTPUT_FILE"
fi

echo "Creating new release package: $OUTPUT_FILE"

# Zip the extension files, excluding version control and DS_Store
zip -r "$OUTPUT_FILE" . \
    -x "*.git*" \
    -x "*.DS_Store" \
    -x "release.sh" \
    -x "README.md" \
    -x "**/.DS_Store"

echo "Done! Package created: $OUTPUT_FILE"
ls -lh "$OUTPUT_FILE"
