import { Text, View } from "@react-pdf/renderer";
import { GENERAL_SAFETY } from "@/lib/content/exercises";
import { JOURNEY_WEEKS } from "@/lib/content/journey";
import { SHOPPING_SECTIONS, aggregateIngredients } from "@/lib/content/shopping";
import { ALLERGEN_LABELS, EXERCISE_CATEGORIES, RECIPE_CATEGORIES, type Exercise, type JourneyDay, type Recipe } from "@/lib/content/types";
import { DEFAULT_HABITS } from "@/lib/content/habits";
import { MEALS, type MealSlots } from "@/lib/data/types";
import { Bullets, C, Checks, ContentPage, Cover, Doc, s } from "./base";

export interface PdfContent {
  days: JourneyDay[];
  recipes: Recipe[];
  exercises: Exercise[];
}

export const MATERIALS = [
  { slug: "guia-inicial", title: "Guia inicial do Vida Leve 30", description: "Como funciona o programa, as 4 semanas e como aproveitar a plataforma." },
  { slug: "calendario-30-dias", title: "Calendário dos 30 dias", description: "Todos os dias da jornada em uma visão para marcar e acompanhar." },
  { slug: "livro-de-receitas", title: "Livro das 50 receitas", description: "As 50 receitas completas, com ingredientes, preparo e substituições." },
  { slug: "planner-semanal", title: "Planner semanal", description: "Modelo para planejar refeições e um exemplo de semana preenchida." },
  { slug: "lista-de-compras", title: "Lista de compras", description: "Lista mestra organizada por seção, com todos os ingredientes das receitas." },
  { slug: "diario-de-habitos", title: "Diário de hábitos", description: "Rastreador de 30 dias e páginas semanais de reflexão." },
  { slug: "guia-de-exercicios", title: "Guia de exercícios para iniciantes", description: "Passo a passo, adaptações e cuidados de todos os exercícios." },
] as const;
export type MaterialSlug = (typeof MATERIALS)[number]["slug"];

const catLabel = (id: string) => RECIPE_CATEGORIES.find((c) => c.id === id)?.label ?? id;

// ───────── 1. Guia inicial ─────────
function GuiaInicial({ days }: PdfContent) {
  return (
    <Doc title="Guia inicial">
      <Cover eyebrow="Guia inicial" title="Boas-vindas à sua jornada" subtitle="Tudo o que você precisa saber para começar o Vida Leve 30 com tranquilidade e aproveitar cada ferramenta." />
      <ContentPage title="Guia inicial">
        <Text style={s.eyebrow}>Boas-vindas</Text>
        <Text style={s.h1}>Uma vida mais leve começa com pequenos passos</Text>
        <Text style={s.p}>
          O Vida Leve 30 é um programa digital de 30 dias criado para ajudar você a desenvolver hábitos saudáveis de forma gradual, realista e gentil. Não é uma dieta,
          não é um desafio de resultados rápidos e não exige academia. É um convite para cuidar de si com consistência, aprendendo um pouco a cada dia.
        </Text>
        <Text style={s.p}>
          Ao longo da jornada você vai experimentar receitas práticas, movimentos leves para fazer em casa, ferramentas de organização e momentos de reflexão. O objetivo
          é promover bem-estar, constância e autonomia — sem promessas de resultados físicos específicos.
        </Text>

        <Text style={s.h2}>Como funciona</Text>
        {[
          ["1. Comece sua jornada", "Crie sua conta, abra o dia 1 e defina o seu motivo para começar. Esse motivo vai acompanhar você nos dias mais desafiadores."],
          ["2. Siga pequenas atividades diariamente", "Cada dia traz um tema educativo, uma atividade física adaptável, uma sugestão de alimentação, um hábito e um checklist. Leva poucos minutos."],
          ["3. Acompanhe seus hábitos e conquistas", "Marque seus hábitos, registre como se sente no diário e veja sua evolução no painel de progresso. Conquistas celebram a sua constância."],
        ].map(([t, d]) => (
          <View key={t} style={s.card} wrap={false}>
            <Text style={{ fontWeight: 800, color: C.forest }}>{t}</Text>
            <Text>{d}</Text>
          </View>
        ))}

        <Text style={s.h2}>As quatro semanas</Text>
        {JOURNEY_WEEKS.map((w) => (
          <View key={w.week} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={s.h3}>
              Semana {w.week} — {w.title} (dias {w.days[0]} a {w.days[1]})
            </Text>
            <Text style={s.muted}>Foco: {w.focus}</Text>
            <Text style={s.small}>
              Temas: {days.filter((d) => d.week === w.week).map((d) => d.title).join(" · ")}
            </Text>
          </View>
        ))}

        <Text style={s.h2}>O que você encontra na plataforma</Text>
        <Bullets
          items={[
            "Jornada: os 30 dias com conteúdo, atividade, alimentação, hábito e checklist. Seu progresso fica salvo e pode ser revisado a qualquer momento.",
            "Receitas: 50 receitas com filtros por refeição, tempo de preparo e ingredientes, favoritos e envio para a lista de compras.",
            "Exercícios: biblioteca de movimentos leves com passo a passo, adaptações e cuidados de segurança.",
            "Cardápio semanal: organize café da manhã, almoço, lanche e jantar, gere a lista de compras e exporte em PDF.",
            "Hábitos: checklist diário personalizável, calendário de conclusão e evolução semanal.",
            "Diário: registre humor, energia, sono, reflexões e pequenas conquistas. Os registros são privados.",
            "Progresso e conquistas: acompanhe a jornada e celebre a constância.",
            "Materiais: estes PDFs, prontos para imprimir ou ler no celular.",
          ]}
        />

        <Text style={s.h2}>Princípios de uma alimentação equilibrada</Text>
        <Text style={s.p}>
          As receitas e sugestões seguem princípios do Guia Alimentar para a População Brasileira, do Ministério da Saúde: fazer de alimentos in natura ou minimamente
          processados a base da alimentação, usar óleos, sal e açúcar com moderação, limitar alimentos processados e evitar ultraprocessados, comer com regularidade e
          atenção, em ambientes apropriados e, sempre que possível, em companhia.
        </Text>
        <Text style={s.p}>
          O programa não define calorias, porções individualizadas ou restrições alimentares. Se você tem alguma condição de saúde, alergia ou necessidade específica,
          procure um nutricionista.
        </Text>

        <Text style={s.h2}>Dicas para aproveitar melhor</Text>
        <Bullets
          items={[
            "Escolha um horário fixo do dia para abrir o aplicativo — por exemplo, logo após o café da manhã.",
            "Não espere o momento perfeito: fazer uma parte da atividade já é progresso.",
            "Perdeu um dia? Simplesmente continue de onde parou. Nada se perde.",
            "Use a lista de compras para facilitar as receitas da semana.",
            "Celebre pequenas vitórias e registre-as no diário.",
          ]}
        />

        <Text style={s.h2}>Segurança em primeiro lugar</Text>
        <View style={s.cardGold}>
          <Bullets items={GENERAL_SAFETY} />
        </View>
      </ContentPage>
    </Doc>
  );
}

// ───────── 2. Calendário ─────────
function Calendario({ days }: PdfContent) {
  return (
    <Doc title="Calendário dos 30 dias">
      <Cover eyebrow="Calendário" title="Seus 30 dias, em uma visão" subtitle="Marque cada dia concluído e acompanhe a jornada também no papel." />
      <ContentPage title="Calendário dos 30 dias">
        <Text style={s.h1}>Calendário da jornada</Text>
        <Text style={[s.p, s.muted]}>Data de início: ____ / ____ / ________</Text>
        {JOURNEY_WEEKS.map((w) => (
          <View key={w.week} style={{ marginBottom: 10 }}>
            <View style={{ backgroundColor: C.forest, borderRadius: 6, padding: 8, marginTop: 8 }} wrap={false}>
              <Text style={{ color: "#FFFFFF", fontWeight: 800 }}>
                Semana {w.week} — {w.title}
              </Text>
              <Text style={{ color: "#CFE9DD", fontSize: 8.5 }}>{w.focus}</Text>
            </View>
            {days
              .filter((d) => d.week === w.week)
              .map((d) => (
                <View key={d.day} wrap={false} style={{ flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: C.line, paddingVertical: 6, alignItems: "flex-start" }}>
                  <View style={[s.box, { width: 12, height: 12, marginTop: 1 }]} />
                  <Text style={{ width: 40, fontWeight: 800, color: C.emerald }}>Dia {d.day}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 700 }}>{d.title}</Text>
                    <Text style={s.small}>
                      Movimento: {d.activity.title} ({d.activity.minutes} min) · Hábito: {d.habit}
                    </Text>
                  </View>
                  <Text style={[s.small, { width: 60, textAlign: "right" }]}>___/___</Text>
                </View>
              ))}
          </View>
        ))}
      </ContentPage>
    </Doc>
  );
}

// ───────── 3. Livro de receitas ─────────
function RecipeBlock({ r }: { r: Recipe }) {
  return (
    <View style={{ marginBottom: 16, paddingBottom: 12, borderBottomWidth: 0.6, borderBottomColor: C.line }} wrap={false}>
      <Text style={s.eyebrow}>{RECIPE_CATEGORIES.find((c) => c.id === r.category)?.short}</Text>
      <Text style={[s.h2, { marginTop: 0 }]}>{r.title}</Text>
      <Text style={[s.muted, { marginBottom: 6 }]}>
        {r.summary} Rendimento: {r.servings}. Preparo: {r.prepMinutes} min. Dificuldade: {r.difficulty}.
      </Text>
      <View style={{ flexDirection: "row", gap: 14 }}>
        <View style={{ width: "40%" }}>
          <Text style={s.h3}>Ingredientes</Text>
          {r.ingredients.map((i, k) => (
            <Text key={k} style={{ fontSize: 9.5, marginBottom: 2 }}>
              • {i.qty} {i.item}
              {i.note ? ` (${i.note})` : ""}
            </Text>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.h3}>Modo de preparo</Text>
          {r.steps.map((st, k) => (
            <Text key={k} style={{ fontSize: 9.5, marginBottom: 2 }}>
              {k + 1}. {st}
            </Text>
          ))}
        </View>
      </View>
      <Text style={[s.small, { marginTop: 6 }]}>Substituições: {r.substitutions.join(" ")}</Text>
      <Text style={s.small}>
        Alergênicos: {r.allergens.length ? r.allergens.map((a) => ALLERGEN_LABELS[a]).join(", ") : "nenhum dos principais nos ingredientes listados"}.
        {r.allergenNotes ? ` ${r.allergenNotes}` : ""}
      </Text>
    </View>
  );
}

function Receitas({ recipes }: PdfContent) {
  return (
    <Doc title="Livro das 50 receitas">
      <Cover eyebrow="Livro de receitas" title={`${recipes.length} receitas para o dia a dia`} subtitle="Cafés da manhã, almoços, jantares, lanches e sobremesas equilibradas, com ingredientes fáceis de encontrar." />
      <ContentPage title="Livro de receitas">
        <Text style={s.h1}>Sumário</Text>
        {RECIPE_CATEGORIES.map((c) => (
          <View key={c.id} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={s.h3}>{c.label}</Text>
            <Text style={s.small}>{recipes.filter((r) => r.category === c.id).map((r) => r.title).join(" · ")}</Text>
          </View>
        ))}
        <View style={s.cardGold}>
          <Text style={{ fontWeight: 700 }}>Sobre as informações nutricionais</Text>
          <Text style={{ fontSize: 9.5 }}>
            Este livro não traz tabelas nutricionais porque os valores ainda não foram calculados com base de dados validada e metodologia documentada. As receitas
            têm caráter educativo. Confira sempre os rótulos dos produtos industrializados quanto a alergênicos.
          </Text>
        </View>
        <Text style={s.h3}>Medidas usadas</Text>
        <Text style={s.small}>
          1 xícara (chá) = 240 ml · 1 colher (sopa) = 15 ml · 1 colher (chá) = 5 ml. Medidas caseiras são aproximadas e podem variar conforme o utensílio.
        </Text>
      </ContentPage>
      {RECIPE_CATEGORIES.map((c) => (
        <ContentPage key={c.id} title={`Receitas · ${c.label}`}>
          <Text style={s.h1}>{catLabel(c.id)}</Text>
          {recipes
            .filter((r) => r.category === c.id)
            .map((r) => (
              <RecipeBlock key={r.slug} r={r} />
            ))}
        </ContentPage>
      ))}
    </Doc>
  );
}

// ───────── 4. Planner semanal ─────────
const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function PlannerTable({ fill }: { fill?: (day: number, meal: string) => string }) {
  return (
    <View style={{ borderWidth: 0.7, borderColor: C.line, borderRadius: 6 }}>
      <View style={{ flexDirection: "row", backgroundColor: C.mint }}>
        <Text style={{ width: 62, padding: 5, fontWeight: 800, fontSize: 8.5 }}>Dia</Text>
        {MEALS.map((m) => (
          <Text key={m.key} style={{ flex: 1, padding: 5, fontWeight: 800, fontSize: 8.5 }}>
            {m.label}
          </Text>
        ))}
      </View>
      {DAYS.map((d, i) => (
        <View key={d} style={{ flexDirection: "row", borderTopWidth: 0.7, borderTopColor: C.line, minHeight: fill ? 34 : 70 }} wrap={false}>
          <Text style={{ width: 62, padding: 5, fontWeight: 700, fontSize: 9 }}>{d}</Text>
          {MEALS.map((m) => (
            <Text key={m.key} style={{ flex: 1, padding: 5, fontSize: 8.5, borderLeftWidth: 0.7, borderLeftColor: C.line }}>
              {fill ? fill(i, m.key) : ""}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function exampleWeek(recipes: Recipe[]) {
  return (day: number, meal: string) => {
    const cat = MEALS.find((m) => m.key === meal)!.category;
    const pool = recipes.filter((r) => r.category === cat);
    return pool.length ? pool[(day * 3 + meal.length) % pool.length].title : "";
  };
}

function Planner({ recipes }: PdfContent) {
  return (
    <Doc title="Planner semanal">
      <Cover eyebrow="Planner semanal" title="Planeje sua semana com leveza" subtitle="Um modelo para organizar as refeições, um exemplo preenchido e dicas para facilitar a rotina." />
      <ContentPage title="Planner semanal">
        <Text style={s.h1}>Como planejar sem complicar</Text>
        <Bullets
          numbered
          items={[
            "Escolha um momento fixo da semana para planejar (domingo à tarde funciona bem para muita gente).",
            "Comece pelos jantares dos dias úteis, que costumam ser o maior desafio.",
            "Repita receitas que deram certo — variedade não precisa ser todo dia.",
            "Aproveite um mesmo ingrediente em mais de um preparo: o frango do almoço vira recheio do sanduíche.",
            "Reserve um dia para usar as sobras e evitar desperdício.",
            "Faça a lista de compras a partir do planejamento e confira o que já tem em casa.",
          ]}
        />
        <Text style={s.h2}>Exemplo de semana</Text>
        <Text style={[s.small, { marginBottom: 6 }]}>Montado com receitas do livro. É apenas uma inspiração — adapte aos seus gostos, horários e orçamento.</Text>
        <PlannerTable fill={exampleWeek(recipes)} />
      </ContentPage>
      <ContentPage title="Planner semanal">
        <Text style={s.h1}>Minha semana</Text>
        <Text style={[s.muted, { marginBottom: 8 }]}>Semana de ____ / ____ a ____ / ____</Text>
        <PlannerTable />
        <Text style={s.h3}>Preparos antecipados da semana</Text>
        {[0, 1, 2].map((i) => (
          <View key={i} style={s.line} />
        ))}
      </ContentPage>
    </Doc>
  );
}

// ───────── 5. Lista de compras ─────────
function ListaCompras({ recipes }: PdfContent) {
  const agg = aggregateIngredients(recipes);
  return (
    <Doc title="Lista de compras">
      <Cover eyebrow="Lista de compras" title="Lista mestra de compras" subtitle="Todos os ingredientes das 50 receitas, organizados por seção do mercado, para marcar o que precisa comprar." />
      <ContentPage title="Lista de compras">
        <Text style={s.h1}>Lista mestra</Text>
        <Text style={[s.p, s.muted]}>
          Marque apenas o que for usar nas receitas da semana. Entre parênteses, o número de receitas em que o ingrediente aparece. Sal e água não foram incluídos.
        </Text>
        {SHOPPING_SECTIONS.map((sec) => {
          const items = agg.filter((a) => a.section === sec);
          if (!items.length) return null;
          return (
            <View key={sec} style={{ marginBottom: 8 }}>
              <Text style={[s.h3, { color: C.emerald }]}>{sec}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {items.map((a) => (
                  <View key={a.item} style={{ width: "50%", flexDirection: "row", marginBottom: 3, paddingRight: 6 }} wrap={false}>
                    <View style={s.box} />
                    <Text style={{ flex: 1, fontSize: 9.5 }}>
                      {a.item} <Text style={s.small}>({a.uses.length})</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ContentPage>
      <ContentPage title="Lista de compras">
        <Text style={s.h1}>Minha lista da semana</Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          {[0, 1].map((col) => (
            <View key={col} style={{ flex: 1 }}>
              {Array.from({ length: 26 }, (_, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-end", height: 22, borderBottomWidth: 0.6, borderBottomColor: C.line }}>
                  <View style={[s.box, { marginBottom: 4 }]} />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ContentPage>
    </Doc>
  );
}

// ───────── 6. Diário de hábitos ─────────
const WEEK_PROMPTS: Record<number, string[]> = {
  1: ["Qual é o meu motivo para começar esta jornada?", "Que mudança no ambiente (cozinha, garrafa de água, horários) mais me ajudou?", "Como me senti depois das caminhadas?"],
  2: ["Qual refeição foi mais fácil de equilibrar?", "Planejar o cardápio mudou algo na minha semana?", "O que percebi sobre minha fome e saciedade?"],
  3: ["Quais três hábitos mais me fazem bem hoje?", "Como lidei com um dia que não saiu como planejado?", "Que pausa de autocuidado quero manter?"],
  4: ["Quais gatilhos aprendi a reconhecer?", "Qual atividade física me trouxe mais prazer?", "Qual é o meu plano para os próximos 30 dias?"],
};

function DiarioHabitos() {
  const habits = [...DEFAULT_HABITS.map((h) => h.label), "", ""];
  return (
    <Doc title="Diário de hábitos">
      <Cover eyebrow="Diário de hábitos" title="Pequenas marcas, grandes mudanças" subtitle="Rastreador de 30 dias e páginas semanais de reflexão para acompanhar sua jornada também no papel." />
      <ContentPage title="Diário de hábitos" orientation="landscape">
        <Text style={s.h1}>Rastreador de 30 dias</Text>
        <Text style={[s.small, { marginBottom: 8 }]}>Pinte o quadradinho a cada dia em que praticar o hábito. Dias em branco fazem parte — o importante é retomar. Use as linhas vazias para hábitos seus.</Text>
        <View style={{ borderWidth: 0.7, borderColor: C.line }}>
          <View style={{ flexDirection: "row", backgroundColor: C.mint }}>
            <Text style={{ width: 120, padding: 4, fontSize: 8, fontWeight: 800 }}>Hábito</Text>
            {Array.from({ length: 30 }, (_, i) => (
              <Text key={i} style={{ flex: 1, padding: 3, fontSize: 7, textAlign: "center", fontWeight: 700 }}>
                {i + 1}
              </Text>
            ))}
          </View>
          {habits.map((h, r) => (
            <View key={r} style={{ flexDirection: "row", borderTopWidth: 0.7, borderTopColor: C.line, height: 26 }}>
              <Text style={{ width: 120, padding: 5, fontSize: 8.5, fontWeight: 700 }}>{h}</Text>
              {Array.from({ length: 30 }, (_, i) => (
                <View key={i} style={{ flex: 1, borderLeftWidth: 0.5, borderLeftColor: C.line }} />
              ))}
            </View>
          ))}
        </View>
        <Text style={[s.small, { marginTop: 10 }]}>Humor do dia (1 a 5):</Text>
        <View style={{ flexDirection: "row", borderWidth: 0.7, borderColor: C.line, marginTop: 3 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <Text key={i} style={{ flex: 1, height: 22, borderLeftWidth: i ? 0.5 : 0, borderLeftColor: C.line, fontSize: 6, color: C.muted, padding: 2 }}>
              {i + 1}
            </Text>
          ))}
        </View>
      </ContentPage>
      {JOURNEY_WEEKS.map((w) => (
        <ContentPage key={w.week} title={`Reflexão · Semana ${w.week}`}>
          <Text style={s.eyebrow}>Semana {w.week}</Text>
          <Text style={s.h1}>{w.title}</Text>
          <Text style={[s.p, s.muted]}>Foco da semana: {w.focus}</Text>
          {WEEK_PROMPTS[w.week].map((q) => (
            <View key={q} style={{ marginBottom: 10 }} wrap={false}>
              <Text style={s.h3}>{q}</Text>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={s.line} />
              ))}
            </View>
          ))}
          <View style={s.card} wrap={false}>
            <Text style={{ fontWeight: 700, marginBottom: 4 }}>Pequenas conquistas da semana</Text>
            <Checks items={["", "", ""].map((_, i) => `Conquista ${i + 1}: ______________________________________________`)} />
          </View>
        </ContentPage>
      ))}
    </Doc>
  );
}

// ───────── 7. Guia de exercícios ─────────
function GuiaExercicios({ exercises }: PdfContent) {
  return (
    <Doc title="Guia de exercícios">
      <Cover eyebrow="Guia de exercícios" title="Movimento leve, feito em casa" subtitle="Exercícios de baixo impacto para iniciantes, com passo a passo, adaptações e cuidados de segurança." />
      <ContentPage title="Guia de exercícios">
        <Text style={s.h1}>Antes de começar</Text>
        <View style={s.cardGold}>
          <Bullets items={GENERAL_SAFETY} />
        </View>
        <Text style={s.h2}>Como usar este guia</Text>
        <Bullets
          items={[
            "Comece pelos níveis “Muito leve” e avance aos poucos, conforme se sentir confortável.",
            "Use a percepção de esforço de 0 a 10: a maior parte das atividades deve ficar entre 3 e 5 — dá para conversar, mas você sente que está se exercitando.",
            "Use roupas confortáveis, calçado com boa aderência e um espaço livre de obstáculos.",
            "Respire de forma contínua; não prenda a respiração durante os movimentos.",
            "Uma referência geral da Organização Mundial da Saúde para adultos é acumular ao menos 150 minutos de atividade moderada por semana, incluindo fortalecimento em dois ou mais dias — construa isso aos poucos.",
          ]}
        />
        <Text style={s.h2}>Sugestão de semana-modelo</Text>
        <Bullets
          items={[
            "Segunda, quarta e sexta: caminhada de 15 a 30 minutos + alongamento de panturrilha.",
            "Terça e sábado: circuito de fortalecimento (sentar e levantar, flexão na parede, ponte de glúteos, elevação de calcanhares).",
            "Quinta: mobilidade e alongamentos.",
            "Domingo: relaxamento e descanso ativo.",
          ]}
        />
      </ContentPage>
      {EXERCISE_CATEGORIES.map((c) => (
        <ContentPage key={c.id} title={`Exercícios · ${c.label}`}>
          <Text style={s.eyebrow}>Categoria</Text>
          <Text style={s.h1}>{c.label}</Text>
          <Text style={[s.p, s.muted]}>{c.description}</Text>
          {exercises
            .filter((e) => e.category === c.id)
            .map((e) => (
              <View key={e.slug} style={{ marginBottom: 12, paddingBottom: 10, borderBottomWidth: 0.6, borderBottomColor: C.line }} wrap={false}>
                <Text style={[s.h2, { marginTop: 4 }]}>{e.name}</Text>
                <Text style={s.small}>
                  Nível: {e.level} · Duração sugerida: {e.duration}
                </Text>
                <Text style={[s.p, { marginTop: 3 }]}>{e.summary}</Text>
                <Bullets numbered items={e.steps} />
                <Text style={[s.small, { marginTop: 4 }]}>Adaptações: {e.adaptations.join(" ")}</Text>
                <Text style={s.small}>Cuidados: {e.safety.join(" ")}</Text>
              </View>
            ))}
        </ContentPage>
      ))}
    </Doc>
  );
}

export function materialDocument(slug: MaterialSlug, content: PdfContent) {
  switch (slug) {
    case "guia-inicial":
      return <GuiaInicial {...content} />;
    case "calendario-30-dias":
      return <Calendario {...content} />;
    case "livro-de-receitas":
      return <Receitas {...content} />;
    case "planner-semanal":
      return <Planner {...content} />;
    case "lista-de-compras":
      return <ListaCompras {...content} />;
    case "diario-de-habitos":
      return <DiarioHabitos />;
    case "guia-de-exercicios":
      return <GuiaExercicios {...content} />;
  }
}

// ───────── Exportação do cardápio pessoal ─────────
export function MealPlanDocument({ weekLabel, slots, recipes }: { weekLabel: string; slots: MealSlots; recipes: Recipe[] }) {
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const planned = [...new Set(Object.values(slots))].map((s2) => bySlug.get(s2)).filter((r): r is Recipe => Boolean(r));
  const agg = aggregateIngredients(planned);
  return (
    <Doc title="Meu cardápio semanal">
      <ContentPage title="Meu cardápio semanal">
        <Text style={s.eyebrow}>Cardápio semanal</Text>
        <Text style={s.h1}>Semana de {weekLabel}</Text>
        <PlannerTable fill={(day, meal) => bySlug.get(slots[`${day}:${meal}`] ?? "")?.title ?? "—"} />
        <Text style={[s.small, { marginTop: 8 }]}>Ferramenta educativa e organizacional. Não substitui orientação de nutricionista.</Text>
        {agg.length ? (
          <View break>
            <Text style={s.h1}>Lista de compras da semana</Text>
            {SHOPPING_SECTIONS.map((sec) => {
              const items = agg.filter((a) => a.section === sec);
              if (!items.length) return null;
              return (
                <View key={sec} style={{ marginBottom: 6 }}>
                  <Text style={[s.h3, { color: C.emerald }]}>{sec}</Text>
                  {items.map((a) => (
                    <View key={a.item} style={{ flexDirection: "row", marginBottom: 2 }} wrap={false}>
                      <View style={s.box} />
                      <Text style={{ flex: 1, fontSize: 9.5 }}>
                        {a.item} — <Text style={s.small}>{a.uses.map((u) => `${u.qty} (${u.recipe})`).join("; ")}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}
      </ContentPage>
    </Doc>
  );
}
