/**
 * Testes ponta a ponta no Chrome (modo demonstração).
 * Uso: BASE_URL=http://localhost:3100 node scripts/e2e.mjs
 * Requer um build com NEXT_PUBLIC_DEMO_MODE=true e NEXT_PUBLIC_CHECKOUT_URL de teste.
 */
import puppeteer from "puppeteer-core";
import { mkdtempSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const CHROME = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
const results = [];
const consoleErrors = [];

function step(name, fn) {
  return fn()
    .then(() => results.push({ name, ok: true }))
    .catch((e) => results.push({ name, ok: false, error: String(e?.message ?? e).slice(0, 300) }));
}
const assert = (c, m) => {
  if (!c) throw new Error(m);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"], userDataDir: mkdtempSync("/tmp/e2e-chrome-") });

async function newPage(mobile = true, isolated = false) {
  const page = isolated ? await (await browser.createBrowserContext()).newPage() : await browser.newPage();
  await page.setViewport(mobile ? { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { width: 1366, height: 900 });
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) consoleErrors.push(`${page.url()} :: ${m.text()}`);
  });
  page.on("pageerror", (e) => consoleErrors.push(`${page.url()} :: ${e.message}`));
  const orig = page.goto.bind(page);
  page.goto = async (u, o) => {
    const r = await orig(u, o);
    await sleep(700);
    return r;
  };
  return page;
}
const clickText = async (page, selector, text) => {
  const ok = await page.evaluate(
    (sel, t) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.textContent?.trim().includes(t));
      if (el) el.click();
      return Boolean(el);
    },
    selector,
    text,
  );
  assert(ok, `Elemento "${text}" não encontrado`);
};
const text = (page) => page.evaluate(() => document.body.innerText.toLowerCase().replace(/\u00a0/g, " "));

// ───────── Página de vendas ─────────
await step("Landing: carrega, título, seções e FAQ", async () => {
  const p = await newPage();
  const res = await p.goto(BASE + "/", { waitUntil: "load" });
  assert(res.status() === 200, "status " + res.status());
  const t = await text(p);
  for (const s of ["Uma vida mais leve começa com", "QUERO COMEÇAR MEUS 30 DIAS", "Como funciona?", "O que está incluído?", "Conheça a plataforma por dentro", "Para quem é?", "QUERO GARANTIR MEU ACESSO", "Perguntas frequentes", "Termos de Uso", "Política de Privacidade", "R$ 29,90"])
    assert(t.includes(s.toLowerCase()), "faltando: " + s);
  assert(!/depoimento|avaliações|\d+\.\d{3} alunas/i.test(t), "conteúdo inventado encontrado");
  await p.close();
});

await step("Landing: consentimento + UTMs preservados no checkout + InitiateCheckout sem duplicar", async () => {
  const p = await newPage(true, true);
  await p.evaluateOnNewDocument(() => {
    window.fbq = (...a) => {
      const arr = JSON.parse(sessionStorage.getItem("__ev") || "[]");
      arr.push(a[1]);
      sessionStorage.setItem("__ev", JSON.stringify(arr));
    };
  });
  await p.setRequestInterception(true);
  let checkoutUrl = "";
  p.on("request", (r) => {
    if (r.url().startsWith("https://pay.exemplo.com")) {
      checkoutUrl = r.url();
      r.abort();
    } else if (!r.url().startsWith(BASE)) r.abort();
    else r.continue();
  });
  await p.goto(BASE + "/?utm_source=meta&utm_campaign=lancamento&utm_content=video1&fbclid=abc123", { waitUntil: "load" });
  await clickText(p, "button", "Aceitar todos");
  await sleep(300);
  await p.$eval('[data-placement="hero"]', (b) => b.click());
  await sleep(1000);
  assert(checkoutUrl.includes("utm_source=meta") && checkoutUrl.includes("utm_campaign=lancamento") && checkoutUrl.includes("fbclid=abc123"), "UTMs não preservados: " + checkoutUrl);
  // Nova visita sem UTMs na URL: UTMs continuam preservados (consentimento dado) e o evento não duplica na sessão
  checkoutUrl = "";
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.$eval('[data-placement="offer"]', (b) => b.click());
  await sleep(1000);
  assert(checkoutUrl.includes("utm_campaign=lancamento"), "UTMs não preservados na segunda visita: " + checkoutUrl);
  await p.goto(BASE + "/termos", { waitUntil: "load" });
  const evs = await p.evaluate(() => JSON.parse(sessionStorage.getItem("__ev") || "[]"));
  const ic = evs.filter((e) => e === "InitiateCheckout").length;
  assert(ic === 1, "InitiateCheckout disparado " + ic + " vezes (esperado 1)");
  assert(evs.includes("PageView"), "PageView não registrado");
  await p.close();
});

await step("Landing: recusar cookies não carrega pixels", async () => {
  const p = await newPage(true, true);
  const ext = [];
  await p.setRequestInterception(true);
  p.on("request", (r) => {
    if (!r.url().startsWith(BASE) && !r.url().startsWith("data:")) ext.push(r.url());
    r.continue();
  });
  await p.goto(BASE + "/", { waitUntil: "load" });
  await clickText(p, "button", "Somente essenciais");
  await sleep(500);
  assert(!ext.some((u) => /facebook|googletagmanager|utmify/.test(u)), "pixel carregado sem consentimento");
  await p.close();
});

// ───────── Área de membros ─────────
const page = await newPage();

await step("Login demo → dashboard", async () => {
  await page.goto(BASE + "/login", { waitUntil: "load" });
  await clickText(page, "button", "Entrar no modo demonstração");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("continuar minha jornada"), { timeout: 15000 });
  const t = await text(page);
  for (const s of ["Seu próximo passo para uma vida mais leve começa hoje!", "Dia 1 de 30", "Hábitos de hoje", "Próxima atividade", "Receita sugerida", "Conquistas desbloqueadas"]) assert(t.includes(s.toLowerCase()), "faltando: " + s);
});

await step("Jornada: checklist, concluir dia, conquista e persistência", async () => {
  await page.goto(BASE + "/app/dia/1", { waitUntil: "load" });
  await page.waitForSelector('[role="checkbox"]');
  await page.click('[role="checkbox"]');
  await sleep(300);
  const checked = await page.$$eval('[role="checkbox"][aria-checked="true"]', (e) => e.length);
  assert(checked === 1, "checklist não marcou");
  await clickText(page, "button", "CONCLUIR DIA");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("dia 1 concluído!"));
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("conquista desbloqueada"), { timeout: 5000 });
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("dia concluído! excelente trabalho."));
  await page.goto(BASE + "/app", { waitUntil: "load" });
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("dia 2 de 30"));
  assert((await text(page)).includes("primeiro passo"), "conquista não aparece no dashboard");
});

await step("Jornada: revisar dia anterior e navegar entre dias", async () => {
  await page.goto(BASE + "/app/jornada", { waitUntil: "load" });
  const t = await text(page);
  assert(t.includes("semana 4") && t.includes("começando com leveza"), "semanas ausentes");
  await page.goto(BASE + "/app/dia/30", { waitUntil: "load" });
  assert((await text(page)).includes("uma vida mais leve"), "dia 30");
  await page.goto(BASE + "/app/dia/31", { waitUntil: "load" });
  assert((await text(page)).includes("página não encontrada"), "dia 31 deveria exibir página não encontrada");
});

await step("Receitas: filtros por categoria, tempo e ingrediente; favoritos", async () => {
  await page.goto(BASE + "/app/receitas", { waitUntil: "load" });
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("50 receitas encontradas"));
  await clickText(page, "button", "Sobremesa");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("10 receitas encontradas"));
  await clickText(page, "button", "Todas");
  await page.type('input[type="search"]', "abobora");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("creme de abóbora com gengibre"));
  await page.select("select", "10");
  await page.waitForFunction(() => /receita(s)? encontrada/i.test(document.body.innerText));
  await clickText(page, "button", "Limpar");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("50 receitas encontradas"));
  await page.$eval('button[aria-label^="Favoritar"]', (b) => b.click());
  await sleep(300);
  await clickText(page, "button", "Favoritas (1)");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("1 receita encontrada"));
});

await step("Receita: detalhe, alergênicos e lista de compras", async () => {
  await page.goto(BASE + "/app/receitas/panqueca-de-banana-e-aveia", { waitUntil: "load" });
  const t = await text(page);
  for (const s of ["Ingredientes", "Modo de preparo", "Substituições", "Possíveis alergênicos", "Ovos", "Informações nutricionais não são exibidas"]) assert(t.includes(s.toLowerCase()), "faltando " + s);
  for (let i = 0; i < 3; i++) {
    await clickText(page, "button", "Adicionar à lista de compras");
    const ok = await page.waitForFunction(() => /itens adicionados|já estão/i.test(document.body.innerText), { timeout: 4000 }).then(() => true, () => false);
    if (ok) break;
  }
  await page.goto(BASE + "/app/compras", { waitUntil: "load" });
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("aveia em flocos"), { timeout: 8000 });
  await page.$eval('[role="checkbox"]', (b) => b.click());
  await page.waitForFunction(() => /1 de \d+ itens no carrinho/i.test(document.body.innerText));
});

await step("Exercícios: biblioteca e detalhe com segurança", async () => {
  await page.goto(BASE + "/app/exercicios", { waitUntil: "load" });
  const t = await text(page);
  for (const s of ["Mobilidade", "Caminhada", "Alongamento", "Fortalecimento básico", "Relaxamento", "Exercícios sentados", "Sua segurança vem primeiro"]) assert(t.includes(s.toLowerCase()), "faltando " + s);
  await page.goto(BASE + "/app/exercicios/sentar-e-levantar-da-cadeira", { waitUntil: "load" });
  const d = await text(page);
  assert(d.includes("passo a passo") && d.includes("adaptações") && d.includes("cuidados") && d.includes("interrompa a atividade"), "detalhe incompleto");
});

await step("Cardápio: sugerir semana, gerar lista e exportar PDF", async () => {
  await page.goto(BASE + "/app/cardapio", { waitUntil: "load" });
  await clickText(page, "button", "Sugerir semana");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("28/28 refeições planejadas"));
  await page.$eval('button[aria-label^="Remover Almoço"]', (b) => b.click());
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("27/28"));
  await clickText(page, "button", "Gerar lista de compras");
  await page.waitForFunction(() => /itens adicionados|já estavam/i.test(document.body.innerText));
  const pdf = await page.evaluate(async () => {
    const r = await fetch("/api/cardapio/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weekStart: "2026-11-16", slots: { "0:cafe": "mingau-de-aveia-com-banana-e-canela" } }) });
    return { status: r.status, type: r.headers.get("content-type"), size: (await r.arrayBuffer()).byteLength };
  });
  assert(pdf.status === 200 && pdf.type === "application/pdf" && pdf.size > 5000, JSON.stringify(pdf));
  const bad = await page.evaluate(async () => (await fetch("/api/cardapio/pdf", { method: "POST", body: '{"weekStart":"x"}' })).status);
  assert(bad === 400, "validação de entrada falhou: " + bad);
});

await step("Hábitos: marcar, personalizar e estatísticas", async () => {
  await page.goto(BASE + "/app/habitos", { waitUntil: "load" });
  await page.waitForSelector('[role="checkbox"]');
  const boxes = await page.$$('[role="checkbox"]');
  await boxes[0].click();
  await boxes[1].click();
  await sleep(300);
  const t = await text(page);
  assert(t.includes("dias ativos") && t.includes("calendário de conclusão") && t.includes("evolução semanal"), "seções de hábitos");
  await clickText(page, "button", "Personalizar hábitos");
  await clickText(page, "button", "Novo hábito");
  await page.type("#h-label", "Leitura");
  await clickText(page, "button", "Salvar");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("hábito salvo"));
});

await step("Diário: registrar e ver na semana", async () => {
  await page.goto(BASE + "/app/diario", { waitUntil: "load" });
  await page.click('button[aria-label="Humor: Bom"]');
  await page.click('button[aria-label="Energia: Alta"]');
  await page.type("#wins", "Caminhei 10 minutos");
  await clickText(page, "button", "Salvar registro");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("registro salvo"));
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("caminhei 10 minutos"));
});

await step("Progresso e conquistas", async () => {
  await page.goto(BASE + "/app/progresso", { waitUntil: "load" });
  const t = await text(page);
  assert(t.includes("primeiro passo") && t.includes("jornada de 30 dias concluída") && t.includes("hábitos por semana"), "progresso");
});

await step("Materiais: os 7 PDFs baixam", async () => {
  await page.goto(BASE + "/app/materiais", { waitUntil: "load" });
  const out = await page.evaluate(async () => {
    const links = [...document.querySelectorAll('a[href^="/api/materiais/"][download]')].map((a) => a.getAttribute("href"));
    const r = [];
    for (const l of links) {
      const res = await fetch(l);
      const b = await res.arrayBuffer();
      r.push({ l, s: res.status, t: res.headers.get("content-type"), n: b.byteLength });
    }
    return r;
  });
  assert(out.length === 7, "esperado 7 links, achou " + out.length);
  for (const o of out) assert(o.s === 200 && o.t === "application/pdf" && o.n > 10000, JSON.stringify(o));
  const nf = await page.evaluate(async () => (await fetch("/api/materiais/nao-existe")).status);
  assert(nf === 404, "material inexistente deveria ser 404");
});

await step("Perfil: atualizar nome e exportar dados", async () => {
  await page.goto(BASE + "/app/perfil", { waitUntil: "load" });
  await page.$eval("#name", (e) => (e.value = ""));
  await page.type("#name", "Maria Helena");
  await clickText(page, "button", "Salvar alterações");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("perfil atualizado"));
  await page.goto(BASE + "/app", { waitUntil: "load" });
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("olá, maria!"));
});

await step("Navegação mobile: barra inferior e menu Mais", async () => {
  await page.goto(BASE + "/app", { waitUntil: "load" });
  const nav = await page.$$eval('nav[aria-label="Navegação rápida"] a, nav[aria-label="Navegação rápida"] button', (e) => e.map((x) => x.textContent.trim()));
  assert(nav.join("|") === "Início|Jornada|Receitas|Hábitos|Mais", "nav: " + nav.join("|"));
  await clickText(page, 'nav[aria-label="Navegação rápida"] button', "Mais");
  await page.waitForSelector('[role="dialog"]');
  await clickText(page, '[role="dialog"] a', "Diário");
  await page.waitForFunction(() => location.pathname === "/app/diario");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!overflow, "overflow horizontal no mobile");
});

await step("Links internos sem quebra (todas as rotas)", async () => {
  const seen = new Set();
  const queue = ["/", "/app", "/termos", "/privacidade", "/login", "/cadastro", "/admin"];
  const broken = [];
  while (queue.length && seen.size < 160) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    const res = await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    if (!res || res.status() >= 400) broken.push(`${path} → ${res?.status()}`);
    const links = await page.$$eval("a[href^='/']", (a) => a.map((x) => x.getAttribute("href").split("#")[0].split("?")[0]));
    for (const l of links) if (l && !seen.has(l) && !l.startsWith("/api/")) queue.push(l);
  }
  assert(!broken.length, "quebrados: " + broken.join(", "));
  results.push({ name: `  (${seen.size} rotas verificadas)`, ok: true });
});

await step("Overflow horizontal: rotas principais em 360px", async () => {
  const p = await newPage();
  await p.setViewport({ width: 360, height: 740, isMobile: true, hasTouch: true });
  const bad = [];
  for (const r of ["/", "/app", "/app/jornada", "/app/dia/5", "/app/receitas", "/app/receitas/caldo-verde-leve", "/app/exercicios", "/app/cardapio", "/app/compras", "/app/habitos", "/app/diario", "/app/progresso", "/app/materiais", "/app/perfil", "/login", "/cadastro", "/admin"]) {
    await p.goto(BASE + r, { waitUntil: "load" });
    await sleep(300);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w > 361) bad.push(`${r}:${w}px`);
  }
  assert(!bad.length, bad.join(", "));
  await p.close();
});

await step("Webhook: provedor desconhecido 404, sem configuração 503, Perfect Pay 501", async () => {
  const r = await page.evaluate(async () => {
    const post = (p) => fetch(p, { method: "POST", body: JSON.stringify({ secret: "x", event: "purchase_approved", data: { id: "1", customer: { email: "a@b.com" } } }) }).then((x) => x.status);
    return [await post("/api/webhooks/xyz"), await post("/api/webhooks/cakto"), await post("/api/webhooks/perfectpay")];
  });
  assert(r.join() === "404,503,501", r.join());
});

await step("Cadastro: validação de formulário", async () => {
  await page.goto(BASE + "/cadastro", { waitUntil: "load" });
  await clickText(page, "button", "Criar minha conta");
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes("informe seu nome."));
  const t = await text(page);
  assert(t.includes("informe um e-mail válido.") && t.includes("pelo menos 8 caracteres") && t.includes("termos de uso e a política"), "mensagens de validação");
});

await browser.close();

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "✔" : "✘"} ${r.name}${r.ok ? "" : "\n    → " + r.error}`);
console.log(`\n${results.length - failed.length}/${results.length} etapas aprovadas`);
if (consoleErrors.length) {
  console.log(`\nErros de console (${consoleErrors.length}):`);
  for (const e of [...new Set(consoleErrors)].slice(0, 20)) console.log("  - " + e.slice(0, 300));
}
process.exit(failed.length || consoleErrors.length ? 1 : 0);
