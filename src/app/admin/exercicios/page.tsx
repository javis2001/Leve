import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminTitle, Table } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { getExercises } from "@/lib/content/server";
import { EXERCISE_CATEGORIES } from "@/lib/content/types";

export default async function ExercisesAdmin() {
  const list = await getExercises();
  return (
    <>
      <AdminTitle title="Exercícios" description={`${list.length} exercícios publicados.`} actions={<Button asChild><Link href="/admin/exercicios/novo"><Plus /> Novo exercício</Link></Button>} />
      <Table head={["Exercício", "Categoria", "Nível", "Vídeo", ""]}>
        {list.map((e) => (
          <tr key={e.slug}>
            <td className="px-3 py-2 font-semibold">{e.name}</td>
            <td className="px-3 py-2">{EXERCISE_CATEGORIES.find((c) => c.id === e.category)?.label}</td>
            <td className="px-3 py-2">{e.level}</td>
            <td className="px-3 py-2">{e.videoUrl ? "Sim" : "Ilustração"}</td>
            <td className="px-3 py-2 text-right"><Link className="font-semibold text-emerald" href={`/admin/exercicios/${e.slug}`}>Editar</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
