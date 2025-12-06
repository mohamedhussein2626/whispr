#!/bin/bash

echo "🧪 Testing Admin API Endpoints..."
echo "=================================="

BASE_URL="http://localhost:3000"

echo ""
echo "1. Testing Users API..."
echo "GET $BASE_URL/api/admin/users"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/api/admin/users" | head -20

echo ""
echo "2. Testing Plans API..."
echo "GET $BASE_URL/api/admin/plans"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/api/admin/plans" | head -20

echo ""
echo "3. Testing Subscriptions API..."
echo "GET $BASE_URL/api/admin/subscriptions"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/api/admin/subscriptions" | head -20

echo ""
echo "✅ API endpoint tests completed!"
echo "Note: Make sure the development server is running (npm run dev)"
