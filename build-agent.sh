#!/bin/bash
# Build a single agent using esbuild
# Usage: ./build-agent.sh vera

AGENT=$1
if [ -z "$AGENT" ]; then
    echo "Usage: ./build-agent.sh <agent-name>"
    exit 1
fi

echo "Building $AGENT agent with esbuild..."

# Install esbuild if not present
if ! command -v esbuild &> /dev/null; then
    npm install -g esbuild
fi

cd lambda/agents/$AGENT

# Bundle with esbuild - this resolves all imports into a single file
esbuild index.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --format=cjs \
    --outfile=dist/index.js \
    --external:@aws-sdk/* \
    --sourcemap

echo "✓ $AGENT built successfully"
