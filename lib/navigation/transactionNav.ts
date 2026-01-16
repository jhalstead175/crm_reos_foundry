export interface TransactionNavItem {
  id: string;
  label: string;
  href: string;
  phases: string[];
}

export const TRANSACTION_NAV: TransactionNavItem[] = [
  {
    id: "timeline",
    label: "Timeline",
    href: "timeline",
    phases: ["active", "pending", "closed"],
  },
  {
    id: "documents",
    label: "Documents",
    href: "documents",
    phases: ["active", "pending", "closed"],
  },
  {
    id: "tasks",
    label: "Tasks",
    href: "tasks",
    phases: ["active", "pending"],
  },
  {
    id: "messages",
    label: "Messages",
    href: "messages",
    phases: ["active", "pending", "closed"],
  },
];
