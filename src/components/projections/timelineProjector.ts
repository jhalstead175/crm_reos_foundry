import { TimelineTemplates } from "./timelineTemplates";
import { TimelineItem } from "./timelineTypes";
import { Role } from "@/lib/events/permissions";

export function projectTimeline({
  events,
  role
}: {
  events: any[];
  role: Role;
}): TimelineItem[] {
  return events
    .map((event) => {
      const template = TimelineTemplates[event.type];
      if (!template) return null;

      const rendered = template({ event, role });
      if (!rendered) return null;

      if (!rendered.visibleToRoles.includes(role)) {
        return null;
      }

      return {
        eventId: event.id,
        transactionId: event.transaction_id,
        occurredAt: event.created_at,
        ...rendered
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(a!.occurredAt).getTime() -
        new Date(b!.occurredAt).getTime()
    ) as TimelineItem[];
}
