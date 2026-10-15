#!/usr/bin/env bash
# Everything "compare with Lightning" needs, in one command:
#
#   npm run compare:all                # set up what's missing, then run every spec
#   npm run compare:all -- --setup     # only set up (Lightning, shared data, replica)
#   npm run compare:all -- --only core # run one spec (core, kickstart or admin)
#
# 1. Finds a Lightning checkout (LIGHTNING_DIR, else ../lightning next to this
#    repo) or clones OpenFn/lightning there, on main.
# 2. Installs, seeds the demo data and starts Lightning on :4000
#    (lightning-setup.sh; the first run takes ~10 minutes, then seconds).
# 3. Patches Lightning's editor UUID check in that checkout, locally and
#    uncommitted, so Kickstarted projects load (see kickstart/README.md).
# 4. Syncs kickstart/exports/ and loads the scenario into Lightning.
# 5. Starts the replica's dev server on :5173 if it isn't running.
# 6. Runs specs/core.json and specs/kickstart.json as Amy, and specs/admin.json
#    as the superuser, into compare-out/<spec>/ (gitignored): side-by-side PNGs
#    and a report.md each.
#
# Idempotent: re-running skips whatever is already done.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
LIGHTNING_DIR="${LIGHTNING_DIR:-$(cd "$REPO/.." && pwd)/lightning}"
OUT="${OUT:-$REPO/compare-out}"
LOG_DIR="${LOG_DIR:-/tmp/lightning-screenshots}"

SETUP_ONLY=false
ONLY=""
while (($#)); do
  case "$1" in
    --setup) SETUP_ONLY=true ;;
    --only) ONLY="$2"; shift ;;
    *) echo "Unknown option $1" >&2; exit 1 ;;
  esac
  shift
done

step() { printf '\n==> %s\n' "$*"; }

# 1. Lightning checkout.
if [[ ! -f "$LIGHTNING_DIR/mix.exs" ]]; then
  step "Cloning OpenFn/lightning into $LIGHTNING_DIR"
  git clone --depth 50 https://github.com/OpenFn/lightning.git "$LIGHTNING_DIR"
fi

# 3 (before 2, so a fresh server builds with it). The editor validates ids with
# z.uuidv4(); Kickstart's ids are v5. Local only: never commit this.
COMMON="$LIGHTNING_DIR/assets/js/collaborative-editor/types/common.ts"
if grep -q "z.uuidv4(" "$COMMON" 2>/dev/null; then
  step "Patching $COMMON locally (z.uuidv4 -> z.uuid) so Kickstarted projects load"
  sed -i "s/z\.uuidv4(/z.uuid(/" "$COMMON"
fi

# 2. Lightning, seeded and running.
(cd "$LIGHTNING_DIR" && LOG_DIR="$LOG_DIR" "$HERE/lightning-setup.sh" >"$LOG_DIR-setup.log" 2>&1) || {
  tail -30 "$LOG_DIR-setup.log"
  exit 1
}
step "Lightning is up on :4000 (log: $LOG_DIR-setup.log)"
export PATH=/opt/beam/otp/bin:/opt/beam/elixir/bin:$PATH LANG=C.UTF-8 ELIXIR_ERL_OPTIONS=+fnu MIX_ENV=dev

# 4. Shared projects.
cd "$REPO"
[[ -d node_modules ]] || { step "npm ci"; npm ci --no-audit --no-fund >/dev/null; }
step "Syncing kickstart/exports/ and loading it into Lightning"
node kickstart/sync.mjs
(cd "$LIGHTNING_DIR" && mix lightning.kickstart "$REPO/kickstart/scenario.yaml" >"$LOG_DIR/kickstart.log" 2>&1) || {
  tail -30 "$LOG_DIR/kickstart.log"
  exit 1
}

# 5. Replica.
if ! curl -sf -o /dev/null http://localhost:5173/openfn-ia-demo/; then
  step "Starting the replica on :5173 (log: $LOG_DIR/vite.log)"
  nohup npx vite --port 5173 --strictPort >"$LOG_DIR/vite.log" 2>&1 &
  timeout 60 bash -c "until curl -sf -o /dev/null http://localhost:5173/openfn-ia-demo/; do sleep 1; done"
fi

$SETUP_ONLY && { step "Set up. Lightning: http://localhost:4000  Replica: http://localhost:5173/openfn-ia-demo/"; exit 0; }

# 6. Specs.
run() {
  local name="$1"; shift
  [[ -n "$ONLY" && "$ONLY" != "$name" ]] && return 0
  step "Comparing specs/$name.json -> compare-out/$name/"
  node "$HERE/compare.mjs" --spec "$HERE/specs/$name.json" --out "$OUT/$name" "$@"
}
run core $("$HERE/lightning-vars.sh")
run kickstart
run admin --email super@openfn.org

step "Done. Read compare-out/<spec>/report.md, then open every <shot>.png (Lightning left, replica right)."
