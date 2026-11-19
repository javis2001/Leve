import { grantAccess, setEntitlementStatus, setRole } from "../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminTitle, StatusPill, Table } from "@/components/admin/ui";
import { Input, Label } from "@/components/ui/input";
import { getViewer } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().toLowerCase().slice(0, 100);
  const viewer = await getViewer();
  const sb = viewer?.mode === "supabase" ? await getSupabaseServer() : null;
  type Ent = { id: string; email: string; status: string; source: string; granted_at: string; user_id: string | null; notes: string | null };
  type Prof = { id: string; email: string; full_name: string | null; role: string; created_at: string };
  let profiles: Prof[] = [];
  let ents: Ent[] = [];
  if (sb) {
    let pq = sb.from("profiles").select("id, email, full_name, role, created_at").order("created_at", { ascending: false }).limit(100);
    let eq = sb.from("entitlements").select("id, email, status, source, granted_at, user_id, notes").order("granted_at", { ascending: false }).limit(200);
    if (q) {
      pq = pq.ilike("email", `%${q.replace(/[%_]/g, "")}%`);
      eq = eq.ilike("email", `%${q.replace(/[%_]/g, "")}%`);
    }
    profiles = ((await pq).data ?? []) as Prof[];
    ents = ((await eq).data ?? []) as Ent[];
  }
  const accessOf = (p: Prof) => ents.filter((e) => e.user_id === p.id || e.email.toLowerCase() === p.email.toLowerCase());
  return (
    <>
      <AdminTitle title="Usuários e acesso" description="Consulte a situação de acesso, libere manualmente ou revogue." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <form className="flex gap-2">
            <Input name="q" defaultValue={q} placeholder="Buscar por e-mail" aria-label="Buscar por e-mail" />
          </form>
          <Table head={["Usuária", "Cadastro", "Acesso", "Papel"]}>
            {profiles.map((p) => {
              const a = accessOf(p);
              const active = a.some((e) => e.status === "active");
              return (
                <tr key={p.id}>
                  <td className="px-3 py-2">
                    <p className="font-semibold">{p.full_name || "—"}</p>
                    <p className="text-xs text-muted">{p.email}</p>
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-3 py-2"><StatusPill status={active ? "active" : a[0]?.status ?? "pending"} /></td>
                  <td className="px-3 py-2">
                    <ActionForm action={setRole} inline variant="ghost" submitLabel={p.role === "admin" ? "Tornar membro" : "Tornar admin"} showMessage={false}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="role" value={p.role === "admin" ? "member" : "admin"} />
                      <span className="text-xs font-bold">{p.role === "admin" ? "Admin" : "Membro"}</span>
                    </ActionForm>
                  </td>
                </tr>
              );
            })}
            {!profiles.length && <tr><td colSpan={4} className="px-3 py-6 text-center text-muted">Nenhuma conta encontrada.</td></tr>}
          </Table>
          <h2 className="font-bold">Direitos de acesso</h2>
          <Table head={["E-mail", "Origem", "Data", "Status", ""]}>
            {ents.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-2">{e.email}{e.notes ? <p className="text-xs text-muted">{e.notes}</p> : null}</td>
                <td className="px-3 py-2">{e.source === "admin" ? "Manual" : "Checkout"}</td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">{new Date(e.granted_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-3 py-2"><StatusPill status={e.status} /></td>
                <td className="px-3 py-2">
                  {e.status === "active" || e.status === "revoked" ? (
                    <ActionForm action={setEntitlementStatus} inline variant="ghost" submitLabel={e.status === "active" ? "Revogar" : "Reativar"} showMessage={false}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="status" value={e.status === "active" ? "revoked" : "active"} />
                    </ActionForm>
                  ) : null}
                </td>
              </tr>
            ))}
            {!ents.length && <tr><td colSpan={5} className="px-3 py-6 text-center text-muted">Nenhum acesso registrado.</td></tr>}
          </Table>
        </div>
        <div className="h-fit rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 font-bold">Liberar acesso manualmente</h2>
          <ActionForm action={grantAccess} submitLabel="Liberar acesso">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="notes">Motivo</Label>
              <Input id="notes" name="notes" placeholder="Ex.: compra via Pix manual, cortesia" />
            </div>
          </ActionForm>
          <p className="mt-3 text-xs text-muted">Use apenas para casos excepcionais. Compras pelo checkout são liberadas automaticamente pelo webhook.</p>
        </div>
      </div>
    </>
  );
}
