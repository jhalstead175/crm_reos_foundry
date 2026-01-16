export type EventField =
  | 'title'
  | 'description'
  | 'occurredAt'
  | 'participants'
  | 'documentId'
  | 'amount'
  | 'status'
  | 'deadline';

export interface EventFormConfig {
  fields: EventField[];
  required: EventField[];
  defaults?: Partial<Record<EventField, any>>;
}

export interface EventDefinition {
  type: string;
  category: EventCategory;
  context: TransactionPhase[];
  visibility: Role[];
  form?: EventFormConfig;
}

export const EVENT_REGISTRY: Record<string, EventDefinition> = {
  'inspection.performed': {
    type: 'inspection.performed',
    category: 'action',
    context: ['due_diligence'],
    visibility: ['agent', 'buyer', 'seller'],
    form: {
      fields: ['occurredAt', 'participants', 'documentId', 'status'],
      required: ['occurredAt', 'status'],
      defaults: {
        status: 'completed',
      },
    },
  },

  'offer.accepted': {
    type: 'offer.accepted',
    category: 'milestone',
    context: ['offer_negotiation'],
    visibility: ['agent', 'buyer', 'seller'],
    form: {
      fields: ['occurredAt'],
      required: ['occurredAt'],
    },
  },

  'payment.made': {
    type: 'payment.made',
    category: 'action',
    context: ['closing_preparation'],
    visibility: ['agent', 'attorney'],
    form: {
      fields: ['occurredAt', 'amount', 'description'],
      required: ['occurredAt', 'amount'],
    },
  },
};
