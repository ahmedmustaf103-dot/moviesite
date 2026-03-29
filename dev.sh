#!/usr/bin/env bash
# Run dev server even if your shell doesn't load nvm yet
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi
cd "$(dirname "$0")" || exit 1
exec npm run dev
