"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Copy, FileDown, Info, Loader2, Plus, RefreshCw, Search, ShoppingBasket, Trash2, Wand2 } from "lucide-react";
import { DataGate } from "@/components/app/data-gate";
import { PageHeader } from "@/components/app/page-header";
import { RecipeArt } from "@/components/brand/recipe-art";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { normalize } from "@/lib/content/filters";
import { aggregateIngredients } from "@/lib/content/shopping";
import { RECIPE_CATEGORIES, type Recipe, type RecipeCategory } from "@/lib/content/types";
import { useUserData } from "@/lib/data/provider";
import { MEALS, type MealKey, type MealSlots } from "@/lib/data/types";
import { WEEKDAYS_LONG, WEEKDAYS_SHORT, addDays, cn, formatDateBR, hashString, parseISODate, startOfWeek, toISODate } from "@/lib/utils";

export function MealPlanner({ recipes }: { recipes: Recipe[] }) {
  const { saveMealPlan, addShopping } = useUserData();
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => toISODate(startOfWeek()));
  const [dayIdx, setDayIdx] = useState(() => (new Date().getDay() + 6) % 7);
  const [picker, setPicker] = useState<{ day: number; meal: MealKey } | null>(null);
  const [exporting, setExporting] = useState(false);
  const bySlug = useMemo(() => new Map(recipes.map((r) => [r.slug, r])), [recipes]);

  return (
    <DataGate>
      {(data) => {
        const slots: MealSlots = data.mealPlans[weekStart] ?? {};
        const filled = Object.values(slots).filter((s) => bySlug.has(s)).length;
        const ws = parseISODate(weekStart);
        const prevKey = toISODate(addDays(ws, -7));
        const hasPrev = Object.keys(data.mealPlans[prevKey] ?? {}).length > 0;

        const setSlot = (day: number, meal: MealKey, slug: string | null) => {
          const next = { ...slots };
          const k = `${day}:${meal}`;
          if (slug) next[k] = slug;
          else delete next[k];
          void saveMealPlan(weekStart, next);
        };

        const autofill = () => {
          const next = { ...slots };
          let n = 0;
          for (let d = 0; d < 7; d++)
            for (const m of MEALS) {
              const k = `${d}:${m.key}`;
              if (next[k]) continue;
              const pool = recipes.filter((r) => r.category === m.category);
              if (!pool.length) continue;
              const used = new Set(Object.values(next));
              const start = hashString(`${weekStart}${k}`) % pool.length;
              const pick = [...pool.slice(start), ...pool.slice(0, start)].find((r) => !used.has(r.slug)) ?? pool[start];
              next[k] = pick.slug;
              n++;
            }
          void saveMealPlan(weekStart, next);
          toast.success(n ? `${n} refeições sugeridas. Troque o que quiser!` : "Sua semana já está completa");
        };

        const generateList = async () => {
          const planned = Object.values(slots)
            .map((s) => bySlug.get(s))
            .filter((r): r is Recipe => Boolean(r));
          if (!planned.length) return toast("Planeje ao menos uma refeição para gerar a lista");
          const items = aggregateIngredients(planned).map((a) => ({
            item: a.item,
            qty: a.uses.map((u) => u.qty).join(" + "),
            source: `Cardápio de ${formatDateBR(weekStart)}`,
            section: a.section,
          }));
          const n = await addShopping(items);
          toast.success(n ? `${n} itens adicionados à lista de compras` : "Os itens já estavam na sua lista", {
            action: { label: "Abrir lista", onClick: () => router.push("/app/compras") },
          });
        };

        const exportPdf = async () => {
          setExporting(true);
          try {
            const res = await fetch("/api/cardapio/pdf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ weekStart, slots }),
            });
            if (!res.ok) throw new Error(await res.text());
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `cardapio-vida-leve-30-${weekStart}.pdf`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
          } catch (e) {
            console.error(e);
            toast.error("Não foi possível gerar o PDF agora. Tente novamente.");
          } finally {
            setExporting(false);
          }
        };

        const renderSlot = (day: number, meal: (typeof MEALS)[number]) => {
          const r = bySlug.get(slots[`${day}:${meal.key}`] ?? "");
          return r ? (
            <div className="group relative flex items-center gap-2.5 rounded-2xl border border-line bg-white p-2 shadow-soft">
              <Link href={`/app/receitas/${r.slug}`} className="size-12 shrink-0 overflow-hidden rounded-xl">
                <RecipeArt recipe={r} />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-bold text-muted uppercase">{meal.label}</p>
                <Link href={`/app/receitas/${r.slug}`} className="line-clamp-2 text-sm leading-snug font-bold hover:text-emerald">
                  {r.title}
                </Link>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button type="button" onClick={() => setPicker({ day, meal: meal.key })} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-mint hover:text-forest" aria-label={`Substituir ${meal.label}`}>
                  <RefreshCw className="size-4" />
                </button>
                <button type="button" onClick={() => setSlot(day, meal.key, null)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-danger" aria-label={`Remover ${meal.label}`}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPicker({ day, meal: meal.key })}
              className="flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 border-dashed border-emerald/25 bg-mint/30 p-3 text-left text-sm font-semibold text-forest/70 transition hover:border-emerald/60 hover:bg-mint/60"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-white text-emerald">
                <Plus className="size-5" />
              </span>
              {meal.label}
            </button>
          );
        };

        return (
          <>
            <PageHeader
              eyebrow="Planejador"
              title="Cardápio semanal"
              description="Organize suas refeições com receitas da biblioteca. É uma ferramenta educativa e de organização — não é uma dieta."
              actions={
                <>
                  <Button variant="outline" onClick={autofill}>
                    <Wand2 /> Sugerir semana
                  </Button>
                  <Button variant="secondary" onClick={generateList}>
                    <ShoppingBasket /> Gerar lista de compras
                  </Button>
                  <Button onClick={exportPdf} disabled={exporting}>
                    {exporting ? <Loader2 className="animate-spin" /> : <FileDown />} Exportar PDF
                  </Button>
                </>
              }
            />

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-white p-3 shadow-soft">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setWeekStart(toISODate(addDays(ws, -7)))} aria-label="Semana anterior">
                  <ChevronLeft />
                </Button>
                <div className="text-center">
                  <p className="text-xs font-bold text-muted uppercase">Semana</p>
                  <p className="font-bold">
                    {formatDateBR(ws)} – {formatDateBR(addDays(ws, 6))}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setWeekStart(toISODate(addDays(ws, 7)))} aria-label="Próxima semana">
                  <ChevronRight />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted">{filled}/28 refeições planejadas</span>
                {hasPrev && filled === 0 ? (
                  <Button variant="outline" size="sm" onClick={() => saveMealPlan(weekStart, { ...data.mealPlans[prevKey] })}>
                    <Copy /> Copiar semana anterior
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Mobile: um dia por vez */}
            <div className="lg:hidden">
              <div className="no-scrollbar -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Dias da semana">
                {WEEKDAYS_SHORT.map((d, i) => {
                  const count = MEALS.filter((m) => slots[`${i}:${m.key}`]).length;
                  return (
                    <button
                      key={d}
                      role="tab"
                      aria-selected={dayIdx === i}
                      onClick={() => setDayIdx(i)}
                      className={cn("flex min-w-14 flex-col items-center rounded-2xl px-2 py-2 transition", dayIdx === i ? "bg-forest text-white" : "bg-white text-ink shadow-soft")}
                    >
                      <span className="text-xs font-bold">{d}</span>
                      <span className="text-base font-extrabold">{addDays(ws, i).getDate()}</span>
                      <span className={cn("mt-0.5 text-[0.6rem] font-bold", dayIdx === i ? "text-gold" : "text-muted")}>{count}/4</span>
                    </button>
                  );
                })}
              </div>
              <h2 className="mb-3 font-bold">{WEEKDAYS_LONG[dayIdx]}</h2>
              <div className="space-y-2.5">
                {MEALS.map((m) => (
                  <div key={m.key}>{renderSlot(dayIdx, m)}</div>
                ))}
              </div>
            </div>

            {/* Desktop: grade completa */}
            <div className="hidden gap-3 lg:grid lg:grid-cols-7">
              {WEEKDAYS_SHORT.map((d, i) => (
                <div key={d} className="space-y-2">
                  <div className="rounded-2xl bg-forest/5 px-3 py-2 text-center">
                    <p className="text-xs font-bold text-muted uppercase">{d}</p>
                    <p className="font-extrabold">{addDays(ws, i).getDate()}</p>
                  </div>
                  {MEALS.map((m) => (
                    <div key={m.key}>{renderSlot(i, m)}</div>
                  ))}
                </div>
              ))}
            </div>

            <p className="mt-6 flex gap-2 rounded-2xl border border-line bg-white p-4 text-xs text-muted">
              <Info className="size-4 shrink-0 text-emerald" />
              Este planejador não define calorias, porções individualizadas ou restrições. Para necessidades específicas de saúde, procure um nutricionista.
            </p>

            <RecipePicker
              open={picker !== null}
              onOpenChange={(o) => !o && setPicker(null)}
              recipes={recipes}
              defaultCategory={MEALS.find((m) => m.key === picker?.meal)?.category ?? "almoco"}
              title={picker ? `${MEALS.find((m) => m.key === picker.meal)?.label} · ${WEEKDAYS_LONG[picker.day]}` : ""}
              onPick={(slug) => {
                if (picker) setSlot(picker.day, picker.meal, slug);
                setPicker(null);
              }}
            />
          </>
        );
      }}
    </DataGate>
  );
}

function RecipePicker({
  open,
  onOpenChange,
  recipes,
  defaultCategory,
  title,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  recipes: Recipe[];
  defaultCategory: RecipeCategory;
  title: string;
  onPick: (slug: string) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<RecipeCategory | "all" | null>(null);
  const active = cat ?? defaultCategory;
  const list = recipes.filter(
    (r) => (active === "all" || r.category === active) && (!q || normalize(`${r.title} ${r.keyIngredients.join(" ")}`).includes(normalize(q))),
  );
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setQ("");
          setCat(null);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent title="Escolher receita" description={title} side="bottom">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar receita ou ingrediente" className="pl-12" aria-label="Buscar receita" />
        </div>
        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          {[{ id: "all" as const, short: "Todas" }, ...RECIPE_CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={active === c.id}
              onClick={() => setCat(c.id)}
              className={cn("h-9 shrink-0 rounded-full border px-3 text-xs font-semibold", active === c.id ? "border-forest bg-forest text-white" : "border-line")}
            >
              {c.short}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {list.map((r) => (
            <li key={r.slug}>
              <button type="button" onClick={() => onPick(r.slug)} className="flex w-full items-center gap-3 rounded-2xl border border-line p-2 text-left transition hover:border-emerald hover:bg-mint/40">
                <span className="size-12 shrink-0 overflow-hidden rounded-xl">
                  <RecipeArt recipe={r} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{r.title}</span>
                  <span className="text-xs text-muted">{r.prepMinutes} min</span>
                </span>
              </button>
            </li>
          ))}
          {!list.length && <li className="py-6 text-center text-sm text-muted">Nenhuma receita encontrada.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
