"use client";
import { useState } from "react";
import { toast } from "sonner";
import { BatteryMedium, ChevronLeft, ChevronRight, Lock, Moon, NotebookPen, Smile, Trash2 } from "lucide-react";
import { WellbeingLines } from "@/components/app/charts";
import { DataGate } from "@/components/app/data-gate";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label, Textarea } from "@/components/ui/input";
import { useUserData } from "@/lib/data/provider";
import type { JournalEntry, UserData } from "@/lib/data/types";
import { WEEKDAYS_SHORT, addDays, cn, formatDateBR, parseISODate, startOfWeek, toISODate } from "@/lib/utils";

const SCALES = [
  { key: "mood", label: "Humor", icon: Smile, options: ["Muito baixo", "Baixo", "Neutro", "Bom", "Ótimo"], emoji: ["😞", "😕", "😐", "🙂", "😄"] },
  { key: "energy", label: "Energia", icon: BatteryMedium, options: ["Muito baixa", "Baixa", "Média", "Boa", "Alta"], emoji: ["🪫", "😪", "🙂", "💪", "⚡"] },
  { key: "sleep", label: "Qualidade do sono", icon: Moon, options: ["Muito ruim", "Ruim", "Regular", "Boa", "Ótima"], emoji: ["😩", "🥱", "😌", "😴", "🌙"] },
] as const;

const empty = (date: string): JournalEntry => ({ date, mood: null, energy: null, sleep: null, reflection: "", wins: "", notes: "" });

export function weekSeries(data: UserData, weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const iso = toISODate(addDays(weekStart, i));
    const e = data.journal[iso];
    return { label: WEEKDAYS_SHORT[i], humor: e?.mood ?? null, energia: e?.energy ?? null, sono: e?.sleep ?? null };
  });
}

export function JournalView() {
  const [date, setDate] = useState(toISODate());
  return (
    <DataGate>
      {(data) => <JournalInner key={date} data={data} date={date} setDate={setDate} />}
    </DataGate>
  );
}

function JournalInner({ data, date, setDate }: { data: UserData; date: string; setDate: (d: string) => void }) {
  const { saveJournal, deleteJournal } = useUserData();
  const [entry, setEntry] = useState<JournalEntry>(data.journal[date] ?? empty(date));
  const [weekOffset, setWeekOffset] = useState(0);
  const today = toISODate();
  const d = parseISODate(date);
  const entries = Object.values(data.journal).sort((a, b) => b.date.localeCompare(a.date));
  const ws = addDays(startOfWeek(), weekOffset * 7);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveJournal({ ...entry, reflection: entry.reflection.slice(0, 2000), wins: entry.wins.slice(0, 1000), notes: entry.notes.slice(0, 2000) });
    toast.success("Registro salvo no seu diário");
  };

  return (
    <>
      <PageHeader
        eyebrow="Autocuidado"
        title="Diário de bem-estar"
        description={
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-4 text-emerald" /> Privado: só você tem acesso a estes registros.
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardContent>
            <div className="mb-5 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setDate(toISODate(addDays(d, -1)))} aria-label="Dia anterior">
                <ChevronLeft />
              </Button>
              <p className="font-bold first-letter:uppercase">{date === today ? "Hoje" : d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
              <Button variant="ghost" size="icon" disabled={date >= today} onClick={() => setDate(toISODate(addDays(d, 1)))} aria-label="Próximo dia">
                <ChevronRight />
              </Button>
            </div>
            <form onSubmit={save} className="space-y-5">
              {SCALES.map((s) => (
                <fieldset key={s.key}>
                  <legend className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <s.icon className="size-4 text-emerald" /> {s.label}
                  </legend>
                  <div className="grid grid-cols-5 gap-1.5">
                    {s.options.map((o, i) => {
                      const v = i + 1;
                      const on = entry[s.key] === v;
                      return (
                        <button
                          key={o}
                          type="button"
                          aria-pressed={on}
                          aria-label={`${s.label}: ${o}`}
                          onClick={() => setEntry({ ...entry, [s.key]: on ? null : v })}
                          className={cn("flex flex-col items-center gap-1 rounded-2xl border py-2 transition", on ? "border-emerald bg-mint" : "border-line hover:border-emerald/40")}
                        >
                          <span className="text-2xl" aria-hidden>{s.emoji[i]}</span>
                          <span className="text-[0.6rem] leading-tight font-semibold text-muted">{o}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              <div>
                <Label htmlFor="wins">Pequenas conquistas de hoje</Label>
                <Textarea id="wins" rows={2} maxLength={1000} value={entry.wins} onChange={(e) => setEntry({ ...entry, wins: e.target.value })} placeholder="Ex.: caminhei 10 minutos, preparei meu almoço…" />
              </div>
              <div>
                <Label htmlFor="reflection">Reflexões</Label>
                <Textarea id="reflection" rows={3} maxLength={2000} value={entry.reflection} onChange={(e) => setEntry({ ...entry, reflection: e.target.value })} placeholder="Como você se sentiu hoje? O que aprendeu?" />
              </div>
              <div>
                <Label htmlFor="notes">Observações pessoais</Label>
                <Textarea id="notes" rows={2} maxLength={2000} value={entry.notes} onChange={(e) => setEntry({ ...entry, notes: e.target.value })} placeholder="Algo que queira lembrar" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Salvar registro</Button>
                {data.journal[date] ? (
                  <Button type="button" variant="ghost" onClick={() => confirm("Apagar o registro deste dia?") && (deleteJournal(date), setEntry(empty(date)))} aria-label="Apagar registro">
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Sua semana</h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Semana anterior"><ChevronLeft /></Button>
                  <span className="text-xs font-semibold text-muted">{formatDateBR(ws)}</span>
                  <Button variant="ghost" size="sm" disabled={weekOffset >= 0} onClick={() => setWeekOffset((w) => w + 1)} aria-label="Próxima semana"><ChevronRight /></Button>
                </div>
              </div>
              <WellbeingLines data={weekSeries(data, ws)} label="Humor, energia e sono na semana (1 a 5)" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h2 className="mb-3 font-bold">Registros anteriores</h2>
              {entries.length ? (
                <ul className="max-h-96 space-y-2 overflow-y-auto">
                  {entries.slice(0, 30).map((e) => (
                    <li key={e.date}>
                      <button type="button" onClick={() => setDate(e.date)} className={cn("w-full rounded-2xl border p-3 text-left transition hover:border-emerald/40", e.date === date ? "border-emerald bg-mint/50" : "border-line")}>
                        <span className="flex items-center justify-between text-sm font-bold">
                          {formatDateBR(e.date, { weekday: "short", day: "2-digit", month: "short" })}
                          <span aria-hidden>{e.mood ? SCALES[0].emoji[e.mood - 1] : ""}</span>
                        </span>
                        {e.wins || e.reflection ? <span className="mt-1 line-clamp-2 block text-xs text-muted">{e.wins || e.reflection}</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={NotebookPen} title="Seu primeiro registro">Escreva algumas linhas sobre o seu dia. Sem regras.</EmptyState>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <p className="mt-5 text-xs text-muted">
        O diário é um espaço de autoconhecimento e não substitui acompanhamento profissional. Se estiver passando por um momento difícil, procure apoio — o CVV atende
        gratuitamente pelo telefone 188, 24 horas.
      </p>
    </>
  );
}
