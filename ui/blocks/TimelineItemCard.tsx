import { Badge } from "@/ui/elements/Badge";
import { Icon } from "@/ui/primitives/Icon";

interface Props {
  item: {
    title: string;
    description?: string;
    occurredAt: string;
    emphasis?: "normal" | "important" | "critical";
    icon?: string;
  };
}

export function TimelineItemCard({ item }: Props) {
  return (
    <div className="border rounded-lg p-4 flex gap-3">
      <Icon name={item.icon} />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{item.title}</h3>
          {item.emphasis && item.emphasis !== "normal" && (
            <Badge tone={item.emphasis} />
          )}
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 mt-1">
            {item.description}
          </p>
        )}

        <div className="text-xs text-gray-400 mt-2">
          {new Date(item.occurredAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
