import type { Recipe, RecipeCategory } from "@/lib/content/types";
import { cn, hashString } from "@/lib/utils";
import RECIPE_IMAGES_JSON from "@/lib/content/recipe-images.json";

const RECIPE_IMAGES = RECIPE_IMAGES_JSON as Record<string, string>;

const PALETTE: Record<RecipeCategory, { bg: string; bg2: string; plate: string }> = {
  "cafe-da-manha": { bg: "#FBEFD9", bg2: "#F4DDB2", plate: "#FFFDF8" },
  almoco: { bg: "#E3F3EA", bg2: "#C3E6D3", plate: "#FFFFFF" },
  jantar: { bg: "#E9ECF5", bg2: "#CDD5EA", plate: "#FFFFFF" },
  lanche: { bg: "#FCEBE4", bg2: "#F6CFBF", plate: "#FFFDFB" },
  sobremesa: { bg: "#F6E9F0", bg2: "#E9CADB", plate: "#FFFFFF" },
};

const INGREDIENT_COLORS: [RegExp, string][] = [
  [/banana|manga|abóbora|milho|cuscuz|flocão|maracujá|mamão/i, "#F2C14E"],
  [/tomate|morango|pimentão|páprica|maçã/i, "#D9534F"],
  [/espinafre|couve|brócolis|abobrinha|alface|folhas|pepino|hortelã|abacate|kiwi|quinoa/i, "#5BA55B"],
  [/cenoura|batata-doce|laranja|damasco|curry/i, "#EE8B3A"],
  [/frango|ovo|tapioca|queijo|iogurte|grão|arroz|aveia|pão|macarrão|coco|chia|ricota|leite/i, "#F3E3C3"],
  [/feijão|lentilha|carne|cacau|tâmara|castanha|amendoim|pipoca/i, "#8B5A3C"],
  [/peixe|tilápia|atum|cogumelo/i, "#D8D2C4"],
  [/uva|frutas/i, "#8E5BA8"],
];

function colorsFor(recipe: Pick<Recipe, "keyIngredients" | "slug">) {
  const cols = recipe.keyIngredients
    .map((k) => INGREDIENT_COLORS.find(([re]) => re.test(k))?.[1])
    .filter(Boolean) as string[];
  return cols.length ? cols : ["#5BA55B", "#F2C14E", "#D9534F"];
}

/**
 * Ilustração original e determinística de cada receita, usada quando ainda não há
 * fotografia cadastrada no painel admin.
 */
export function RecipeArt({ recipe, className }: { recipe: Pick<Recipe, "slug" | "category" | "keyIngredients" | "title" | "imageUrl">; className?: string }) {
  const photo = recipe.imageUrl || RECIPE_IMAGES[recipe.slug];
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={recipe.title} className={cn("h-full w-full object-cover", className)} loading="lazy" />;
  }
  const p = PALETTE[recipe.category];
  const h = hashString(recipe.slug);
  const cols = colorsFor(recipe);
  const rot = (h % 40) - 20;
  const dots = Array.from({ length: 9 }, (_, i) => {
    const a = ((h >> (i % 16)) % 360) * (Math.PI / 180) + i * 0.9;
    const r = 14 + ((h >> i) % 22);
    return { x: 100 + Math.cos(a) * r, y: 100 + Math.sin(a) * r * 0.8, s: 6 + ((h >> (i + 3)) % 7), c: cols[i % cols.length] };
  });
  const isBowl = recipe.category === "cafe-da-manha" || recipe.category === "jantar";
  const isGlass = recipe.category === "sobremesa" && h % 2 === 0;
  const gid = `g-${recipe.slug}`;

  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} role="img" aria-label={`Ilustração: ${recipe.title}`}>
      <defs>
        <radialGradient id={gid} cx="0.3" cy="0.2" r="1">
          <stop offset="0" stopColor={p.bg} />
          <stop offset="1" stopColor={p.bg2} />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gid})`} />
      {/* folhinhas decorativas */}
      <g opacity="0.35" transform={`rotate(${rot} 100 100)`}>
        <path d="M18 40c10-14 28-14 34-4-10 12-26 12-34 4Z" fill="#138A65" />
        <path d="M160 168c8-12 24-12 28-2-8 10-22 10-28 2Z" fill="#138A65" />
        <circle cx="170" cy="34" r="5" fill="#D6B36A" />
        <circle cx="30" cy="170" r="3.5" fill="#D6B36A" />
      </g>
      <ellipse cx="100" cy="150" rx="66" ry="12" fill="#0B6249" opacity="0.08" />
      {isGlass ? (
        <g>
          <path d="M70 62h60l-8 84a10 10 0 0 1-10 9H88a10 10 0 0 1-10-9Z" fill={p.plate} stroke="#0B6249" strokeOpacity="0.12" strokeWidth="2" />
          <path d="M74 98h52l-5 46a8 8 0 0 1-8 7H87a8 8 0 0 1-8-7Z" fill={cols[0]} opacity="0.85" />
          <path d="M72 80h56l-1.6 18H73.6Z" fill={cols[1 % cols.length]} opacity="0.75" />
          {dots.slice(0, 4).map((d, i) => (
            <circle key={i} cx={86 + i * 9} cy={70 + (i % 2) * 4} r={d.s * 0.6} fill={d.c} />
          ))}
        </g>
      ) : (
        <g>
          {isBowl ? (
            <>
              <path d="M38 98h124a62 52 0 0 1-124 0Z" fill={p.plate} stroke="#0B6249" strokeOpacity="0.12" strokeWidth="2" />
              <ellipse cx="100" cy="98" rx="62" ry="13" fill={cols[0]} opacity="0.9" />
              {dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={92 + ((d.y - 100) * 0.25)} r={d.s * 0.7} fill={d.c} stroke="#fff" strokeOpacity="0.5" />
              ))}
            </>
          ) : (
            <>
              <circle cx="100" cy="100" r="66" fill={p.plate} stroke="#0B6249" strokeOpacity="0.1" strokeWidth="2" />
              <circle cx="100" cy="100" r="52" fill="none" stroke="#0B6249" strokeOpacity="0.06" strokeWidth="2" />
              <path d={`M100 100 L${100 + 44 * Math.cos(1.2)} ${100 + 44 * Math.sin(1.2)} A44 44 0 0 1 ${100 + 44 * Math.cos(3.4)} ${100 + 44 * Math.sin(3.4)}Z`} fill={cols[0]} opacity="0.85" />
              {dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={d.c} stroke="#fff" strokeOpacity="0.6" />
              ))}
              <path d="M80 70c6-8 16-8 20 0-6 6-14 6-20 0Z" fill="#5BA55B" />
            </>
          )}
        </g>
      )}
    </svg>
  );
}
