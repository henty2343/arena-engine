#!/bin/bash
cd "$(dirname "$0")/../.." || exit 1   # repo root (2026-11-11: was a hard-coded sandbox path)
OUT=scratch/triage/runs-session7
mkdir -p "$OUT"   # the logs are not tracked any more; create the folder
for cmd in "seam-proof:node .qa/seam-proof.mjs" "pair-proof:node .qa/pair-proof.mjs" "flipproof:node .qa/flipproof.mjs" "leadproof:node .qa/leadproof.mjs" "chromecheck:node chromecheck.mjs" "lengrow-gate:node .qa/lengrow-gate.mjs"; do
  name=${cmd%%:*}; c=${cmd#*:}
  s=$(date +%s)
  $c > $OUT/battery-$name.log 2>&1; ec=$?
  e=$(date +%s)
  echo "exit=$ec duration=$((e-s))s" >> $OUT/battery-$name.log
  echo "md5-after: $(md5sum previews/spinclash-preview.html | cut -d' ' -f1) lines: $(wc -l < previews/spinclash-preview.html)" >> $OUT/battery-$name.log
  echo "$name done exit=$ec" >> $OUT/battery-progress.txt
done
echo ALLDONE >> $OUT/battery-progress.txt
