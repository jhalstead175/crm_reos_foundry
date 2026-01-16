interface Props {
  transaction: {
    id: string;
    type: string;
    created_at: string;
  };
}

export function TransactionHeader({ transaction }: Props) {
  return (
    <section className="border-b pb-4">
      <h1 className="text-xl font-semibold">
        Transaction
      </h1>
      <div className="text-sm text-gray-500">
        {transaction.type} • Created{" "}
        {new Date(transaction.created_at).toLocaleDateString()}
      </div>
    </section>
  );
}
