#!/bin/bash
# Simple favicon generator using existing logo
if command -v convert &> /dev/null; then
    echo "Converting existing logo to ICO..."
    convert public/api/user/logo.png -resize 16x16 public/favicon-16.png
    convert public/api/user/logo.png -resize 32x32 public/favicon-32.png
    convert public/favicon-16.png public/favicon-32.png public/favicon.ico
    echo "Favicon created successfully from existing logo!"
    # Clean up temp files
    rm -f public/favicon-16.png public/favicon-32.png
else
    echo "ImageMagick not found. Using existing favicon..."
    if [ -f "public/api/user/favicon.ico" ]; then
        cp public/api/user/favicon.ico public/favicon.ico
        echo "Copied existing favicon.ico to public directory!"
    else
        echo "No existing favicon found. Please install ImageMagick to generate one."
    fi
fi
