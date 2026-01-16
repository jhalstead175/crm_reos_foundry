import { EventType } from "@/lib/events/eventRegistry";
import { Role } from "@/lib/events/permissions";

export interface TaskTrigger {
  triggerEvent: EventType;

  task: {
    title: string;
    description?: string;
    assignedRole: Role;
    dueInDays?: number;
  };
}
