/**
 * Captura telas REAIS da plataforma (modo demonstração com dados de exemplo)
 * para o carrossel da página de vendas. Saída: public/screens/*.png
 * Uso: BASE_URL=http://localhost:3100 node scripts/screens.mjs
 */
import puppeteer from "puppeteer-core";
import { mkdtempSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
};

function seed() {
  const habits = [
    ["h1", "Movimento", "Me movimentar pelo menos 10 minutos", "Footprints"],
    ["h2", "Hidratação", "Manter a garrafa de água por perto e beber ao longo do dia", "Droplets"],
    ["h3", "Sono", "Deitar no horário que escolhi", "Moon"],
    ["h4", "Planejamento alimentar", "Saber o que vou comer nas principais refeições", "Salad"],
    ["h5", "Pausas e autocuidado", "Fazer uma pausa só para mim", "Heart"],
  ].map(([id, label, goal, icon], i) => ({ id, label, goal, icon, position: i, active: true }));
  const pattern = [5, 4, 3, 5, 0, 4, 5, 3, 4, 5, 2, 4, 5, 4, 3, 5, 4, 0, 3, 4, 5];
  const habitLogs = {};
  pattern.forEach((n, i) => {
    if (n) habitLogs[iso(day(-(pattern.length - 1) + i - 1))] = habits.slice(0, n).map((h) => h.id);
  });
  habitLogs[iso(day(0))] = ["h1", "h2"];
  const days = {};
  for (let d = 1; d <= 8; d++) days[d] = { checklist: [0, 1, 2], completedAt: day(-9 + d).toISOString() };
  days[9] = { checklist: [0], completedAt: null };
  const journal = {};
  [[4, 3, 3], [3, 3, 4], [4, 4, 4], [5, 4, 3], [4, 5, 4], [4, 4, 5]].forEach(([m, e, s], i) => {
    const k = iso(day(-6 + i));
    journal[k] = { date: k, mood: m, energy: e, sleep: s, reflection: "", wins: "Caminhada e água ao longo do dia", notes: "" };
  });
  return {
    profile: { name: "Ana", email: "demo@vidaleve30.local", journeyStartedAt: iso(day(-9)), reminderOptIn: false },
    days,
    favorites: ["mingau-de-aveia-com-banana-e-canela", "frango-grelhado-com-legumes-assados", "sorvete-de-banana", "creme-de-abobora-com-gengibre"],
    habits,
    habitLogs,
    journal,
    mealPlans: {},
    shopping: [],
  };
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"], userDataDir: mkdtempSync("/tmp/screens-") });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const data = seed();
await page.evaluateOnNewDocument((d) => {
  localStorage.setItem("vl30-demo-v1", JSON.stringify(d));
  localStorage.setItem("vl30-consent", "denied");
}, data);
const css = `nextjs-portal{display:none!important} [data-demo-banner]{display:none!important} [data-sonner-toaster]{display:none!important} *{animation-duration:0s!important;transition-duration:0s!important}`;

const shots = [
  ["dashboard", "/app"],
  ["receitas", "/app/receitas"],
  ["jornada", "/app/jornada"],
  ["exercicios", "/app/exercicios", "Caminhada"],
  ["calendario", "/app/habitos", "Calendário de conclusão"],
  ["progresso", "/app/progresso"],
];
for (const [name, path, scrollTo] of shots) {
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.addStyleTag({ content: css });
  await new Promise((r) => setTimeout(r, 1800));
  if (scrollTo) {
    await page.evaluate((t) => {
      const el = [...document.querySelectorAll("h2")].find((h) => h.textContent.includes(t));
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 84);
    }, scrollTo);
    await new Promise((r) => setTimeout(r, 900));
  }
  await page.screenshot({ path: `public/screens/${name}.png` });
  console.log("ok", name);
}
await browser.close();
