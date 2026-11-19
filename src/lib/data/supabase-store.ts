"use client";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { toISODate } from "@/lib/utils";
import type { DataStore, Habit, JournalEntry, ShoppingItem, UserData } from "./types";

function check<T extends { error: { message: string } | null }>(res: T): T {
  if (res.error) throw new Error(res.error.message);
  return res;
}

async function userId() {
  const sb = getSupabaseBrowser();
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return { sb, id: data.user.id, email: data.user.email ?? "" };
}

/** Persistência no Supabase (protegida por RLS). */
export const supabaseStore: DataStore = {
  kind: "supabase",

  async load(): Promise<UserData> {
    const { sb, id, email } = await userId();
    const [profile, days, favs, habits, logs, journal, plans, shopping] = await Promise.all([
      sb.from("profiles").select("full_name, journey_started_at, reminder_opt_in").eq("id", id).maybeSingle(),
      sb.from("day_progress").select("day, checklist, completed_at"),
      sb.from("favorites").select("recipe_slug"),
      sb.from("habits").select("id, label, goal, icon, position, active").order("position"),
      sb.from("habit_logs").select("habit_id, log_date"),
      sb.from("journal_entries").select("entry_date, mood, energy, sleep, reflection, wins, notes"),
      sb.from("meal_plans").select("week_start, slots"),
      sb.from("shopping_items").select("id, item, qty, source, section, checked").order("created_at"),
    ]);
    [profile, days, favs, habits, logs, journal, plans, shopping].forEach(check);

    const habitLogs: Record<string, string[]> = {};
    for (const l of logs.data ?? []) (habitLogs[l.log_date] ??= []).push(l.habit_id);

    return {
      profile: {
        name: profile.data?.full_name ?? "",
        email,
        journeyStartedAt: profile.data?.journey_started_at ?? null,
        reminderOptIn: profile.data?.reminder_opt_in ?? false,
      },
      days: Object.fromEntries(
        (days.data ?? []).map((d: { day: number; checklist: number[]; completed_at: string | null }) => [
          d.day,
          { checklist: d.checklist ?? [], completedAt: d.completed_at },
        ]),
      ),
      favorites: (favs.data ?? []).map((f: { recipe_slug: string }) => f.recipe_slug),
      habits: (habits.data ?? []) as Habit[],
      habitLogs,
      journal: Object.fromEntries(
        (journal.data ?? []).map(
          (j: { entry_date: string; mood: number | null; energy: number | null; sleep: number | null; reflection: string | null; wins: string | null; notes: string | null }) => [
            j.entry_date,
            {
              date: j.entry_date,
              mood: j.mood,
              energy: j.energy,
              sleep: j.sleep,
              reflection: j.reflection ?? "",
              wins: j.wins ?? "",
              notes: j.notes ?? "",
            } satisfies JournalEntry,
          ],
        ),
      ),
      mealPlans: Object.fromEntries((plans.data ?? []).map((p: { week_start: string; slots: Record<string, string> }) => [p.week_start, p.slots ?? {}])),
      shopping: (shopping.data ?? []) as ShoppingItem[],
    };
  },

  async saveDay(day, p) {
    const { sb, id } = await userId();
    check(await sb.from("day_progress").upsert({ user_id: id, day, checklist: p.checklist, completed_at: p.completedAt }));
  },

  async setFavorite(slug, on) {
    const { sb, id } = await userId();
    if (on) check(await sb.from("favorites").upsert({ user_id: id, recipe_slug: slug }));
    else check(await sb.from("favorites").delete().eq("recipe_slug", slug));
  },

  async upsertHabit(h) {
    const { sb, id } = await userId();
    check(await sb.from("habits").upsert({ ...h, user_id: id }));
  },

  async deleteHabit(habitId) {
    const { sb } = await userId();
    check(await sb.from("habits").delete().eq("id", habitId));
  },

  async setHabitLog(habitId, date, on) {
    const { sb, id } = await userId();
    if (on) check(await sb.from("habit_logs").upsert({ user_id: id, habit_id: habitId, log_date: date }));
    else check(await sb.from("habit_logs").delete().eq("habit_id", habitId).eq("log_date", date));
  },

  async saveJournal(e) {
    const { sb, id } = await userId();
    check(
      await sb.from("journal_entries").upsert(
        {
          user_id: id,
          entry_date: e.date,
          mood: e.mood,
          energy: e.energy,
          sleep: e.sleep,
          reflection: e.reflection,
          wins: e.wins,
          notes: e.notes,
        },
        { onConflict: "user_id,entry_date" },
      ),
    );
  },

  async deleteJournal(date) {
    const { sb } = await userId();
    check(await sb.from("journal_entries").delete().eq("entry_date", date));
  },

  async saveMealPlan(weekStart, slots) {
    const { sb, id } = await userId();
    check(await sb.from("meal_plans").upsert({ user_id: id, week_start: weekStart, slots }));
  },

  async addShopping(items) {
    const { sb, id } = await userId();
    if (items.length) check(await sb.from("shopping_items").insert(items.map((i) => ({ ...i, user_id: id }))));
  },

  async updateShopping(itemId, patch) {
    const { sb } = await userId();
    check(await sb.from("shopping_items").update(patch).eq("id", itemId));
  },

  async deleteShopping(ids) {
    const { sb } = await userId();
    if (ids.length) check(await sb.from("shopping_items").delete().in("id", ids));
  },

  async updateProfile(patch) {
    const { sb, id } = await userId();
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.full_name = patch.name;
    if (patch.journeyStartedAt !== undefined) row.journey_started_at = patch.journeyStartedAt;
    if (patch.reminderOptIn !== undefined) row.reminder_opt_in = patch.reminderOptIn;
    check(await sb.from("profiles").update(row).eq("id", id));
  },

  async resetJourney() {
    const { sb, id } = await userId();
    check(await sb.from("day_progress").delete().eq("user_id", id));
    check(await sb.from("profiles").update({ journey_started_at: toISODate() }).eq("id", id));
  },

  async deleteAccount() {
    const { sb } = await userId();
    check(await sb.rpc("delete_my_account"));
    await sb.auth.signOut();
  },
};
