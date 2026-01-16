import { z } from "zod";

/**
 * Base payload — extended by all events
 */
export const BaseEventSchema = z.object({
  note: z.string().optional()
});

/**
 * Specific event payloads
 */
export const OfferSubmittedSchema = BaseEventSchema.extend({
  offerPrice: z.number().positive(),
  offerDate: z.string(), // ISO
  expirationDate: z.string().optional()
});

export const OfferAcceptedSchema = BaseEventSchema.extend({
  acceptedPrice: z.number().positive(),
  acceptedDate: z.string()
});

export const InspectionOrderedSchema = BaseEventSchema.extend({
  inspectionType: z.enum(["general", "termite", "structural"]),
  scheduledDate: z.string()
});

export const DocumentUploadedSchema = BaseEventSchema.extend({
  documentType: z.string(),
  fileName: z.string()
});

export const TaskCompletedSchema = BaseEventSchema.extend({
  taskId: z.string().uuid()
});
