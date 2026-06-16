#!/bin/bash
# Register a test user for the 9router dashboard
# Usage: ./scripts/register-test-user.sh [username] [password] [email]

BASE_URL="${NEXT_PUBLIC_API_BASE:-http://127.0.0.1:3001}"
USERNAME="${1:-testuser}"
PASSWORD="${2:-Test@123456}"
EMAIL="${3:-test@example.com}"

echo "Registering user: $USERNAME at $BASE_URL"
echo ""

RESULT=$(curl -s -X POST "$BASE_URL/account/register" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)" 2>/dev/null; then
  echo "✅ User registered successfully!"
  echo ""
  echo "  Username: $USERNAME"
  echo "  Password: $PASSWORD"
  echo "  Email:    $EMAIL"
  echo ""
  echo "Login at: $BASE_URL/login"
  echo "Dashboard: $BASE_URL/dashboard"
else
  echo "❌ Registration failed:"
  echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
fi
