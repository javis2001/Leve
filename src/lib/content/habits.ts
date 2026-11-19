export const HABIT_ICONS = [
  "Footprints",
  "Droplets",
  "Moon",
  "Salad",
  "Coffee",
  "Heart",
  "Sun",
  "Apple",
  "BookOpen",
  "Smile",
] as const;
export type HabitIcon = (typeof HABIT_ICONS)[number];

export interface HabitTemplate {
  key: string;
  label: string;
  goal: string;
  icon: HabitIcon;
}

/** Hábitos iniciais criados para cada nova conta (podem ser editados). */
export const DEFAULT_HABITS: HabitTemplate[] = [
  { key: "movimento", label: "Movimento", goal: "Me movimentar pelo menos 10 minutos", icon: "Footprints" },
  { key: "hidratacao", label: "Hidratação", goal: "Manter a garrafa de água por perto e beber ao longo do dia", icon: "Droplets" },
  { key: "sono", label: "Sono", goal: "Deitar no horário que escolhi", icon: "Moon" },
  { key: "planejamento", label: "Planejamento alimentar", goal: "Saber o que vou comer nas principais refeições", icon: "Salad" },
  { key: "pausas", label: "Pausas e autocuidado", goal: "Fazer uma pausa só para mim", icon: "Heart" },
];
