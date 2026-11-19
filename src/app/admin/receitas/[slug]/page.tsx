import Link from "next/link";
import { notFound } from "next/navigation";
import { saveRecipe } from "../../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminTitle } from "@/components/admin/ui";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { getRecipe } from "@/lib/content/server";
import { ALLERGEN_LABELS, RECIPE_CATEGORIES, type Recipe } from "@/lib/content/types";

export default async function EditRecipe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === "nova";
  const r: Partial<Recipe> = isNew ? { allergens: [], ingredients: [], steps: [], substitutions: [], keyIngredients: [], tags: [] } : ((await getRecipe(slug)) ?? notFound());
  return (
    <>
      <Link href="/admin/receitas" className="text-sm font-semibold text-muted">← Receitas</Link>
      <AdminTitle title={isNew ? "Nova receita" : `Editar: ${r.title}`} />
      <ActionForm action={saveRecipe} className="max-w-3xl space-y-4 rounded-2xl border border-line bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="title">Nome</Label><Input id="title" name="title" defaultValue={r.title} required /></div>
          <div><Label htmlFor="slug">Identificador (URL)</Label><Input id="slug" name="slug" defaultValue={r.slug} readOnly={!isNew} required pattern="[a-z0-9-]+" /></div>
          <div><Label htmlFor="category">Categoria</Label><Select id="category" name="category" defaultValue={r.category}>{RECIPE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.short}</option>)}</Select></div>
          <div><Label htmlFor="difficulty">Dificuldade</Label><Select id="difficulty" name="difficulty" defaultValue={r.difficulty ?? "Fácil"}><option>Fácil</option><option>Média</option></Select></div>
          <div><Label htmlFor="servings">Rendimento</Label><Input id="servings" name="servings" defaultValue={r.servings} required /></div>
          <div><Label htmlFor="prepMinutes">Tempo de preparo (min)</Label><Input id="prepMinutes" name="prepMinutes" type="number" min={1} defaultValue={r.prepMinutes} required /></div>
        </div>
        <div><Label htmlFor="summary">Resumo</Label><Textarea id="summary" name="summary" rows={2} defaultValue={r.summary} required /></div>
        <div>
          <Label htmlFor="ingredients">Ingredientes (um por linha: quantidade | ingrediente | observação)</Label>
          <Textarea id="ingredients" name="ingredients" rows={8} defaultValue={r.ingredients?.map((i) => [i.qty, i.item, i.note].filter(Boolean).join(" | ")).join("\n")} required />
        </div>
        <div><Label htmlFor="steps">Modo de preparo (um passo por linha)</Label><Textarea id="steps" name="steps" rows={7} defaultValue={r.steps?.join("\n")} required /></div>
        <div><Label htmlFor="substitutions">Substituições (uma por linha)</Label><Textarea id="substitutions" name="substitutions" rows={3} defaultValue={r.substitutions?.join("\n")} /></div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Alergênicos</legend>
          <div className="flex flex-wrap gap-3">
            {Object.entries(ALLERGEN_LABELS).map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" name="allergens" value={k} defaultChecked={r.allergens?.includes(k as never)} className="size-4 accent-emerald" /> {l}</label>
            ))}
          </div>
        </fieldset>
        <div><Label htmlFor="allergenNotes">Observações sobre alergênicos</Label><Input id="allergenNotes" name="allergenNotes" defaultValue={r.allergenNotes} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="keyIngredients">Ingredientes principais (separados por vírgula)</Label><Input id="keyIngredients" name="keyIngredients" defaultValue={r.keyIngredients?.join(", ")} /></div>
          <div><Label htmlFor="tags">Etiquetas (separadas por vírgula)</Label><Input id="tags" name="tags" defaultValue={r.tags?.join(", ")} /></div>
        </div>
        <div><Label htmlFor="imageUrl">URL da foto (envie em Imagens e cole aqui)</Label><Input id="imageUrl" name="imageUrl" type="url" defaultValue={r.imageUrl ?? ""} placeholder="https://..." /></div>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked className="size-4 accent-emerald" /> Publicada</label>
      </ActionForm>
    </>
  );
}
