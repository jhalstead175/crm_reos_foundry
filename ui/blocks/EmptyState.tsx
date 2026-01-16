interface Props {
  title: string;
  explanation: string;
  suggestions: {
    label: string;
    onClick?: () => void;
  }[];
}

export function EmptyState({
  title,
  explanation,
  suggestions
}: Props) {
  return (
    <div className="border rounded-lg p-6 text-center space-y-4">
      <h3 className="font-medium">{title}</h3>

      <p className="text-sm text-gray-600">
        {explanation}
      </p>

      {suggestions.length > 0 && (
        <div className="flex justify-center gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="text-sm underline"
              onClick={s.onClick}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
