import { Role } from "@/lib/events/permissions";
import { TimelineItem } from "./timelineTypes";

type TemplateFn = (args: {
  event: any;
  role: Role;
}) => Omit<TimelineItem, "eventId" | "transactionId" | "occurredAt"> | null;

export const TimelineTemplates: Record<string, TemplateFn> = {
  OfferSubmitted: ({ event, role }) => {
    if (role === "buyer") {
      return {
        title: "Your offer was submitted",
        description: `Offer price: $${event.payload.offerPrice.toLocaleString()}`,
        icon: "offer",
        emphasis: "important",
        visibleToRoles: ["buyer", "agent", "admin"]
      };
    }

    return {
      title: "Offer submitted",
      description: `Offer submitted for $${event.payload.offerPrice.toLocaleString()}`,
      icon: "offer",
      emphasis: "important",
      visibleToRoles: ["agent", "seller", "admin"]
    };
  },

  OfferAccepted: ({ event }) => ({
    title: "Offer accepted",
    description: `Accepted at $${event.payload.acceptedPrice.toLocaleString()}`,
    icon: "check",
    emphasis: "critical",
    visibleToRoles: ["agent", "buyer", "seller", "admin"]
  }),

  InspectionOrdered: ({ event }) => ({
    title: "Inspection ordered",
    description: `Type: ${event.payload.inspectionType}, scheduled for ${event.payload.scheduledDate}`,
    icon: "inspection",
    emphasis: "normal",
    visibleToRoles: ["agent", "buyer", "seller", "admin"]
  }),

  DocumentUploaded: ({ event }) => ({
    title: "Document uploaded",
    description: event.payload.fileName,
    icon: "document",
    emphasis: "normal",
    visibleToRoles: ["agent", "buyer", "seller", "admin"]
  })
};
