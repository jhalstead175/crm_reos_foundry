import { TimelineItemCard } from "@/ui/blocks/TimelineItemCard";

interface Props {
  items: any[];
}

export function TimelineSection({ items }: Props) {
  return (
    <section>
      <h2 className="text-lg font-medium mb-4">Timeline</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <TimelineItemCard key={item.eventId} item={item} />
        ))}
      </div>
    </section>
  );
}
