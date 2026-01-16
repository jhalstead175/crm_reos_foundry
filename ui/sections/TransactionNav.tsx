import { TRANSACTION_NAV } from "@/lib/navigation/transactionNav";

export function TransactionNav({
  transactionId,
  phase
}: {
  transactionId: string;
  phase: string;
}) {
  const items = TRANSACTION_NAV.filter(item =>
    item.phases.includes(phase as any)
  );

  return (
    <nav className="flex gap-4 border-b pb-2">
      {items.map(item => (
        <a
          key={item.id}
          href={`/transactions/${transactionId}/${item.href}`}
          className="text-sm font-medium"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
