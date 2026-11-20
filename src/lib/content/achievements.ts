export interface AchievementInput {
  completedDays: number;
  favorites: number;
  journalEntries: number;
  mealPlanSlots: number;
  bestHabitStreak: number;
  habitChecks: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  message: string;
  icon: "Footprints" | "Sprout" | "Flame" | "Mountain" | "Sparkles" | "Trophy" | "Heart" | "BookHeart" | "CalendarCheck" | "Droplets";
  test: (s: AchievementInput) => boolean;
  progress: (s: AchievementInput) => [number, number];
}

const days = (n: number) => (s: AchievementInput) => [Math.min(s.completedDays, n), n] as [number, number];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "primeiro-passo",
    title: "Primeiro passo",
    description: "Concluir o dia 1 da jornada.",
    message: "Você começou. Esse é sempre o passo mais corajoso.",
    icon: "Footprints",
    test: (s) => s.completedDays >= 1,
    progress: days(1),
  },
  {
    id: "primeira-semana",
    title: "Primeira semana",
    description: "Concluir 7 dias da jornada.",
    message: "Uma semana inteira de cuidado com você!",
    icon: "Sprout",
    test: (s) => s.completedDays >= 7,
    progress: days(7),
  },
  {
    id: "dez-dias",
    title: "Dez dias de dedicação",
    description: "Concluir 10 dias da jornada.",
    message: "Dez dias mostrando para si mesma do que é capaz.",
    icon: "Flame",
    test: (s) => s.completedDays >= 10,
    progress: days(10),
  },
  {
    id: "metade",
    title: "Metade da jornada",
    description: "Concluir 15 dias da jornada.",
    message: "Metade do caminho — e muita coisa já mudou.",
    icon: "Mountain",
    test: (s) => s.completedDays >= 15,
    progress: days(15),
  },
  {
    id: "vinte-dias",
    title: "Vinte dias de progresso",
    description: "Concluir 20 dias da jornada.",
    message: "Vinte dias de constância. Seus hábitos estão criando raízes.",
    icon: "Sparkles",
    test: (s) => s.completedDays >= 20,
    progress: days(20),
  },
  {
    id: "jornada-completa",
    title: "Jornada de 30 dias concluída",
    description: "Concluir os 30 dias.",
    message: "Parabéns! Você completou a jornada Vida Leve.",
    icon: "Trophy",
    test: (s) => s.completedDays >= 30,
    progress: days(30),
  },
  {
    id: "receita-favorita",
    title: "Cozinha com carinho",
    description: "Favoritar 3 receitas.",
    message: "Suas receitas preferidas estão sempre à mão.",
    icon: "Heart",
    test: (s) => s.favorites >= 3,
    progress: (s) => [Math.min(s.favorites, 3), 3],
  },
  {
    id: "diario",
    title: "Olhar para dentro",
    description: "Registrar 5 dias no diário de bem-estar.",
    message: "Reflexão também é cuidado.",
    icon: "BookHeart",
    test: (s) => s.journalEntries >= 5,
    progress: (s) => [Math.min(s.journalEntries, 5), 5],
  },
  {
    id: "planejadora",
    title: "Semana planejada",
    description: "Preencher 10 refeições no cardápio semanal.",
    message: "Planejar é um presente para a você de amanhã.",
    icon: "CalendarCheck",
    test: (s) => s.mealPlanSlots >= 10,
    progress: (s) => [Math.min(s.mealPlanSlots, 10), 10],
  },
  {
    id: "sequencia-habitos",
    title: "Constância",
    description: "Marcar hábitos em 5 dias seguidos.",
    message: "Pequenas ações, repetidas, constroem grandes mudanças.",
    icon: "Droplets",
    test: (s) => s.bestHabitStreak >= 5,
    progress: (s) => [Math.min(s.bestHabitStreak, 5), 5],
  },
];
