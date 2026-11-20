export type RecipeCategory = "cafe-da-manha" | "almoco" | "jantar" | "lanche" | "sobremesa";

export const RECIPE_CATEGORIES: { id: RecipeCategory; label: string; short: string }[] = [
  { id: "cafe-da-manha", label: "Cafés da manhã", short: "Café da manhã" },
  { id: "almoco", label: "Almoços", short: "Almoço" },
  { id: "jantar", label: "Jantares", short: "Jantar" },
  { id: "lanche", label: "Lanches", short: "Lanche" },
  { id: "sobremesa", label: "Sobremesas equilibradas", short: "Sobremesa" },
];

export type Allergen =
  | "gluten"
  | "leite"
  | "ovos"
  | "castanhas"
  | "amendoim"
  | "soja"
  | "peixe"
  | "gergelim";

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: "Glúten",
  leite: "Leite e derivados",
  ovos: "Ovos",
  castanhas: "Castanhas e oleaginosas",
  amendoim: "Amendoim",
  soja: "Soja",
  peixe: "Peixe",
  gergelim: "Gergelim",
};

export interface Ingredient {
  /** Quantidade legível, ex.: "1 xícara (chá)" */
  qty: string;
  /** Nome do ingrediente, usado também para a lista de compras */
  item: string;
  /** Observação opcional, ex.: "picada" */
  note?: string;
}

export interface Recipe {
  slug: string;
  title: string;
  category: RecipeCategory;
  summary: string;
  servings: string;
  prepMinutes: number;
  difficulty: "Fácil" | "Média";
  ingredients: Ingredient[];
  steps: string[];
  substitutions: string[];
  allergens: Allergen[];
  /** Observações sobre alergênicos (contaminação cruzada etc.) */
  allergenNotes?: string;
  /** Ingredientes principais para filtro */
  keyIngredients: string[];
  /** URL de foto real, quando cadastrada pelo admin */
  imageUrl?: string | null;
  tags?: string[];
}

export type ExerciseCategory =
  | "mobilidade"
  | "caminhada"
  | "alongamento"
  | "fortalecimento"
  | "relaxamento"
  | "sentado";

export const EXERCISE_CATEGORIES: { id: ExerciseCategory; label: string; description: string }[] = [
  { id: "mobilidade", label: "Mobilidade", description: "Movimentos suaves para soltar as articulações." },
  { id: "caminhada", label: "Caminhada", description: "Do quarteirão ao passeio de 30 minutos, no seu ritmo." },
  { id: "alongamento", label: "Alongamento", description: "Mais conforto para a musculatura do dia a dia." },
  { id: "fortalecimento", label: "Fortalecimento básico", description: "Força funcional com o peso do próprio corpo." },
  { id: "relaxamento", label: "Relaxamento", description: "Respiração e pausas para desacelerar." },
  { id: "sentado", label: "Exercícios sentados", description: "Opções seguras feitas na cadeira." },
];

export type Pose =
  | "standing"
  | "standing-arms-up"
  | "standing-side"
  | "walking"
  | "squat"
  | "wall-push"
  | "seated"
  | "seated-arms-up"
  | "seated-leg"
  | "lying"
  | "lying-bridge"
  | "all-fours"
  | "breathing";

export interface Exercise {
  slug: string;
  name: string;
  category: ExerciseCategory;
  level: "Muito leve" | "Leve" | "Leve a moderado";
  duration: string;
  summary: string;
  steps: string[];
  adaptations: string[];
  safety: string[];
  pose: Pose;
  /** Vídeo licenciado e validado (opcional, cadastrado no admin) */
  videoUrl?: string | null;
  /** Imagem própria/licenciada (opcional, cadastrada no admin); substitui a ilustração */
  imageUrl?: string | null;
}

export interface JourneyDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  objective: string;
  education: string[];
  activity: {
    title: string;
    description: string;
    minutes: number;
    exerciseSlugs: string[];
    adaptation: string;
  };
  food: { text: string; recipeSlug?: string };
  habit: string;
  motivation: string;
  checklist: string[];
}

export interface JourneyWeek {
  week: 1 | 2 | 3 | 4;
  title: string;
  focus: string;
  days: [number, number];
}
