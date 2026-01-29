#!/bin/bash

echo "=== EC2 to Cloudflare Connection Test ==="

# Test endpoints
CLOUDFLARE_URL="https://api-staging.zyncjobs.com"
EC2_URL="http://3.110.178.223:5000"

echo ""
echo "🌐 Testing DNS Resolution..."
nslookup api-staging.zyncjobs.com

echo ""
echo "🔍 Testing Cloudflare Domain: $CLOUDFLARE_URL"
curl -s -w "Status: %{http_code} | Time: %{time_total}s\n" "$CLOUDFLARE_URL/api/test" || echo "❌ Cloudflare test failed"

echo ""
echo "🔍 Testing Direct EC2: $EC2_URL"
curl -s -w "Status: %{http_code} | Time: %{time_total}s\n" "$EC2_URL/api/test" || echo "❌ EC2 test failed"

echo ""
echo "🔍 Testing with verbose output..."
echo "Cloudflare (verbose):"
curl -v "$CLOUDFLARE_URL/api/test" 2>&1 | head -20

echo ""
echo "=== Test Complete ==="