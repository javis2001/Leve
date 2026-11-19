"use client";
import { DEFAULT_HABITS } from "@/lib/content/habits";
import { toISODate } from "@/lib/utils";
import { uid, type DataStore, type UserData } from "./types";

const KEY = "vl30-demo-v1";

function fresh(): UserData {
  return {
    profile: { name: "", email: "demo@vidaleve30.local", journeyStartedAt: toISODate(), reminderOptIn: false },
    days: {},
    favorites: [],
    habits: DEFAULT_HABITS.map((h, i) => ({ id: uid(), label: h.label, goal: h.goal, icon: h.icon, position: i, active: true })),
    habitLogs: {},
    journal: {},
    mealPlans: {},
    shopping: [],
  };
}

function read(): UserData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) } as UserData;
  } catch {
    /* armazenamento indisponível */
  }
  const d = fresh();
  write(d);
  return d;
}

function write(d: UserData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* modo privado ou cota cheia */
  }
}

function mutate(fn: (d: UserData) => void) {
  const d = read();
  fn(d);
  write(d);
  return Promise.resolve();
}

/** Armazena tudo no navegador. Usado no modo demonstração (sem Supabase). */
export const localStore: DataStore = {
  kind: "local",
  load: () => Promise.resolve(read()),
  saveDay: (day, p) => mutate((d) => void (d.days[day] = p)),
  setFavorite: (slug, on) =>
    mutate((d) => {
      d.favorites = on ? [...new Set([...d.favorites, slug])] : d.favorites.filter((s) => s !== slug);
    }),
  upsertHabit: (h) =>
    mutate((d) => {
      const i = d.habits.findIndex((x) => x.id === h.id);
      if (i >= 0) d.habits[i] = h;
      else d.habits.push(h);
    }),
  deleteHabit: (id) =>
    mutate((d) => {
      d.habits = d.habits.filter((h) => h.id !== id);
      for (const k of Object.keys(d.habitLogs)) d.habitLogs[k] = d.habitLogs[k].filter((x) => x !== id);
    }),
  setHabitLog: (habitId, date, on) =>
    mutate((d) => {
      const cur = new Set(d.habitLogs[date] ?? []);
      if (on) cur.add(habitId);
      else cur.delete(habitId);
      d.habitLogs[date] = [...cur];
    }),
  saveJournal: (e) => mutate((d) => void (d.journal[e.date] = e)),
  deleteJournal: (date) => mutate((d) => void delete d.journal[date]),
  saveMealPlan: (w, slots) => mutate((d) => void (d.mealPlans[w] = slots)),
  addShopping: (items) => mutate((d) => void d.shopping.push(...items)),
  updateShopping: (id, patch) =>
    mutate((d) => {
      d.shopping = d.shopping.map((s) => (s.id === id ? { ...s, ...patch } : s));
    }),
  deleteShopping: (ids) =>
    mutate((d) => {
      const set = new Set(ids);
      d.shopping = d.shopping.filter((s) => !set.has(s.id));
    }),
  updateProfile: (patch) => mutate((d) => void (d.profile = { ...d.profile, ...patch })),
  resetJourney: () =>
    mutate((d) => {
      d.days = {};
      d.profile.journeyStartedAt = toISODate();
    }),
  deleteAccount: () => {
    localStorage.removeItem(KEY);
    return Promise.resolve();
  },
};
