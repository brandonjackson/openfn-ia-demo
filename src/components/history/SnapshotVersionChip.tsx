import Pill from "../Pill";

/**
 * The workflow version a run used (Common.snapshot_version_chip): "latest"
 * in primary, or an older snapshot's version number in yellow.
 */
export default function SnapshotVersionChip({ version, tooltip }: { version: string; tooltip?: string }) {
  return (
    <Pill square color={version === "latest" ? "primary" : "yellow"} title={tooltip}>
      {version}
    </Pill>
  );
}
