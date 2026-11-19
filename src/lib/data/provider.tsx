"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ACHIEVEMENTS } from "@/lib/content/achievements";
import { achievementInput } from "./stats";
import { localStore } from "./local-store";
import { supabaseStore } from "./supabase-store";
import { uid, type DataStore, type DayProgress, type Habit, type JournalEntry, type MealSlots, type ShoppingItem, type UserData, type UserProfile } from "./types";

type Status = "loading" | "ready" | "error";

interface Ctx {
  status: Status;
  data: UserData | null;
  storeKind: DataStore["kind"];
  reload: () => Promise<void>;
  saveDay: (day: number, p: DayProgress) => Promise<void>;
  toggleFavorite: (slug: string) => Promise<void>;
  upsertHabit: (h: Omit<Habit, "id"> & { id?: string }) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  saveJournal: (e: JournalEntry) => Promise<void>;
  deleteJournal: (date: string) => Promise<void>;
  saveMealPlan: (weekStart: string, slots: MealSlots) => Promise<void>;
  addShopping: (items: Omit<ShoppingItem, "id" | "checked">[]) => Promise<number>;
  updateShopping: (id: string, patch: Partial<ShoppingItem>) => Promise<void>;
  deleteShopping: (ids: string[]) => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  resetJourney: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const UserDataContext = createContext<Ctx | null>(null);

export function UserDataProvider({ mode, children }: { mode: "demo" | "supabase"; children: ReactNode }) {
  const store = mode === "demo" ? localStore : supabaseStore;
  const [data, setData] = useState<UserData | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const unlocked = useRef<Set<string> | null>(null);

  const reload = useCallback(async () => {
    try {
      const d = await store.load();
      setData(d);
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }, [store]);

  useEffect(() => {
    // Carregamento inicial dos dados da usuária (sincronização com sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  // Celebra conquistas recém-desbloqueadas
  useEffect(() => {
    if (!data) return;
    const input = achievementInput(data);
    const now = new Set(ACHIEVEMENTS.filter((a) => a.test(input)).map((a) => a.id));
    if (unlocked.current) {
      for (const a of ACHIEVEMENTS) {
        if (now.has(a.id) && !unlocked.current.has(a.id)) {
          toast.success(`Conquista desbloqueada: ${a.title}`, { description: a.message, duration: 6000 });
        }
      }
    }
    unlocked.current = now;
  }, [data]);

  const run = useCallback(
    async (optimistic: (d: UserData) => UserData, persist: () => Promise<void>) => {
      setData((d) => (d ? optimistic(structuredClone(d)) : d));
      try {
        await persist();
      } catch (e) {
        console.error(e);
        toast.error("Não foi possível salvar agora", { description: "Verifique sua conexão e tente novamente." });
        await reload();
      }
    },
    [reload],
  );

  const value = useMemo<Ctx>(
    () => ({
      status,
      data,
      storeKind: store.kind,
      reload,
      saveDay: (day, p) =>
        run(
          (d) => ((d.days[day] = p), d),
          () => store.saveDay(day, p),
        ),
      toggleFavorite: async (slug) => {
        const on = !data?.favorites.includes(slug);
        await run(
          (d) => ((d.favorites = on ? [...d.favorites, slug] : d.favorites.filter((s) => s !== slug)), d),
          () => store.setFavorite(slug, on),
        );
        toast(on ? "Receita salva nos favoritos" : "Receita removida dos favoritos");
      },
      upsertHabit: (h) => {
        const habit: Habit = { ...h, id: h.id ?? uid() };
        return run(
          (d) => {
            const i = d.habits.findIndex((x) => x.id === habit.id);
            if (i >= 0) d.habits[i] = habit;
            else d.habits.push(habit);
            return d;
          },
          () => store.upsertHabit(habit),
        );
      },
      deleteHabit: (id) =>
        run(
          (d) => ((d.habits = d.habits.filter((h) => h.id !== id)), d),
          () => store.deleteHabit(id),
        ),
      toggleHabit: (habitId, date) => {
        const on = !(data?.habitLogs[date] ?? []).includes(habitId);
        return run(
          (d) => {
            const cur = new Set(d.habitLogs[date] ?? []);
            if (on) cur.add(habitId);
            else cur.delete(habitId);
            d.habitLogs[date] = [...cur];
            return d;
          },
          () => store.setHabitLog(habitId, date, on),
        );
      },
      saveJournal: (e) =>
        run(
          (d) => ((d.journal[e.date] = e), d),
          () => store.saveJournal(e),
        ),
      deleteJournal: (date) =>
        run(
          (d) => (delete d.journal[date], d),
          () => store.deleteJournal(date),
        ),
      saveMealPlan: (w, slots) =>
        run(
          (d) => ((d.mealPlans[w] = slots), d),
          () => store.saveMealPlan(w, slots),
        ),
      addShopping: async (items) => {
        const existing = new Set((data?.shopping ?? []).map((s) => `${s.item.toLowerCase()}|${s.source ?? ""}`));
        const fresh: ShoppingItem[] = items
          .filter((i) => !existing.has(`${i.item.toLowerCase()}|${i.source ?? ""}`))
          .map((i) => ({ ...i, id: uid(), checked: false }));
        if (fresh.length)
          await run(
            (d) => ((d.shopping = [...d.shopping, ...fresh]), d),
            () => store.addShopping(fresh),
          );
        return fresh.length;
      },
      updateShopping: (id, patch) =>
        run(
          (d) => ((d.shopping = d.shopping.map((s) => (s.id === id ? { ...s, ...patch } : s))), d),
          () => store.updateShopping(id, patch),
        ),
      deleteShopping: (ids) =>
        run(
          (d) => ((d.shopping = d.shopping.filter((s) => !ids.includes(s.id))), d),
          () => store.deleteShopping(ids),
        ),
      updateProfile: (patch) =>
        run(
          (d) => ((d.profile = { ...d.profile, ...patch }), d),
          () => store.updateProfile(patch),
        ),
      resetJourney: async () => {
        await store.resetJourney();
        await reload();
      },
      deleteAccount: () => store.deleteAccount(),
    }),
    [status, data, store, reload, run],
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData precisa estar dentro de UserDataProvider");
  return ctx;
}
