interface Props {
  tone: "important" | "critical";
}

export function Badge({ tone }: Props) {
  const styles =
    tone === "critical"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${styles}`}>
      {tone.toUpperCase()}
    </span>
  );
}
