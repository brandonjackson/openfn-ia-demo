#!/usr/bin/env bash
# Print the --var flags the specs need, read from a local Lightning's database
# (ids are random per seed). Usage:
#   node scripts/compare-lightning/compare.mjs --spec ... $(scripts/compare-lightning/lightning-vars.sh)
set -euo pipefail
DB="${LIGHTNING_DB:-postgres://postgres:postgres@localhost:5432/lightning_dev}"
q() { psql "$DB" -Atc "$1"; }

# openhie-project has the same id in the demo seed and the replica's fixtures.
P=$(q "select id from projects where name = 'openhie-project' limit 1")
LW=$(q "select id from workflows where project_id = '$P' and name = 'OpenHIE Workflow' and deleted_at is null limit 1")
LJOB=$(q "select id from jobs where workflow_id = '$LW' and name = 'Transform data to FHIR standard' limit 1")
LRUN=$(q "select r.id from runs r join work_orders w on w.id = r.work_order_id where w.workflow_id = '$LW' and r.state = 'success' order by r.inserted_at desc limit 1")

[ -n "$LRUN" ] || { echo "No successful run on OpenHIE Workflow yet: run it once from the editor, then retry." >&2; exit 1; }
echo "--var P=$P --var LW=$LW --var LJOB=$LJOB --var LRUN=$LRUN"
