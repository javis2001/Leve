import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminTitle, Table } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { getRecipes } from "@/lib/content/server";
import { RECIPE_CATEGORIES } from "@/lib/content/types";

export default async function RecipesAdmin() {
  const recipes = await getRecipes();
  return (
    <>
      <AdminTitle
        title="Receitas"
        description={`${recipes.length} receitas publicadas. Edições substituem o conteúdo padrão.`}
        actions={<Button asChild><Link href="/admin/receitas/nova"><Plus /> Nova receita</Link></Button>}
      />
      <Table head={["Receita", "Categoria", "Tempo", "Foto", ""]}>
        {recipes.map((r) => (
          <tr key={r.slug}>
            <td className="px-3 py-2 font-semibold">{r.title}</td>
            <td className="px-3 py-2">{RECIPE_CATEGORIES.find((c) => c.id === r.category)?.short}</td>
            <td className="px-3 py-2">{r.prepMinutes} min</td>
            <td className="px-3 py-2">{r.imageUrl ? "Sim" : "Ilustração"}</td>
            <td className="px-3 py-2 text-right"><Link className="font-semibold text-emerald" href={`/admin/receitas/${r.slug}`}>Editar</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
