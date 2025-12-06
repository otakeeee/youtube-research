#!/bin/bash
# Auto-format hook for Claude Code
# Runs ESLint and Prettier before commits

set -e

echo "🎨 Running auto-format..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found. Skipping format."
  exit 0
fi

# Run Prettier if available
if command -v npx &> /dev/null; then
  echo "  ✓ Running Prettier..."
  npx prettier --write "src/**/*.{ts,js,json}" 2>/dev/null || true
fi

# Run ESLint if available
if [ -f "package.json" ] && grep -q "eslint" package.json; then
  echo "  ✓ Running ESLint..."
  npx eslint --fix "src/**/*.ts" 2>/dev/null || true
fi

echo "✨ Auto-format complete!"
