#!/bin/bash
# the Item-3 close-out battery — every live probe, read-only, canonical never touched
cd /workspace/arena-engine
mkdir -p scratch/triage/runs-closeout
run() {
  local label="$1"; shift
  local out="scratch/triage/runs-closeout/${label}.log"
  local t0=$(date +%s)
  { echo "=== ${label} :: $* ==="; echo "=== started $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="; "$@" 2>&1; echo "=== exit=$? ==="; echo "=== seconds: $(( $(date +%s) - t0 )) ==="; echo "=== canonical md5 after: $(md5sum previews/spinclash-preview.html | cut -d' ' -f1) / $(wc -l < previews/spinclash-preview.html) lines ==="; } > "${out}" 2>&1
  echo "DONE ${label} exit=$(grep -oP '(?<=^=== exit=)\d+' "${out}" | tail -1)"
}
run inscribe              node .qa/inscribe.mjs
run lengrow-build-proof   node .qa/lengrow-build-proof.mjs
run pair-proof            node .qa/pair-proof.mjs
run flipproof             node .qa/flipproof.mjs
run leadproof             node .qa/leadproof.mjs
run seam-proof            node .qa/seam-proof.mjs
run chromecheck-1         node chromecheck.mjs
run chromecheck-2         node chromecheck.mjs
run lengrow-gate          node .qa/lengrow-gate.mjs
run lengrow-bake-verify   node .qa/lengrow-bake.mjs --verify
