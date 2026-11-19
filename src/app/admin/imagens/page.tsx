import { deleteImage, uploadImage } from "../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminTitle } from "@/components/admin/ui";
import { Input, Label } from "@/components/ui/input";
import { getViewer } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function ImagesAdmin() {
  const viewer = await getViewer();
  const sb = viewer?.mode === "supabase" ? await getSupabaseServer() : null;
  const files = sb ? ((await sb.storage.from("imagens").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } })).data ?? []) : [];
  return (
    <>
      <AdminTitle title="Imagens" description="Envie fotos reais (licenciadas) para receitas e para a página de vendas. Copie a URL e cole no cadastro da receita." />
      <div className="mb-6 max-w-lg rounded-2xl border border-line bg-white p-5">
        <ActionForm action={uploadImage} submitLabel="Enviar imagem">
          <div><Label htmlFor="file">Imagem (JPG, PNG ou WebP até 5 MB)</Label><Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="pt-2.5" /></div>
        </ActionForm>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {files.filter((f) => f.id).map((f) => {
          const url = sb!.storage.from("imagens").getPublicUrl(f.name).data.publicUrl;
          return (
            <li key={f.name} className="overflow-hidden rounded-2xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={f.name} className="aspect-square w-full object-cover" loading="lazy" />
              <div className="space-y-2 p-2">
                <Input readOnly value={url} aria-label="URL da imagem" className="h-9 text-xs" />
                <ActionForm action={deleteImage} inline variant="ghost" submitLabel="Excluir" showMessage={false}><input type="hidden" name="name" value={f.name} /></ActionForm>
              </div>
            </li>
          );
        })}
      </ul>
      {!files.length && <p className="text-sm text-muted">Nenhuma imagem enviada.</p>}
    </>
  );
}
