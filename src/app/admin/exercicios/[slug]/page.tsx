import Link from "next/link";
import { notFound } from "next/navigation";
import { saveExercise } from "../../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminTitle } from "@/components/admin/ui";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { getExercises } from "@/lib/content/server";
import { EXERCISE_CATEGORIES, type Exercise } from "@/lib/content/types";

const POSES = ["standing", "standing-arms-up", "standing-side", "walking", "squat", "wall-push", "seated", "seated-arms-up", "seated-leg", "lying", "lying-bridge", "all-fours", "breathing"];

export default async function EditExercise({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === "novo";
  const e: Partial<Exercise> = isNew ? {} : ((await getExercises()).find((x) => x.slug === slug) ?? notFound());
  return (
    <>
      <Link href="/admin/exercicios" className="text-sm font-semibold text-muted">← Exercícios</Link>
      <AdminTitle title={isNew ? "Novo exercício" : `Editar: ${e.name}`} />
      <ActionForm action={saveExercise} className="max-w-3xl space-y-4 rounded-2xl border border-line bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="name">Nome</Label><Input id="name" name="name" defaultValue={e.name} required /></div>
          <div><Label htmlFor="slug">Identificador</Label><Input id="slug" name="slug" defaultValue={e.slug} readOnly={!isNew} required /></div>
          <div><Label htmlFor="category">Categoria</Label><Select id="category" name="category" defaultValue={e.category}>{EXERCISE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</Select></div>
          <div><Label htmlFor="level">Nível</Label><Select id="level" name="level" defaultValue={e.level}><option>Muito leve</option><option>Leve</option><option>Leve a moderado</option></Select></div>
          <div><Label htmlFor="duration">Duração sugerida</Label><Input id="duration" name="duration" defaultValue={e.duration} required /></div>
          <div><Label htmlFor="pose">Ilustração</Label><Select id="pose" name="pose" defaultValue={e.pose ?? "standing"}>{POSES.map((p) => <option key={p}>{p}</option>)}</Select></div>
        </div>
        <div><Label htmlFor="summary">Resumo</Label><Textarea id="summary" name="summary" rows={2} defaultValue={e.summary} required /></div>
        <div><Label htmlFor="steps">Passo a passo (um por linha)</Label><Textarea id="steps" name="steps" rows={6} defaultValue={e.steps?.join("\n")} required /></div>
        <div><Label htmlFor="adaptations">Adaptações (uma por linha)</Label><Textarea id="adaptations" name="adaptations" rows={3} defaultValue={e.adaptations?.join("\n")} required /></div>
        <div><Label htmlFor="safety">Cuidados de segurança (um por linha)</Label><Textarea id="safety" name="safety" rows={3} defaultValue={e.safety?.join("\n")} required /></div>
        <div>
          <Label htmlFor="videoUrl">Vídeo demonstrativo (opcional)</Label>
          <Input id="videoUrl" name="videoUrl" type="url" defaultValue={e.videoUrl ?? ""} placeholder="https://… (arquivo .mp4 licenciado)" />
          <p className="mt-1 text-xs text-muted">Use somente vídeos com licença de uso e conteúdo validado por profissional.</p>
        </div>
        <div>
          <Label htmlFor="imageUrl">Imagem própria (opcional)</Label>
          <Input id="imageUrl" name="imageUrl" type="url" defaultValue={e.imageUrl ?? ""} placeholder="https://… (envie em Imagens e cole a URL aqui)" />
          <p className="mt-1 text-xs text-muted">Se preenchida, substitui a ilustração 3D padrão. Use apenas imagens suas ou licenciadas.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked className="size-4 accent-emerald" /> Publicado</label>
      </ActionForm>
    </>
  );
}
