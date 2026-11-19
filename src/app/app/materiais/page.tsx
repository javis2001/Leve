import type { Metadata } from "next";
import { Download, Eye, FileText, Paperclip } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { MATERIALS } from "@/lib/pdf/documents";
import { getSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Materiais" };

async function uploadedMaterials() {
  const sb = await getSupabaseServer();
  if (!sb) return [];
  const { data } = await sb.from("materials").select("id, title, description, storage_path").eq("published", true).order("created_at");
  const out: { id: string; title: string; description: string | null; url: string }[] = [];
  for (const m of data ?? []) {
    const { data: signed } = await sb.storage.from("materiais").createSignedUrl(m.storage_path, 60 * 60);
    if (signed?.signedUrl) out.push({ id: m.id, title: m.title, description: m.description, url: signed.signedUrl });
  }
  return out;
}

const COLORS = ["from-emerald to-forest", "from-[#C9952F] to-[#9A7A32]", "from-[#4F6FC2] to-[#2F4C99]", "from-forest to-[#073f2f]"];

export default async function MaterialsPage() {
  const extra = await uploadedMaterials();
  return (
    <>
      <PageHeader eyebrow="Downloads" title="Materiais para imprimir" description="PDFs com capa, paginação e conteúdo completo — prontos para ler no celular ou imprimir em A4." />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MATERIALS.map((m, i) => (
          <li key={m.slug} className="flex flex-col overflow-hidden rounded-3xl border border-line/80 bg-white shadow-soft">
            <div className={`relative flex h-32 items-end bg-gradient-to-br p-5 text-white ${COLORS[i % COLORS.length]}`}>
              <FileText className="absolute top-5 right-5 size-10 text-white/25" />
              <span className="text-xs font-bold tracking-[0.14em] uppercase opacity-80">PDF {String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-bold leading-snug">{m.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{m.description}</p>
              <div className="mt-4 flex gap-2">
                <Button asChild className="flex-1">
                  <a href={`/api/materiais/${m.slug}`} download>
                    <Download /> Baixar
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon" aria-label={`Visualizar ${m.title}`}>
                  <a href={`/api/materiais/${m.slug}?ver=1`} target="_blank" rel="noopener">
                    <Eye />
                  </a>
                </Button>
              </div>
            </div>
          </li>
        ))}
        {extra.map((m) => (
          <li key={m.id} className="flex flex-col rounded-3xl border border-line/80 bg-white p-5 shadow-soft">
            <Paperclip className="size-6 text-emerald" />
            <h2 className="mt-3 font-bold">{m.title}</h2>
            {m.description ? <p className="mt-1 flex-1 text-sm text-muted">{m.description}</p> : <span className="flex-1" />}
            <Button asChild className="mt-4">
              <a href={m.url} target="_blank" rel="noopener">
                <Download /> Baixar
              </a>
            </Button>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">
        Dica: no celular, toque em “Baixar” e escolha “Abrir em” ou “Salvar em Arquivos”. Para imprimir, use papel A4 na escala 100%.
      </p>
    </>
  );
}
