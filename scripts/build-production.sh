#!/bin/bash

echo "🚀 Starting production build..."

# Set production environment
export NODE_ENV=production

# Function to install native binaries with fallback
install_native_binaries() {
    echo "📦 Installing native binaries for Linux deployment..."
    
    # Install Rollup binaries
    echo "🔄 Installing Rollup native binaries..."
    if npm install --no-save @rollup/rollup-linux-x64-gnu; then
        echo "✅ Successfully installed rollup-linux-x64-gnu"
    else
        echo "⚠️  Failed to install rollup-linux-x64-gnu, trying ARM64..."
        if npm install --no-save @rollup/rollup-linux-arm64-gnu; then
            echo "✅ Successfully installed rollup-linux-arm64-gnu"
        else
            echo "⚠️  Failed to install Rollup ARM64 binary, continuing..."
        fi
    fi
    
    # Install esbuild binaries
    echo "🔄 Installing esbuild native binaries..."
    if npm install --no-save @esbuild/linux-x64; then
        echo "✅ Successfully installed @esbuild/linux-x64"
    else
        echo "⚠️  Failed to install @esbuild/linux-x64, trying ARM64..."
        if npm install --no-save @esbuild/linux-arm64; then
            echo "✅ Successfully installed @esbuild/linux-arm64"
        else
            echo "⚠️  Failed to install esbuild ARM64 binary, continuing..."
        fi
    fi
}

# Function to run Vite build
run_vite_build() {
    echo "🏗️  Running Vite build..."
    if npx vite build; then
        echo "✅ Vite build successful"
    else
        echo "❌ Vite build failed"
        exit 1
    fi
}

# Function to copy redirects file
copy_redirects() {
    echo "📁 Copying redirects file..."
    if [ -f "public/_redirects" ]; then
        cp public/_redirects dist/_redirects
        echo "✅ Redirects file copied"
    else
        echo "⚠️  No _redirects file found, creating default..."
        mkdir -p dist
        echo "/*    /index.html   200" > dist/_redirects
    fi
}

# Main build process
main() {
    # Install native binaries (Rollup and esbuild)
    install_native_binaries
    
    # Run Vite build (which includes TypeScript checking)
    run_vite_build
    
    # Copy redirects
    copy_redirects
    
    echo "🎉 Production build completed successfully!"
    echo "📊 Build output:"
    ls -la dist/
    
    if [ -f "dist/_redirects" ]; then
        echo "📋 Redirects content:"
        cat dist/_redirects
    fi
}

# Run main function
main
