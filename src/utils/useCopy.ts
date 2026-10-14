import { useEffect, useState } from "react";

/** Copies text to the clipboard; `copied` is true for two seconds afterwards. */
export function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
  };
  return { copied, copy };
}
