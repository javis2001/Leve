"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Check, ChefHat, Clock, Heart, Info, Repeat, ShoppingBasket, Users } from "lucide-react";
import { FadeIn } from "@/components/app/motion";
import { RecipeArt } from "@/components/brand/recipe-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sectionFor } from "@/lib/content/shopping";
import { ALLERGEN_LABELS, RECIPE_CATEGORIES, type Recipe } from "@/lib/content/types";
import { useUserData } from "@/lib/data/provider";
import { cn } from "@/lib/utils";

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const { data, toggleFavorite, addShopping } = useUserData();
  const router = useRouter();
  const fav = data?.favorites.includes(recipe.slug) ?? false;
  const [selected, setSelected] = useState<Set<number>>(() => new Set(recipe.ingredients.map((_, i) => i).filter((i) => !/^(água|sal)/i.test(recipe.ingredients[i].item))));
  const [done, setDone] = useState<Set<number>>(new Set());
  const cat = RECIPE_CATEGORIES.find((c) => c.id === recipe.category)?.short;

  const addToList = async () => {
    const items = recipe.ingredients
      .filter((_, i) => selected.has(i))
      .map((ing) => ({ item: ing.item, qty: ing.qty, source: recipe.title, section: sectionFor(ing.item) }));
    const n = await addShopping(items);
    if (n) toast.success(`${n} ${n === 1 ? "item adicionado" : "itens adicionados"} à lista de compras`, { action: { label: "Ver lista", onClick: () => router.push("/app/compras") } });
    else toast("Esses itens já estão na sua lista de compras");
  };

  return (
    <article className="mx-auto max-w-4xl">
      <Link href="/app/receitas" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-forest">
        <ArrowLeft className="size-4" /> Receitas
      </Link>

      <FadeIn>
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft md:grid md:grid-cols-[1.1fr_1fr]">
          <div className="aspect-[4/3] md:aspect-auto md:min-h-80">
            <RecipeArt recipe={recipe} />
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[0.14em] text-emerald uppercase">{cat}</p>
            <h1 className="mt-1 font-display text-3xl leading-tight font-semibold text-forest sm:text-4xl">{recipe.title}</h1>
            <p className="mt-3 text-ink/80">{recipe.summary}</p>
            <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: Clock, label: "Preparo", value: `${recipe.prepMinutes} min` },
                { icon: Users, label: "Rendimento", value: recipe.servings },
                { icon: ChefHat, label: "Dificuldade", value: recipe.difficulty },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-mint/60 p-2.5">
                  <s.icon className="mx-auto size-4 text-emerald" />
                  <dt className="mt-1 text-[0.65rem] font-bold text-muted uppercase">{s.label}</dt>
                  <dd className="text-xs font-bold leading-tight sm:text-sm">{s.value}</dd>
                </div>
              ))}
            </dl>
            {recipe.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {recipe.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}
            <div className="mt-auto flex gap-2 pt-6">
              <Button variant={fav ? "secondary" : "outline"} onClick={() => toggleFavorite(recipe.slug)} aria-pressed={fav} className="flex-1">
                <Heart className={cn(fav && "fill-coral text-coral")} /> {fav ? "Favorita" : "Favoritar"}
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/app/cardapio">Planejar</Link>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.25fr]">
        <FadeIn delay={0.05}>
          <Card>
            <CardContent>
              <h2 className="text-lg font-bold">Ingredientes</h2>
              <p className="mt-1 text-xs text-muted">Desmarque o que você já tem em casa antes de enviar para a lista.</p>
              <ul className="mt-4 space-y-1.5">
                {recipe.ingredients.map((ing, i) => {
                  const on = selected.has(i);
                  return (
                    <li key={i}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-mint/40">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => {
                            const n = new Set(selected);
                            if (on) n.delete(i);
                            else n.add(i);
                            setSelected(n);
                          }}
                          className="mt-0.5 size-5 shrink-0 accent-emerald"
                        />
                        <span className="text-[0.95rem]">
                          <strong className="font-bold">{ing.qty}</strong> {ing.item}
                          {ing.note ? <span className="text-muted"> ({ing.note})</span> : null}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <Button className="mt-4 w-full" onClick={addToList} disabled={selected.size === 0}>
                <ShoppingBasket /> Adicionar à lista de compras
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardContent>
              <h2 className="text-lg font-bold">Modo de preparo</h2>
              <ol className="mt-4 space-y-3">
                {recipe.steps.map((s, i) => {
                  const on = done.has(i);
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          const n = new Set(done);
                          if (on) n.delete(i);
                          else n.add(i);
                          setDone(n);
                        }}
                        aria-pressed={on}
                        className="flex w-full gap-3 text-left"
                      >
                        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold", on ? "bg-emerald text-white" : "bg-mint text-forest")}>
                          {on ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                        </span>
                        <span className={cn("pt-1 leading-relaxed", on && "text-muted line-through decoration-emerald/40")}>{s}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Repeat className="size-5 text-emerald" /> Substituições
            </h2>
            <ul className="mt-3 space-y-2 text-ink/85">
              {recipe.substitutions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="size-5 text-gold-deep" /> Possíveis alergênicos
            </h2>
            {recipe.allergens.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {recipe.allergens.map((a) => (
                  <Badge key={a} variant="gold">
                    {ALLERGEN_LABELS[a]}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink/85">Nenhum dos principais alergênicos nos ingredientes listados.</p>
            )}
            {recipe.allergenNotes ? <p className="mt-3 text-sm text-ink/80">{recipe.allergenNotes}</p> : null}
            <p className="mt-3 text-xs text-muted">Sempre confira os rótulos dos produtos industrializados: a composição pode variar entre marcas.</p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-5 flex gap-2 rounded-2xl border border-line bg-white p-4 text-xs text-muted">
        <Info className="size-4 shrink-0 text-emerald" />
        Informações nutricionais não são exibidas porque ainda não foram calculadas com uma base de dados validada e metodologia documentada. As receitas
        têm caráter educativo e não substituem orientação de nutricionista.
      </p>
    </article>
  );
}
