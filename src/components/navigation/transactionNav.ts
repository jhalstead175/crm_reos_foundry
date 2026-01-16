import { TransactionPhase } from "@/lib/transactions/phases";

export interface TransactionNavItem {
  id: string;
  label: string;
  href: string;
  phases: TransactionPhase[];
}

export const TRANSACTION_NAV: TransactionNavItem[] = [
  {
    id: "timeline",
    label: "Timeline",
    href: "timeline",
    phases: [
      "lead",
      "listing",
      "offer",
      "under_contract",
      "due_diligence",
      "closing",
      "post_close"
    ]
  },
  {
    id: "documents",
    label: "Documents",
    href: "documents",
    phases: [
      "under_contract",
      "due_diligence",
      "closing",
      "post_close"
    ]
  },
  {
    id: "tasks",
    label: "Tasks",
    href: "tasks",
    phases: [
      "offer",
      "under_contract",
      "due_diligence",
      "closing"
    ]
  },
  {
    id: "participants",
    label: "Participants",
    href: "participants",
    phases: ["listing", "offer", "under_contract"]
  }
];
