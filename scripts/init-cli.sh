#!/usr/bin/env bash
set -e
dir="${1:-merchantbridge-cli}"
git init "$dir"
cd "$dir"
git remote add origin https://github.com/hellomerchantbridge/merchantbridge.git
git sparse-checkout init --cone
git sparse-checkout set scripts docs merchantbridge.cmd
git pull origin main
cat > quickstart.sh <<'EOS'
export MERCHANTBRIDGE_API_URL="https://community.demerchantbridge.com/api"
export MERCHANTBRIDGE_API_KEY="paste-your-key-here"
node scripts/merchantbridge-cli.mjs --help
EOS
chmod +x quickstart.sh
echo "Done. Edit quickstart.sh with your API key, then run it."
