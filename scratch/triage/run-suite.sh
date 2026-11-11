#!/bin/bash
# usage: run-suite.sh <suite-label> <script>
# runs a .qa suite from repo root, captures stdout+stderr and exit code, never mutates canonical.
cd /workspace/arena-engine
label="$1"; script="$2"
out="scratch/triage/runs-session6/${label}.log"
{
  echo "=== ${label} :: node ${script} ==="
  echo "=== started $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  node "${script}" 2>&1
  echo "=== exit=$? ==="
  echo "=== canonical md5 after: $(md5sum previews/spinclash-preview.html | cut -d' ' -f1) / $(wc -l < previews/spinclash-preview.html) lines ==="
} > "${out}" 2>&1
echo "DONE ${label} exit=${?}"
