#!/bin/bash
# Log all Claude Code commands
# Logs are saved to .ai/logs/

set -e

LOG_DIR=".ai/logs"
LOG_FILE="$LOG_DIR/claude-commands-$(date +%Y-%m-%d).log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log the command with timestamp
echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
