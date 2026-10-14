/**
 * Lightning.Helpers.bytes_to_human/1: decimal units, one decimal place,
 * trailing ".0" dropped. 1500 -> "1.5 KB", 2_000_000 -> "2 MB".
 */
export function bytesToHuman(bytes: number): string {
  const units: [number, string][] = [
    [1e12, "TB"],
    [1e9, "GB"],
    [1e6, "MB"],
    [1e3, "KB"],
  ];
  for (const [divisor, unit] of units) {
    if (bytes >= divisor) {
      const rounded = Math.round((bytes / divisor) * 10) / 10;
      return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded} ${unit}`;
    }
  }
  return `${bytes} B`;
}
