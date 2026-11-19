import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { getExercises, getJourneyDays, getRecipes } from "@/lib/content/server";
import { materialDocument, type MaterialSlug } from "./documents";

const cache = new Map<string, { at: number; buf: Buffer }>();
const TTL = 10 * 60 * 1000;

export async function renderMaterial(slug: MaterialSlug) {
  const hit = cache.get(slug);
  if (hit && Date.now() - hit.at < TTL) return hit.buf;
  const [days, recipes, exercises] = await Promise.all([getJourneyDays(), getRecipes(), getExercises()]);
  const buf = await renderToBuffer(materialDocument(slug, { days, recipes, exercises }));
  cache.set(slug, { at: Date.now(), buf });
  return buf;
}

export function pdfResponse(buf: Buffer, filename: string, inline = false) {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
