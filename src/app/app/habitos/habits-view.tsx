"use client";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarHeart, ChevronLeft, ChevronRight, Flame, Pencil, Percent, Plus, Settings2, Sprout, Trash2 } from "lucide-react";
import { PercentBars } from "@/components/app/charts";
import { DataGate } from "@/components/app/data-gate";
import { HabitCalendar } from "@/components/app/habit-calendar";
import { HabitToday } from "@/components/app/habit-today";
import { PageHeader } from "@/components/app/page-header";
import { DynIcon } from "@/components/brand/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { HABIT_ICONS } from "@/lib/content/habits";
import { useUserData } from "@/lib/data/provider";
import { habitStats, weeklyEvolution } from "@/lib/data/stats";
import type { Habit } from "@/lib/data/types";
import { addDays, cn, toISODate } from "@/lib/utils";

export function HabitsView() {
  const [offset, setOffset] = useState(0);
  const [manage, setManage] = useState(false);
  return (
    <DataGate>
      {(data) => {
        const date = addDays(new Date(), -offset);
        const iso = toISODate(date);
        const s = habitStats(data);
        const stats = [
          { icon: CalendarHeart, label: "Dias ativos", value: s.activeDays, hint: "no total" },
          { icon: Flame, label: "Sequência atual", value: s.current, hint: s.current ? "dias seguidos" : "Hoje é um ótimo dia para começar" },
          { icon: Sprout, label: "Melhor sequência", value: s.best, hint: "dias seguidos" },
          { icon: Percent, label: "Últimos 7 dias", value: `${s.percent7}%`, hint: "dos hábitos marcados" },
        ];
        return (
          <>
            <PageHeader
              eyebrow="Rastreador"
              title="Seus hábitos"
              description="Marque o que você fez. Dias sem registro não apagam nada — cada marcação é uma vitória."
              actions={
                <Button variant="outline" onClick={() => setManage(true)}>
                  <Settings2 /> Personalizar hábitos
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
              <Card>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <Button variant="ghost" size="icon" disabled={offset >= 6} onClick={() => setOffset((o) => o + 1)} aria-label="Dia anterior">
                      <ChevronLeft />
                    </Button>
                    <div className="text-center">
                      <p className="text-xs font-bold text-muted uppercase">{offset === 0 ? "Hoje" : offset === 1 ? "Ontem" : "Registro anterior"}</p>
                      <p className="font-bold first-letter:uppercase">{date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
                    </div>
                    <Button variant="ghost" size="icon" disabled={offset === 0} onClick={() => setOffset((o) => o - 1)} aria-label="Próximo dia">
                      <ChevronRight />
                    </Button>
                  </div>
                  <HabitToday data={data} date={iso} compact />
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((st) => (
                  <div key={st.label} className="rounded-3xl border border-line bg-white p-4 shadow-soft">
                    <st.icon className="size-5 text-emerald" />
                    <p className="mt-2 text-3xl font-extrabold text-forest">{st.value}</p>
                    <p className="text-sm font-bold">{st.label}</p>
                    <p className="text-xs text-muted">{st.hint}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <CardContent>
                  <h2 className="mb-1 font-bold">Evolução semanal</h2>
                  <p className="mb-4 text-xs text-muted">Percentual de hábitos marcados por semana (início na segunda-feira)</p>
                  <PercentBars data={weeklyEvolution(data)} label="Percentual de hábitos concluídos por semana" />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h2 className="mb-4 font-bold">Calendário de conclusão</h2>
                  <HabitCalendar data={data} />
                </CardContent>
              </Card>
            </div>
            <ManageHabits open={manage} onOpenChange={setManage} habits={data.habits} />
          </>
        );
      }}
    </DataGate>
  );
}

function ManageHabits({ open, onOpenChange, habits }: { open: boolean; onOpenChange: (o: boolean) => void; habits: Habit[] }) {
  const { upsertHabit, deleteHabit } = useUserData();
  const [editing, setEditing] = useState<Partial<Habit> | null>(null);
  const sorted = [...habits].sort((a, b) => a.position - b.position);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const label = (editing.label ?? "").trim().slice(0, 60);
    if (!label) return toast.error("Dê um nome ao hábito");
    await upsertHabit({
      id: editing.id,
      label,
      goal: (editing.goal ?? "").trim().slice(0, 160) || null,
      icon: editing.icon ?? "Heart",
      position: editing.position ?? habits.length,
      active: editing.active ?? true,
    });
    setEditing(null);
    toast.success("Hábito salvo");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (onOpenChange(o), !o && setEditing(null))}>
      <DialogContent title="Personalizar hábitos" description="Mantenha entre 3 e 5 hábitos ativos para acompanhar com leveza." side="bottom">
        {editing ? (
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label htmlFor="h-label">Nome</Label>
              <Input id="h-label" value={editing.label ?? ""} onChange={(e) => setEditing({ ...editing, label: e.target.value })} maxLength={60} required autoFocus />
            </div>
            <div>
              <Label htmlFor="h-goal">Objetivo (opcional)</Label>
              <Input id="h-goal" value={editing.goal ?? ""} onChange={(e) => setEditing({ ...editing, goal: e.target.value })} maxLength={160} placeholder="Ex.: ler 10 páginas antes de dormir" />
            </div>
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">Ícone</legend>
              <div className="flex flex-wrap gap-2">
                {HABIT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setEditing({ ...editing, icon: ic })}
                    aria-pressed={editing.icon === ic}
                    aria-label={ic}
                    className={cn("grid size-11 place-items-center rounded-xl border", editing.icon === ic ? "border-emerald bg-mint text-forest" : "border-line text-muted")}
                  >
                    <DynIcon name={ic} className="size-5" />
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Salvar
              </Button>
            </div>
          </form>
        ) : (
          <>
            <ul className="space-y-2">
              {sorted.map((h) => (
                <li key={h.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint text-emerald">
                    <DynIcon name={h.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{h.label}</span>
                    <span className="text-xs text-muted">{h.active ? "Ativo" : "Pausado"}</span>
                  </span>
                  <Switch checked={h.active} onCheckedChange={(v) => upsertHabit({ ...h, active: v })} aria-label={`${h.active ? "Pausar" : "Ativar"} ${h.label}`} />
                  <button type="button" onClick={() => setEditing(h)} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-mint" aria-label={`Editar ${h.label}`}>
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirm(`Excluir "${h.label}" e seus registros?`) && deleteHabit(h.id)}
                    className="grid size-9 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-danger"
                    aria-label={`Excluir ${h.label}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Button className="mt-4 w-full" variant="secondary" disabled={habits.length >= 10} onClick={() => setEditing({ icon: "Heart", active: true })}>
              <Plus /> Novo hábito
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
