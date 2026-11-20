import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { getViewer } from "@/lib/auth";
import { getRecipes } from "@/lib/content/server";
import { MealPlanDocument } from "@/lib/pdf/documents";
import { pdfResponse } from "@/lib/pdf/render";
import { addDays, formatDateBR, parseISODate } from "@/lib/utils";

export const runtime = "nodejs";

const Body = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.record(z.string().regex(/^[0-6]:(cafe|almoco|lanche|jantar)$/), z.string().max(120)).refine((o) => Object.keys(o).length <= 28),
});

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.hasAccess) return new Response("Não autorizado", { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Dados inválidos", { status: 400 });
  const { weekStart, slots } = parsed.data;
  const ws = parseISODate(weekStart);
  const buf = await renderToBuffer(
    MealPlanDocument({ weekLabel: `${formatDateBR(ws, { day: "2-digit", month: "2-digit" })} a ${formatDateBR(addDays(ws, 6), { day: "2-digit", month: "2-digit", year: "numeric" })}`, slots, recipes: await getRecipes() }),
  );
  return pdfResponse(buf, `cardapio-vida-leve-${weekStart}.pdf`);
}
