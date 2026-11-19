import type { Recipe } from "./types";

export type ShoppingSection =
  | "Hortifrúti"
  | "Proteínas"
  | "Grãos, cereais e massas"
  | "Laticínios e ovos"
  | "Temperos e condimentos"
  | "Mercearia";

export const SHOPPING_SECTIONS: ShoppingSection[] = [
  "Hortifrúti",
  "Proteínas",
  "Laticínios e ovos",
  "Grãos, cereais e massas",
  "Temperos e condimentos",
  "Mercearia",
];

const w = (words: string) => new RegExp(`(?<![\\p{L}-])(${words})(?![\\p{L}])`, "iu");

const RULES: [ShoppingSection, RegExp][] = [
  ["Grãos, cereais e massas", w("sementes|chia|linhaça")],
  ["Temperos e condimentos", w("sal|pimenta|canela|páprica|cominho|curry|orégano|alecrim|noz-moscada|louro|cravo|ervas|alho em pó|gengibre ralado|fermento nutricional|chimichurri")],
  ["Laticínios e ovos", w("ovo|ovos|leite(?! de coco)|iogurte|queijo|requeijão|ricota|manteiga|parmesão|muçarela")],
  ["Proteínas", w("frango|carne|tilápia|peixe|atum|linguiça")],
  ["Hortifrúti", w("banana|maçã|mamão|manga|morango|abacaxi|laranja|limão|maracujá|kiwi|uvas|melão|pera|abacate|tomate|cebola|alho|espinafre|couve|alface|rúcula|folhas|cenoura|abobrinha|abóbora|batata|chuchu|brócolis|pepino|pimentão|cogumelo|champignon|salsão|hortelã|manjericão|cheiro-verde|salsinha|coentro|gengibre|frutas|milho verde|tâmaras")],
  ["Grãos, cereais e massas", w("aveia|arroz|feijão|lentilha|grão-de-bico|quinoa|macarrão|tapioca|flocão|farinha|pão|milho de pipoca|chia|linhaça|sementes")],
];

export function sectionFor(item: string): ShoppingSection {
  for (const [section, re] of RULES) if (re.test(item)) return section;
  return "Mercearia";
}

/** Itens que normalmente já estão em casa e não precisam ir para a lista por padrão. */
const PANTRY_SKIP = /^(água|sal e pimenta-do-reino|sal)$/i;

export interface AggregatedItem {
  item: string;
  section: ShoppingSection;
  uses: { qty: string; recipe: string }[];
}

export function aggregateIngredients(recipes: Recipe[]): AggregatedItem[] {
  const map = new Map<string, AggregatedItem>();
  for (const r of recipes) {
    for (const ing of r.ingredients) {
      if (PANTRY_SKIP.test(ing.item.trim())) continue;
      const key = ing.item.trim().toLowerCase();
      const existing = map.get(key);
      const use = { qty: ing.qty, recipe: r.title };
      if (existing) existing.uses.push(use);
      else map.set(key, { item: ing.item.trim(), section: sectionFor(ing.item), uses: [use] });
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      SHOPPING_SECTIONS.indexOf(a.section) - SHOPPING_SECTIONS.indexOf(b.section) ||
      a.item.localeCompare(b.item, "pt-BR"),
  );
}
