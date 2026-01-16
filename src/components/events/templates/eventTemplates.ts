// lib/events/templates/eventTemplates.ts
import { EventTemplate } from "./types";

export const EventTemplates: EventTemplate[] = [
  /* ---------------- LEAD ---------------- */

  {
    id: "log_initial_contact",
    eventType: "DocumentUploaded",
    label: "Log Initial Contact",
    description: "Record first meaningful contact with lead",
    phases: ["lead"],
    suggestedRoles: ["agent"],
    defaults: {
      note: "Initial contact made"
    }
  },

  /* ---------------- OFFER ---------------- */

  {
    id: "submit_offer",
    eventType: "OfferSubmitted",
    label: "Submit Offer",
    description: "Submit an offer to the seller",
    phases: ["offer"],
    suggestedRoles: ["agent", "buyer"]
  },

  {
    id: "accept_offer",
    eventType: "OfferAccepted",
    label: "Accept Offer",
    description: "Record mutual acceptance",
    phases: ["offer"],
    suggestedRoles: ["agent", "seller"]
  },

  /* ---------------- UNDER CONTRACT ---------------- */

  {
    id: "order_inspection",
    eventType: "InspectionOrdered",
    label: "Order Inspection",
    description: "Schedule property inspection",
    phases: ["under_contract", "due_diligence"],
    suggestedRoles: ["agent"],
    defaults: {
      inspectionType: "general"
    }
  },

  /* ---------------- CLOSING ---------------- */

  {
    id: "upload_closing_docs",
    eventType: "DocumentUploaded",
    label: "Upload Closing Documents",
    phases: ["closing"],
    suggestedRoles: ["agent", "attorney"]
  },

  /* ---------------- POST CLOSE ---------------- */

  {
    id: "transaction_closed",
    eventType: "TransactionClosed",
    label: "Mark Transaction Closed",
    phases: ["post_close"],
    suggestedRoles: ["agent", "admin"]
  }
];
