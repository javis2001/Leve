import Link from "next/link";
import { AdminTitle, Table } from "@/components/admin/ui";
import { getJourneyDays } from "@/lib/content/server";

export default async function JourneyAdmin() {
  const days = await getJourneyDays();
  return (
    <>
      <AdminTitle title="Jornada de 30 dias" description="Edite o conteúdo de cada dia." />
      <Table head={["Dia", "Semana", "Título", "Atividade", ""]}>
        {days.map((d) => (
          <tr key={d.day}>
            <td className="px-3 py-2 font-bold">{d.day}</td>
            <td className="px-3 py-2">{d.week}</td>
            <td className="px-3 py-2 font-semibold">{d.title}</td>
            <td className="px-3 py-2 text-xs">{d.activity.title}</td>
            <td className="px-3 py-2 text-right"><Link className="font-semibold text-emerald" href={`/admin/jornada/${d.day}`}>Editar</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
