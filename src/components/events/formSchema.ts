import { z } from 'zod';
import { EVENT_REGISTRY, EventField } from './registry';

const FIELD_SCHEMAS: Record<EventField, z.ZodTypeAny> = {
  title: z.string().min(3),
  description: z.string().optional(),
  occurredAt: z.string().datetime(),
  participants: z.array(z.string().uuid()).optional(),
  documentId: z.string().uuid().optional(),
  amount: z.number().positive(),
  status: z.enum(['pending', 'completed', 'failed']),
  deadline: z.string().datetime(),
};

export function buildEventFormSchema(eventType: string) {
  const def = EVENT_REGISTRY[eventType];
  if (!def?.form) return null;

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of def.form.fields) {
    const schema = FIELD_SCHEMAS[field];
    shape[field] = def.form.required.includes(field)
      ? schema
      : schema.optional();
  }

  return z.object(shape);
}
