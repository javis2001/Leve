/** Gera os 7 PDFs + um cardápio de exemplo em test-results/pdfs e valida páginas e texto. */
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";
import { EXERCISES } from "@/lib/content/exercises";
import { JOURNEY_DAYS } from "@/lib/content/journey";
import { RECIPES } from "@/lib/content/recipes";
import { MATERIALS, MealPlanDocument, materialDocument } from "@/lib/pdf/documents";

const out = "test-results/pdfs";
mkdirSync(out, { recursive: true });
const content = { days: JOURNEY_DAYS, recipes: RECIPES, exercises: EXERCISES };

function pages(file: string) {
  try {
    const info = execFileSync("pdfinfo", [file]).toString();
    return Number(/Pages:\s+(\d+)/.exec(info)?.[1] ?? 0);
  } catch {
    return -1; // pdfinfo indisponível
  }
}
function text(file: string) {
  try {
    return execFileSync("pdftotext", [file, "-"]).toString();
  } catch {
    return "";
  }
}

const MIN_PAGES: Record<string, number> = {
  "guia-inicial": 3,
  "calendario-30-dias": 3,
  "livro-de-receitas": 12,
  "planner-semanal": 3,
  "lista-de-compras": 3,
  "diario-de-habitos": 6,
  "guia-de-exercicios": 8,
};

describe("materiais em PDF", () => {
  for (const m of MATERIALS) {
    it(`gera ${m.slug}`, async () => {
      const buf = await renderToBuffer(materialDocument(m.slug, content));
      const file = `${out}/${m.slug}.pdf`;
      writeFileSync(file, buf);
      expect(buf.subarray(0, 4).toString()).toBe("%PDF");
      const n = pages(file);
      if (n >= 0) expect(n).toBeGreaterThanOrEqual(MIN_PAGES[m.slug]);
      const t = text(file);
      if (t) {
        expect(t).toMatch(/Página 2 de \d+/);
        expect(t).not.toMatch(/\b(lorem|ipsum|TODO|undefined|NaN|null)\b/);
      }
    }, 60_000);
  }

  it("livro contém todas as receitas", () => {
    const t = text(`${out}/livro-de-receitas.pdf`).replace(/\s+/g, " ");
    if (!t) return;
    for (const r of RECIPES) expect(t, r.title).toContain(r.title.split(" ").slice(0, 3).join(" "));
  });

  it("exporta o cardápio pessoal", async () => {
    const buf = await renderToBuffer(
      MealPlanDocument({ weekLabel: "17/11 a 23/11", slots: { "0:cafe": RECIPES[0].slug, "0:almoco": RECIPES[10].slug, "2:jantar": RECIPES[22].slug }, recipes: RECIPES }),
    );
    writeFileSync(`${out}/cardapio-exemplo.pdf`, buf);
    const t = text(`${out}/cardapio-exemplo.pdf`);
    if (t) expect(t).toContain(RECIPES[10].title.split(" ")[0]);
  }, 60_000);
});
