#!/bin/bash
# Validate TypeScript compilation
# Checks for TypeScript errors before commits

set -e

echo "🔍 Validating TypeScript..."

# Check if tsconfig.json exists
if [ ! -f "tsconfig.json" ]; then
  echo "⚠️  tsconfig.json not found. Skipping validation."
  exit 0
fi

# Check if TypeScript is installed
if ! command -v npx &> /dev/null; then
  echo "⚠️  npx not found. Skipping validation."
  exit 0
fi

# Run TypeScript compiler check
if npx tsc --noEmit 2>&1; then
  echo "✅ TypeScript validation passed!"
  exit 0
else
  echo "❌ TypeScript validation failed!"
  echo "Fix the errors above before committing."
  exit 1
fi
