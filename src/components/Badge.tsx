const colorMap: Record<string, string> = {
  Live: "bg-green-100 text-green-700",
  Draft: "bg-yellow-100 text-yellow-700",
};

export default function Badge({ label }: { label: string }) {
  const colors = colorMap[label] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}
    >
      {label}
    </span>
  );
}
