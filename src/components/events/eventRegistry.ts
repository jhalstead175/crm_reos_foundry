import { ZodSchema } from "zod";
import {
  OfferSubmittedSchema,
  OfferAcceptedSchema,
  InspectionOrderedSchema,
  DocumentUploadedSchema,
  TaskCompletedSchema
} from "./schemas";
import { Role } from "./permissions";

export type EventType =
  | "TransactionCreated"
  | "OfferSubmitted"
  | "OfferAccepted"
  | "InspectionOrdered"
  | "DocumentUploaded"
  | "TaskCompleted";

export interface EventDefinition {
  type: EventType;
  schema: ZodSchema;
  allowedRoles: Role[];
  systemOnly?: boolean;
  createsTasks?: boolean;
}

export const EventRegistry: Record<EventType, EventDefinition> = {
  TransactionCreated: {
    type: "TransactionCreated",
    schema: OfferSubmittedSchema.partial(),
    allowedRoles: ["agent", "admin", "system"]
  },

  OfferSubmitted: {
    type: "OfferSubmitted",
    schema: OfferSubmittedSchema,
    allowedRoles: ["agent", "buyer"]
  },

  OfferAccepted: {
    type: "OfferAccepted",
    schema: OfferAcceptedSchema,
    allowedRoles: ["agent", "seller"]
  },

  InspectionOrdered: {
    type: "InspectionOrdered",
    schema: InspectionOrderedSchema,
    allowedRoles: ["agent"],
    createsTasks: true
  },

  DocumentUploaded: {
    type: "DocumentUploaded",
    schema: DocumentUploadedSchema,
    allowedRoles: ["agent", "buyer", "seller", "admin"]
  },

  TaskCompleted: {
    type: "TaskCompleted",
    schema: TaskCompletedSchema,
    allowedRoles: ["system"],
    systemOnly: true
  }
};
