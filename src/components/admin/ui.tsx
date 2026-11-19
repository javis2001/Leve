export function AdminTitle({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-forest">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-mint/60 text-xs uppercase text-muted">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2.5 font-bold whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-mint text-forest", active: "bg-mint text-forest", pending: "bg-gold-soft text-gold-deep",
    refunded: "bg-red-50 text-danger", chargeback: "bg-red-50 text-danger", canceled: "bg-red-50 text-danger", revoked: "bg-red-50 text-danger", refused: "bg-[#eef1f0] text-muted",
  };
  const label: Record<string, string> = { paid: "Pago", active: "Ativo", pending: "Pendente", refunded: "Reembolsado", chargeback: "Chargeback", canceled: "Cancelado", revoked: "Revogado", refused: "Recusado" };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${map[status] ?? "bg-line"}`}>{label[status] ?? status}</span>;
}
