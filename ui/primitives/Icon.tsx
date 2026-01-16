interface Props {
  name?: string;
}

export function Icon({ name }: Props) {
  if (!name) return null;

  return (
    <div className="w-8 h-8 flex items-center justify-center text-gray-500">
      {/* Placeholder for icon system */}
      <span>{name}</span>
    </div>
  );
}
