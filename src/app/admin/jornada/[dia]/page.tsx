import Link from "next/link";
import { notFound } from "next/navigation";
import { saveDay } from "../../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminTitle } from "@/components/admin/ui";
import { Input, Label, Textarea } from "@/components/ui/input";
import { getJourneyDay } from "@/lib/content/server";

export default async function EditDay({ params }: { params: Promise<{ dia: string }> }) {
  const n = Number((await params).dia);
  const d = Number.isInteger(n) ? await getJourneyDay(n) : null;
  if (!d) notFound();
  return (
    <>
      <Link href="/admin/jornada" className="text-sm font-semibold text-muted">← Jornada</Link>
      <AdminTitle title={`Dia ${d.day}: ${d.title}`} />
      <ActionForm action={saveDay} className="max-w-3xl space-y-4 rounded-2xl border border-line bg-white p-5">
        <input type="hidden" name="day" value={d.day} />
        <div><Label htmlFor="title">Título</Label><Input id="title" name="title" defaultValue={d.title} required /></div>
        <div><Label htmlFor="objective">Objetivo</Label><Textarea id="objective" name="objective" rows={2} defaultValue={d.objective} required /></div>
        <div><Label htmlFor="education">Explicação educativa (parágrafos separados por linha em branco)</Label><Textarea id="education" name="education" rows={8} defaultValue={d.education.join("\n\n")} required /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
          <div><Label htmlFor="activityTitle">Atividade</Label><Input id="activityTitle" name="activityTitle" defaultValue={d.activity.title} required /></div>
          <div><Label htmlFor="activityMinutes">Minutos</Label><Input id="activityMinutes" name="activityMinutes" type="number" defaultValue={d.activity.minutes} required /></div>
        </div>
        <div><Label htmlFor="activityDescription">Descrição da atividade</Label><Textarea id="activityDescription" name="activityDescription" rows={2} defaultValue={d.activity.description} required /></div>
        <div><Label htmlFor="exerciseSlugs">Exercícios (identificadores separados por vírgula)</Label><Input id="exerciseSlugs" name="exerciseSlugs" defaultValue={d.activity.exerciseSlugs.join(", ")} /></div>
        <div><Label htmlFor="adaptation">Adaptação</Label><Input id="adaptation" name="adaptation" defaultValue={d.activity.adaptation} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="foodText">Sugestão de alimentação</Label><Textarea id="foodText" name="foodText" rows={2} defaultValue={d.food.text} required /></div>
          <div><Label htmlFor="recipeSlug">Receita vinculada (identificador)</Label><Input id="recipeSlug" name="recipeSlug" defaultValue={d.food.recipeSlug} /></div>
        </div>
        <div><Label htmlFor="habit">Hábito do dia</Label><Input id="habit" name="habit" defaultValue={d.habit} required /></div>
        <div><Label htmlFor="motivation">Mensagem motivacional</Label><Input id="motivation" name="motivation" defaultValue={d.motivation} required /></div>
        <div><Label htmlFor="checklist">Checklist (um item por linha)</Label><Textarea id="checklist" name="checklist" rows={4} defaultValue={d.checklist.join("\n")} required /></div>
      </ActionForm>
    </>
  );
}
