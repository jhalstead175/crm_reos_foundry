import { PhaseEmptyState } from "./types";

export const PHASE_EMPTY_STATES: PhaseEmptyState[] = [
  {
    phase: "lead",
    section: "timeline",
    title: "This is the beginning",
    explanation:
      "Once contact is made or qualification begins, activity will appear here.",
    suggestions: [
      { label: "Log initial contact", eventType: "DocumentUploaded" }
    ],
    visibleToRoles: ["agent"]
  },

  {
    phase: "offer",
    section: "tasks",
    title: "No tasks yet",
    explanation:
      "Tasks usually appear after an offer is accepted.",
    suggestions: [
      { label: "Submit an offer", eventType: "OfferSubmitted" }
    ],
    visibleToRoles: ["agent", "buyer"]
  },

  {
    phase: "under_contract",
    section: "documents",
    title: "No documents uploaded yet",
    explanation:
      "Inspection reports, disclosures, and contracts usually appear here.",
    suggestions: [
      { label: "Upload inspection document", eventType: "DocumentUploaded" }
    ],
    visibleToRoles: ["agent", "buyer", "seller"]
  },

  {
    phase: "due_diligence",
    section: "tasks",
    title: "No tasks listed",
    explanation:
      "Inspection reviews and repair negotiations are often tracked as tasks.",
    suggestions: [
      { label: "Order inspection", eventType: "InspectionOrdered" }
    ],
    visibleToRoles: ["agent"]
  }
];
