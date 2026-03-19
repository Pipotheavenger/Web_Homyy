#!/usr/bin/env bash
#
# Stress Test Orchestrator
# Runs: setup -> k6 -> cleanup
#
# Usage: bash test/stress/run-stress-test.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_DIR"

echo ""
echo "============================================"
echo "  HOMMY STRESS TEST - 100 Concurrent Users  "
echo "============================================"
echo ""

# Check k6 is installed
if ! command -v k6 &> /dev/null; then
  echo "ERROR: k6 is not installed."
  echo "Install with: winget install grafana.k6"
  echo "Or download from: https://k6.io/docs/get-started/installation/"
  exit 1
fi

echo "k6 version: $(k6 version)"
echo ""

# Phase 1: Setup
echo "━━━ PHASE 1: SETUP ━━━"
echo ""
npx tsx test/stress/setup.ts

if [ ! -f test/stress/results/manifest.json ]; then
  echo "ERROR: manifest.json not found after setup"
  exit 1
fi

echo ""

# Phase 2: k6 stress test
echo "━━━ PHASE 2: K6 STRESS TEST ━━━"
echo ""
k6 run test/stress/k6-lifecycle.js \
  --out json=test/stress/results/k6-results.json \
  2>&1 | tee test/stress/results/k6-output.log

K6_EXIT=$?
echo ""

# Phase 3: Cleanup
echo "━━━ PHASE 3: CLEANUP ━━━"
echo ""
npx tsx test/stress/cleanup.ts

echo ""
echo "============================================"
echo "  STRESS TEST COMPLETE"
echo "============================================"
echo ""
echo "Results saved to: test/stress/results/"
echo "  - k6-results.json (raw metrics)"
echo "  - k6-output.log (console output)"
echo ""

if [ $K6_EXIT -ne 0 ]; then
  echo "WARNING: k6 exited with code $K6_EXIT (some thresholds may have failed)"
  exit $K6_EXIT
fi

echo "All thresholds passed!"
