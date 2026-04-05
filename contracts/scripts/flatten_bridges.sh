#!/bin/bash
# Flatten 5 bridge contracts using temp files to avoid pipe/stdin issues
# Run from: /Users/percival.lucena/coti/portal-bridge

set -e

OUT="contracts/flattened"
mkdir -p "$OUT"

CONTRACTS=(
  "PrivacyBridgeWBTC"
  "PrivacyBridgeUSDT"
  "PrivacyBridgeUSDCe"
  "PrivacyBridgeWADA"
  "PrivacyBridgegCoti"
)

for NAME in "${CONTRACTS[@]}"; do
  echo "Flattening $NAME..."
  TMP=$(mktemp /tmp/${NAME}_XXXXXX.sol)

  # Run flatten and capture to temp file
  npx hardhat flatten "contracts/privacyBridge/${NAME}.sol" > "$TMP" 2>/dev/null

  # Deduplicate SPDX: keep only first occurrence, remove rest
  FINAL="${OUT}/${NAME}_flat.sol"
  awk '
    /\/\/ SPDX-License-Identifier:/ {
      if (!seen_spdx) { seen_spdx=1; print; }
      next
    }
    { print }
  ' "$TMP" > "$FINAL"

  rm "$TMP"
  SIZE=$(wc -c < "$FINAL")
  echo "  ✅ ${FINAL} (${SIZE} bytes)"
done

echo ""
echo "✅ All 5 contracts flattened to ${OUT}/"
ls -lh "$OUT"
