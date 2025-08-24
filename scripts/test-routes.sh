#!/bin/bash

echo "🧪 Testing SPA Routes on Render Deployment"
echo "============================================="

BASE_URL="https://chatterfrontend.onrender.com"

# Array of routes to test
routes=(
  "/"
  "/login"
  "/signup"
  "/reset-password"
  "/reset-password?token=test123"
  "/forgot-password"
  "/verify-email"
  "/home"
)

echo "Testing routes..."
echo ""

for route in "${routes[@]}"; do
  echo -n "Testing $BASE_URL$route ... "
  
  # Get HTTP status code
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
  
  if [ "$status_code" = "200" ]; then
    echo "✅ $status_code"
  else
    echo "❌ $status_code"
  fi
done

echo ""
echo "🔍 Checking specific headers for /reset-password:"
curl -I "$BASE_URL/reset-password" 2>/dev/null | head -5

echo ""
echo "📝 If routes are still failing:"
echo "1. Wait 2-3 minutes for deployment to complete"
echo "2. Clear browser cache completely"
echo "3. Try accessing routes in incognito/private mode"
echo "4. Check Render deployment logs"
