"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, Plus, Printer, ShoppingBasket, Trash2 } from "lucide-react";
import { DataGate } from "@/components/app/data-gate";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SHOPPING_SECTIONS, sectionFor } from "@/lib/content/shopping";
import { useUserData } from "@/lib/data/provider";
import { cn } from "@/lib/utils";

export function ShoppingList() {
  const { addShopping, updateShopping, deleteShopping } = useUserData();
  const [text, setText] = useState("");
  const [hideChecked, setHideChecked] = useState(false);

  return (
    <DataGate>
      {(data) => {
        const items = data.shopping;
        const checked = items.filter((i) => i.checked);
        const sections = [...SHOPPING_SECTIONS, "Outros"].map((s) => ({
          name: s,
          items: items.filter((i) => (i.section ?? "Outros") === s && (!hideChecked || !i.checked)),
        }));
        const add = async (e: React.FormEvent) => {
          e.preventDefault();
          const v = text.trim().slice(0, 120);
          if (!v) return;
          await addShopping([{ item: v, qty: null, source: "Adicionado por você", section: sectionFor(v) }]);
          setText("");
        };
        return (
          <>
            <PageHeader
              eyebrow="Organização"
              title="Lista de compras"
              description={
                <>
                  Gerada a partir das receitas e do <Link href="/app/cardapio" className="font-semibold text-emerald underline-offset-2 hover:underline">cardápio semanal</Link>. Marque os itens enquanto compra.
                </>
              }
              actions={
                items.length ? (
                  <Button variant="outline" onClick={() => window.print()} className="no-print">
                    <Printer /> Imprimir
                  </Button>
                ) : null
              }
            />
            <form onSubmit={add} className="no-print mb-5 flex gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Adicionar item (ex.: sabão em pó)" aria-label="Novo item" maxLength={120} />
              <Button type="submit" size="icon" aria-label="Adicionar item">
                <Plus />
              </Button>
            </form>

            {items.length === 0 ? (
              <EmptyState icon={ShoppingBasket} title="Sua lista está vazia">
                Abra uma receita e toque em “Adicionar à lista de compras” ou gere a lista pelo cardápio semanal.
              </EmptyState>
            ) : (
              <>
                <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-muted">
                    {checked.length} de {items.length} itens no carrinho
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setHideChecked((v) => !v)}>
                      {hideChecked ? "Mostrar marcados" : "Ocultar marcados"}
                    </Button>
                    {checked.length ? (
                      <Button variant="ghost" size="sm" onClick={() => deleteShopping(checked.map((i) => i.id))}>
                        <Trash2 /> Limpar marcados
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={() => confirm("Apagar toda a lista?") && deleteShopping(items.map((i) => i.id))}>
                      Apagar tudo
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {sections
                    .filter((s) => s.items.length)
                    .map((s) => (
                      <Card key={s.name}>
                        <CardContent>
                          <h2 className="mb-2 text-xs font-bold tracking-[0.14em] text-emerald uppercase">{s.name}</h2>
                          <ul className="divide-y divide-line">
                            {s.items.map((i) => (
                              <li key={i.id} className="flex items-start gap-3 py-2.5">
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={i.checked}
                                  aria-label={i.item}
                                  onClick={() => updateShopping(i.id, { checked: !i.checked })}
                                  className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2", i.checked ? "border-emerald bg-emerald text-white" : "border-line")}
                                >
                                  {i.checked && <Check className="size-3.5" strokeWidth={3} />}
                                </button>
                                <div className={cn("min-w-0 flex-1", i.checked && "opacity-50")}>
                                  <p className={cn("font-semibold", i.checked && "line-through")}>{i.item}</p>
                                  {i.qty || i.source ? (
                                    <p className="text-xs break-words text-muted">
                                      {i.qty}
                                      {i.qty && i.source ? " · " : ""}
                                      {i.source}
                                    </p>
                                  ) : null}
                                </div>
                                <button type="button" onClick={() => deleteShopping([i.id])} className="no-print grid size-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-danger" aria-label={`Remover ${i.item}`}>
                                  <Trash2 className="size-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </>
            )}
          </>
        );
      }}
    </DataGate>
  );
}
