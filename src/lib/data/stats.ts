import { ACHIEVEMENTS, type AchievementInput } from "@/lib/content/achievements";
import { addDays, formatDateBR, parseISODate, startOfWeek, toISODate } from "@/lib/utils";
import type { UserData } from "./types";

export function completedDayNumbers(d: UserData) {
  return Object.entries(d.days)
    .filter(([, p]) => p.completedAt)
    .map(([k]) => Number(k))
    .sort((a, b) => a - b);
}

/** Próximo dia a fazer: o primeiro dia ainda não concluído. */
export function currentDay(d: UserData) {
  for (let i = 1; i <= 30; i++) if (!d.days[i]?.completedAt) return i;
  return 30;
}

export function journeyPercent(d: UserData) {
  return Math.round((completedDayNumbers(d).length / 30) * 100);
}

export function activeHabits(d: UserData) {
  return d.habits.filter((h) => h.active).sort((a, b) => a.position - b.position);
}

export function habitDoneOn(d: UserData, date: string) {
  const active = new Set(activeHabits(d).map((h) => h.id));
  return (d.habitLogs[date] ?? []).filter((id) => active.has(id)).length;
}

export function habitStats(d: UserData, today = new Date()) {
  const dates = Object.keys(d.habitLogs)
    .filter((k) => (d.habitLogs[k] ?? []).length > 0)
    .sort();
  const set = new Set(dates);

  // Sequência atual: termina hoje ou ontem (hoje ainda pode estar em andamento).
  let current = 0;
  let cursor = set.has(toISODate(today)) ? today : addDays(today, -1);
  while (set.has(toISODate(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const s of dates) {
    const dt = parseISODate(s);
    run = prev && toISODate(addDays(prev, 1)) === s ? run + 1 : 1;
    best = Math.max(best, run);
    prev = dt;
  }

  const total = activeHabits(d).length;
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = toISODate(addDays(startOfWeek(today), i));
    return { date, done: habitDoneOn(d, date), total };
  });
  const last7 = Array.from({ length: 7 }, (_, i) => toISODate(addDays(today, -6 + i)));
  const done7 = last7.reduce((acc, dt) => acc + habitDoneOn(d, dt), 0);
  const percent7 = total ? Math.round((done7 / (total * 7)) * 100) : 0;

  const totalChecks = Object.values(d.habitLogs).reduce((a, l) => a + l.length, 0);
  return { activeDays: dates.length, current, best, week, percent7, totalChecks };
}

export function achievementInput(d: UserData): AchievementInput {
  const hs = habitStats(d);
  const slots = Object.values(d.mealPlans).reduce((a, s) => a + Object.values(s).filter(Boolean).length, 0);
  return {
    completedDays: completedDayNumbers(d).length,
    favorites: d.favorites.length,
    journalEntries: Object.keys(d.journal).length,
    mealPlanSlots: slots,
    bestHabitStreak: hs.best,
    habitChecks: hs.totalChecks,
  };
}

export function achievementStates(d: UserData) {
  const input = achievementInput(d);
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.test(input), value: a.progress(input) }));
}

export function weeklyEvolution(data: UserData, weeks = 6) {
  const total = activeHabits(data).length;
  const start = startOfWeek();
  return Array.from({ length: weeks }, (_, i) => {
    const ws = addDays(start, -7 * (weeks - 1 - i));
    let done = 0;
    for (let d = 0; d < 7; d++) done += habitDoneOn(data, toISODate(addDays(ws, d)));
    return { label: formatDateBR(ws, { day: "2-digit", month: "2-digit" }), value: total ? Math.round((done / (total * 7)) * 100) : 0 };
  });
}

