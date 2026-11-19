import { getViewer } from "@/lib/auth";
import { MATERIALS, type MaterialSlug } from "@/lib/pdf/documents";
import { pdfResponse, renderMaterial } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return new Response("Faça login para baixar os materiais.", { status: 401 });
  if (!viewer.hasAccess) return new Response("Acesso não liberado.", { status: 403 });
  const { slug } = await params;
  const m = MATERIALS.find((x) => x.slug === slug);
  if (!m) return new Response("Material não encontrado.", { status: 404 });
  try {
    const buf = await renderMaterial(m.slug as MaterialSlug);
    const inline = new URL(req.url).searchParams.get("ver") === "1";
    return pdfResponse(buf, `vida-leve-30-${m.slug}.pdf`, inline);
  } catch (e) {
    console.error("[pdf]", e);
    return new Response("Não foi possível gerar o PDF.", { status: 500 });
  }
}
