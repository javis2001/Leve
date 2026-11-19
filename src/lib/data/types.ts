export interface Habit {
  id: string;
  label: string;
  goal: string | null;
  icon: string;
  position: number;
  active: boolean;
}

export interface JournalEntry {
  date: string;
  mood: number | null;
  energy: number | null;
  sleep: number | null;
  reflection: string;
  wins: string;
  notes: string;
}

export const MEALS = [
  { key: "cafe", label: "Café da manhã", category: "cafe-da-manha" },
  { key: "almoco", label: "Almoço", category: "almoco" },
  { key: "lanche", label: "Lanche", category: "lanche" },
  { key: "jantar", label: "Jantar", category: "jantar" },
] as const;
export type MealKey = (typeof MEALS)[number]["key"];

/** Chave do slot: `${índice do dia 0-6}:${refeição}` → slug da receita */
export type MealSlots = Record<string, string>;

export interface ShoppingItem {
  id: string;
  item: string;
  qty: string | null;
  source: string | null;
  section: string | null;
  checked: boolean;
}

export interface DayProgress {
  checklist: number[];
  completedAt: string | null;
}

export interface UserProfile {
  name: string;
  email: string;
  journeyStartedAt: string | null;
  reminderOptIn: boolean;
}

export interface UserData {
  profile: UserProfile;
  days: Record<number, DayProgress>;
  favorites: string[];
  habits: Habit[];
  /** data AAAA-MM-DD → ids dos hábitos concluídos */
  habitLogs: Record<string, string[]>;
  /** data AAAA-MM-DD → registro */
  journal: Record<string, JournalEntry>;
  /** segunda-feira AAAA-MM-DD → slots */
  mealPlans: Record<string, MealSlots>;
  shopping: ShoppingItem[];
}

export interface DataStore {
  kind: "local" | "supabase";
  load(): Promise<UserData>;
  saveDay(day: number, progress: DayProgress): Promise<void>;
  setFavorite(slug: string, on: boolean): Promise<void>;
  upsertHabit(habit: Habit): Promise<void>;
  deleteHabit(id: string): Promise<void>;
  setHabitLog(habitId: string, date: string, on: boolean): Promise<void>;
  saveJournal(entry: JournalEntry): Promise<void>;
  deleteJournal(date: string): Promise<void>;
  saveMealPlan(weekStart: string, slots: MealSlots): Promise<void>;
  addShopping(items: ShoppingItem[]): Promise<void>;
  updateShopping(id: string, patch: Partial<ShoppingItem>): Promise<void>;
  deleteShopping(ids: string[]): Promise<void>;
  updateProfile(patch: Partial<UserProfile>): Promise<void>;
  resetJourney(): Promise<void>;
  deleteAccount(): Promise<void>;
}

export function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
