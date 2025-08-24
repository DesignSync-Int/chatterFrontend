#!/bin/bash

echo "🧪 Testing Hash Routing on Render Deployment"
echo "=============================================="
echo "Testing hash-based routes..."
echo

BASE_URL="https://chatterfrontend.onrender.com"

# Test regular routes (should work)
routes=(
    "/"
    "/#/"
    "/#/login"
    "/#/signup" 
    "/#/reset-password"
    "/#/reset-password?token=test123"
    "/#/forgot-password"
    "/#/verify-email"
    "/#/home"
)

for route in "${routes[@]}"; do
    echo -n "Testing ${BASE_URL}${route} ... "
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${route}")
    if [ "$status_code" = "200" ]; then
        echo "✅ $status_code"
    else
        echo "❌ $status_code"
    fi
done

echo
echo "🔍 Testing if old direct routes still fail (expected behavior):"
old_routes=(
    "/login"
    "/signup"
    "/reset-password"
)

for route in "${old_routes[@]}"; do
    echo -n "Testing ${BASE_URL}${route} ... "
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${route}")
    if [ "$status_code" = "404" ]; then
        echo "✅ $status_code (expected 404)"
    else
        echo "❌ $status_code (unexpected, should be 404)"
    fi
done

echo
echo "📝 Hash Routing Information:"
echo "- All routes now use # prefix (e.g., /#/reset-password)"
echo "- Direct URLs without # will return 404 (expected)"
echo "- Users should access: ${BASE_URL}/#/reset-password"
echo "- Email links should be updated to use hash routes"
