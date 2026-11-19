import { deleteMaterial, uploadMaterial } from "../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminTitle, Table } from "@/components/admin/ui";
import { Input, Label } from "@/components/ui/input";
import { getViewer } from "@/lib/auth";
import { MATERIALS } from "@/lib/pdf/documents";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function MaterialsAdmin() {
  const viewer = await getViewer();
  const sb = viewer?.mode === "supabase" ? await getSupabaseServer() : null;
  const uploaded = sb ? (((await sb.from("materials").select("id, title, storage_path, created_at").order("created_at")).data ?? []) as { id: string; title: string; storage_path: string; created_at: string }[]) : [];
  return (
    <>
      <AdminTitle title="Materiais em PDF" description="Os 7 materiais oficiais são gerados automaticamente a partir do conteúdo. Envie PDFs extras abaixo." />
      <Table head={["Material gerado", "Visualizar"]}>
        {MATERIALS.map((m) => (
          <tr key={m.slug}>
            <td className="px-3 py-2 font-semibold">{m.title}</td>
            <td className="px-3 py-2"><a className="font-semibold text-emerald" href={`/api/materiais/${m.slug}?ver=1`} target="_blank" rel="noopener">Abrir PDF</a></td>
          </tr>
        ))}
      </Table>
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 font-bold">Enviar PDF extra</h2>
          <ActionForm action={uploadMaterial} submitLabel="Enviar">
            <div><Label htmlFor="title">Título</Label><Input id="title" name="title" required /></div>
            <div><Label htmlFor="description">Descrição</Label><Input id="description" name="description" /></div>
            <div><Label htmlFor="file">Arquivo PDF (até 20 MB)</Label><Input id="file" name="file" type="file" accept="application/pdf" required className="pt-2.5" /></div>
          </ActionForm>
        </div>
        <div>
          <h2 className="mb-3 font-bold">PDFs enviados</h2>
          <Table head={["Título", "Enviado em", ""]}>
            {uploaded.map((m) => (
              <tr key={m.id}>
                <td className="px-3 py-2">{m.title}</td>
                <td className="px-3 py-2 text-xs">{new Date(m.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-3 py-2"><ActionForm action={deleteMaterial} inline variant="ghost" submitLabel="Excluir" showMessage={false}><input type="hidden" name="id" value={m.id} /></ActionForm></td>
              </tr>
            ))}
            {!uploaded.length && <tr><td colSpan={3} className="px-3 py-6 text-center text-muted">Nenhum PDF extra.</td></tr>}
          </Table>
        </div>
      </div>
    </>
  );
}
