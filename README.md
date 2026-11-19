# Vida Leve 30 — Sua jornada de bem-estar

Plataforma digital premium de 30 dias com página de vendas, área de membros, 50 receitas, biblioteca de exercícios, cardápio semanal, rastreador de hábitos, diário, conquistas, 7 PDFs gerados automaticamente e painel administrativo.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · componentes no padrão shadcn/ui (Radix) · Lucide · Motion · Supabase (Auth + Postgres + RLS + Storage) · Recharts · @react-pdf/renderer · Vercel.

---

## Sumário

1. [O que está pronto](#1-o-que-está-pronto)
2. [Estrutura do projeto](#2-estrutura-do-projeto)
3. [Rodando localmente](#3-rodando-localmente)
4. [Configurando o Supabase](#4-configurando-o-supabase)
5. [Publicando no GitHub](#5-publicando-no-github)
6. [Deploy na Vercel](#6-deploy-na-vercel)
7. [Checkout e webhooks](#7-checkout-e-webhooks)
8. [Meta Pixel, GA4 e UTMify](#8-meta-pixel-ga4-e-utmify)
9. [Segurança e LGPD](#9-segurança-e-lgpd)
10. [Testes](#10-testes)
11. [Integrações pendentes](#11-integrações-pendentes)

---

## 1. O que está pronto

| Área | Rota | Funcionalidades |
|---|---|---|
| Página de vendas | `/` | Hero, como funciona, 6 cards, carrossel com **capturas reais** das telas, para quem é, oferta (R$ 29,90), FAQ, rodapé com contato configurável, CTA fixo no celular |
| Autenticação | `/login`, `/cadastro`, `/recuperar-senha`, `/nova-senha`, `/auth/callback` | E-mail e senha (Supabase Auth), confirmação por e-mail, recuperação de senha |
| Acesso pendente | `/acesso-pendente` | Exibida para quem tem conta mas ainda não tem pagamento confirmado |
| Dashboard | `/app` | Dia atual, % concluído, barra dos 30 dias, calendário semanal, próxima atividade, receita sugerida, hábitos de hoje, conquistas, “CONTINUAR MINHA JORNADA” |
| Jornada | `/app/jornada`, `/app/dia/[1-30]` | 30 dias originais em 4 semanas: objetivo, explicação, atividade adaptável, alimentação, hábito, mensagem, checklist, “CONCLUIR DIA”, revisão de dias anteriores |
| Receitas | `/app/receitas`, `/app/receitas/[slug]` | 50 receitas (10 por categoria), filtros por categoria/tempo/ingredientes (sem acento), favoritos, alergênicos, substituições, envio para a lista de compras |
| Exercícios | `/app/exercicios`, `/app/exercicios/[slug]` | 24 exercícios em 6 categorias, ilustrações originais, passo a passo, adaptações, cuidados e avisos de segurança; campo para vídeo licenciado |
| Cardápio | `/app/cardapio` | Semana × 4 refeições, escolher/substituir/remover, sugestão automática, copiar semana anterior, gerar lista de compras, **exportar PDF** |
| Lista de compras | `/app/compras` | Itens agrupados por seção do mercado, marcar, adicionar manualmente, limpar, imprimir |
| Hábitos | `/app/habitos` | Checklist diário (inclusive dias anteriores), personalização (até 10), calendário mensal, evolução semanal, sequência atual/melhor, % dos últimos 7 dias — sem penalização |
| Diário | `/app/diario` | Humor, energia, sono, conquistas, reflexões, observações; gráfico semanal; privado |
| Progresso | `/app/progresso` | Anel de progresso, semanas, indicadores, gráficos de hábitos e bem-estar, 10 conquistas |
| Materiais | `/app/materiais` | 7 PDFs gerados sob demanda (capa, paginação, conteúdo real) + PDFs extras enviados pelo admin |
| Perfil | `/app/perfil` | Nome, data de início, alterar senha, exportar dados (JSON), recomeçar jornada, excluir conta |
| Admin | `/admin/*` | Visão geral, usuárias e acessos (liberar/revogar/promover), transações e webhooks, receitas, exercícios, 30 dias, PDFs, imagens, oferta/checkout/garantia/suporte, status das integrações |
| Legal | `/termos`, `/privacidade` | Termos de Uso e Política de Privacidade (LGPD), banner de consentimento de cookies |

**Modo demonstração:** sem Supabase configurado, a plataforma funciona com os dados salvos no navegador (ativo automaticamente em `npm run dev`; em produção apenas com `NEXT_PUBLIC_DEMO_MODE=true`). Em produção sem Supabase e sem esse modo, `/app` e `/admin` ficam bloqueados.

## 2. Estrutura do projeto

```
src/
  app/
    page.tsx                 Página de vendas
    app/…                    Área de membros (protegida)
    admin/…                  Painel administrativo + actions.ts (server actions com verificação de admin)
    api/webhooks/[provider]  Webhook de pagamento (idempotente, assinatura validada)
    api/materiais/[slug]     Geração dos PDFs (somente com acesso)
    api/cardapio/pdf         Exportação do cardápio pessoal
    api/conta/exportar       Exportação de dados (LGPD)
  components/                ui/ (shadcn-like), app/, landing/, admin/, brand/ (logo e ilustrações), tracking/
  lib/
    content/                 Conteúdo original: journey.ts, recipes.ts, exercises.ts, achievements.ts…
    data/                    Camada de dados (Supabase ou navegador) + estatísticas
    checkout/adapters.ts     Adaptadores Cakto / genérico / Perfect Pay (pendente)
    tracking/                Pixel/GA4/UTMify no navegador e Purchase no servidor
    pdf/                     Documentos PDF
  proxy.ts                   Renovação de sessão e proteção de /app e /admin (Next 16 “proxy”)
supabase/migrations/         Esquema, RLS, gatilhos e processamento de pagamentos
tests/                       Vitest: conteúdo, banco/RLS (PGlite), webhooks, PDFs
scripts/e2e.mjs              Testes ponta a ponta no Chrome
scripts/screens.mjs          Captura das telas reais usadas no carrossel
```

O conteúdo padrão fica no código (`src/lib/content`). Quando o admin edita ou cria receitas, exercícios ou dias, os registros do banco **substituem** o padrão (veja `src/lib/content/server.ts`).

## 3. Rodando localmente

Requisitos: Node.js 20.9+ (testado com 22).

```bash
npm install
cp .env.example .env.local   # pode deixar vazio para usar o modo demonstração
npm run dev                  # http://localhost:3000
```

Comandos: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run check` (tudo junto), `npm run test:e2e`, `npm run screens`.

## 4. Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (região São Paulo, se disponível).
2. **SQL Editor → New query**: cole e execute, nesta ordem:
   - `supabase/migrations/20261119000001_schema.sql`
   - `supabase/migrations/20261119000002_payments.sql`
   
   (ou, com a CLI: `supabase link --project-ref SEU_REF && supabase db push`)
3. **Project Settings → API**: copie `Project URL`, `anon public` e `service_role` para as variáveis `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.
4. **Authentication → URL Configuration**:
   - Site URL: `https://seu-dominio.com.br`
   - Redirect URLs: `https://seu-dominio.com.br/auth/callback` (e `http://localhost:3000/auth/callback` para desenvolvimento)
5. **Authentication → Providers → Email**: mantenha “Confirm email” ativado. Recomendado: configure um SMTP próprio (Authentication → Emails → SMTP) — o SMTP padrão do Supabase tem limite baixo de envios. Personalize os modelos de e-mail em português.
6. **Crie sua conta de administradora**: cadastre-se em `/cadastro` e depois, no SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
   ```
   Administradoras têm acesso total ao app sem precisar de compra. Novas admins podem ser promovidas pelo painel `/admin/usuarios`.

As migrações criam: tabelas, **Row Level Security** em todas as tabelas, buckets de Storage (`imagens` público e `materiais` privado), gatilho que cria perfil e hábitos padrão no cadastro, vínculo automático de compras feitas antes do cadastro (pelo e-mail) e a função atômica `process_payment_event`.

## 5. Publicando no GitHub

```bash
git init            # (o projeto já vem com um commit inicial)
git add .
git commit -m "Vida Leve 30"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/vida-leve-30.git
git push -u origin main
```

O `.gitignore` já exclui `.env*`, `node_modules` e `.next`. Nunca faça commit de `.env.local`.

## 6. Deploy na Vercel

1. Em [vercel.com/new](https://vercel.com/new), importe o repositório. Framework: **Next.js** (detectado automaticamente). Não altere os comandos de build.
2. Em **Settings → Environment Variables**, cadastre as variáveis do `.env.example` (Production e Preview). Obrigatórias: `NEXT_PUBLIC_SITE_URL`, as três do Supabase e `NEXT_PUBLIC_CHECKOUT_URL` (ou configure no admin).
3. Faça o deploy. Em **Settings → Domains**, conecte seu domínio e atualize `NEXT_PUBLIC_SITE_URL` e as URLs do Supabase (passo 4.4).
4. Faça um teste completo: cadastro → acesso pendente → webhook de teste → acesso liberado.

Observação: as variáveis `NEXT_PUBLIC_*` são embutidas no build; ao alterá-las, faça um novo deploy.

## 7. Checkout e webhooks

**Fluxo:** botão de compra → checkout externo (com UTMs preservadas) → provedor envia webhook → `/api/webhooks/{provedor}` valida o segredo/assinatura → registra o evento em `webhook_events` (único por provedor+evento: duplicados são ignorados) → `process_payment_event` atualiza o pedido e o acesso numa transação → na **primeira** confirmação de pagamento, o servidor envia `Purchase` para Meta CAPI/GA4.

- **Reembolso, chargeback e cancelamento** revogam o acesso automaticamente. Um “pago” que chegue depois de um reembolso **não** reativa o acesso.
- A usuária pode comprar antes ou depois de criar a conta: o acesso é vinculado pelo e-mail.
- Histórico completo em `/admin/pedidos`. Liberação manual em `/admin/usuarios`.
- Nenhum pagamento é simulado. Para testar, use o envio de evento de teste do provedor ou o formato genérico em um ambiente de testes.

### Cakto
1. No painel da Cakto, crie um webhook (Integrações → Webhooks) com a URL `https://seu-dominio.com.br/api/webhooks/cakto` e os eventos `purchase_approved`, `purchase_refused`, `refund`, `chargeback` e `subscription_canceled`.
2. Copie o **secret** do webhook para `CAKTO_WEBHOOK_SECRET`.
3. Use “Enviar evento de teste” e confira em `/admin/pedidos`. O adaptador segue o formato publicado na documentação da Cakto (`{ secret, event, data: { id, customer: { email, name }, amount, … } }`); **valide com um evento real de teste antes de vender**. Ajustes, se necessários, ficam em `src/lib/checkout/adapters.ts`.
4. Copie o link do checkout para `/admin/configuracoes` (ou `NEXT_PUBLIC_CHECKOUT_URL`).

### Formato genérico (qualquer provedor ou automação própria)
`POST /api/webhooks/generic` com:
```
x-vl30-timestamp: 1763571234                      (segundos Unix; tolerância de 5 min)
x-vl30-signature: sha256=<HMAC_SHA256(GENERIC_WEBHOOK_SECRET, "<timestamp>.<corpo>")>
```
```json
{ "id": "evt_123", "type": "order.paid",
  "order": { "id": "pedido_123", "status": "paid", "amount_cents": 2990,
             "customer": { "email": "cliente@exemplo.com", "name": "Cliente" } },
  "utm": { "utm_source": "meta", "utm_campaign": "lancamento" } }
```
`status` aceita: `pending`, `paid`, `refused`, `refunded`, `chargeback`, `canceled`.

### Perfect Pay
Pendente — veja a seção 11.

## 8. Meta Pixel, GA4 e UTMify

- Scripts são carregados **somente após consentimento** no banner de cookies e **nunca** na área de membros/admin.
- Eventos no navegador: `PageView` (por página), `ViewContent` (quando a oferta aparece) e `InitiateCheckout` (no clique do botão de compra). Cada um é deduplicado por sessão.
- `Purchase` é enviado **apenas pelo servidor**, após pagamento confirmado, uma única vez por pedido (`orders.purchase_tracked_at`), com `event_id = purchase_<id>` (Meta CAPI) e `transaction_id` (GA4 Measurement Protocol).
- UTMs (`utm_*`, `src`, `sck`, `xcod`, `fbclid`, `gclid`) são sempre repassadas ao checkout; só ficam salvas entre visitas com consentimento.
- Nenhum dado de saúde, diário ou hábitos é enviado para plataformas de anúncio.

## 9. Segurança e LGPD

- Supabase Auth (senhas com hash; nunca em texto simples), sessões em cookies httpOnly via `@supabase/ssr`.
- RLS em todas as tabelas: cada usuária lê/escreve somente os próprios dados e só grava com acesso ativo; conteúdo pago só é lido por quem tem acesso; pedidos e webhooks só por admins.
- Papel de admin verificado no servidor em cada página (`requireAdmin`) e em cada server action (`assertAdmin`), além de RLS. Uma usuária não consegue se promover (gatilho `protect_profile_role`).
- Validação de entradas com Zod (actions, APIs, webhooks); limites de tamanho também no banco.
- Proteção contra redirecionamento aberto, cabeçalhos de segurança, `noindex` em áreas privadas.
- LGPD: política de privacidade, consentimento de cookies, exportação de dados (`/api/conta/exportar`) e exclusão de conta (`delete_my_account`).

## 10. Testes

Relatório completo em [`TESTES.md`](./TESTES.md).

```bash
npm test             # 42 testes: conteúdo, filtros, banco/RLS/pagamentos (PGlite), webhooks, PDFs
npm run build && NEXT_PUBLIC_DEMO_MODE=true npm start   # em outro terminal:
BASE_URL=http://localhost:3000 npm run test:e2e        # 20 etapas no Chrome
```

Para recapturar as telas do carrossel após mudanças visuais: suba o app em modo demonstração e rode `BASE_URL=http://localhost:3000 npm run screens`.

## 11. Integrações pendentes

| Item | Situação | O que fazer |
|---|---|---|
| Credenciais do Supabase | Pendente (não fornecidas) | Seção 4. Até lá a plataforma roda em modo demonstração |
| Checkout Cakto | Adaptador implementado conforme documentação pública | Criar webhook, definir `CAKTO_WEBHOOK_SECRET`, validar com evento de teste |
| Perfect Pay | **Não implementado** | Não foi possível confirmar na documentação pública o formato do postback e o método de validação. Com acesso ao painel, implemente `perfectPayAdapter` em `src/lib/checkout/adapters.ts` seguindo o modelo da Cakto (ou use o formato genérico via automação) |
| Meta Pixel / CAPI | Pronto, aguardando IDs | `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` |
| GA4 | Pronto, aguardando IDs | `NEXT_PUBLIC_GA4_ID`, `GA4_API_SECRET` |
| UTMify | Pronto, aguardando dados do painel | `NEXT_PUBLIC_UTMIFY_PIXEL_ID` e `NEXT_PUBLIC_UTMIFY_SCRIPT_URL` (copie exatamente do painel). Para atribuição de vendas, conecte o checkout diretamente à UTMify pela integração nativa do provedor |
| Fotografias reais | Pendente | As receitas usam ilustrações originais geradas por código. Envie fotos licenciadas em `/admin/imagens` e cole a URL em cada receita. Para a foto do hero, adicione `public/images/hero.jpg` (é usada automaticamente) |
| Vídeos de exercícios | Pendente | Cadastre URLs de vídeos licenciados e validados em `/admin/exercicios` |
| Informações nutricionais | Intencionalmente omitidas | Exibir somente após cálculo com base validada (ex.: TACO/TBCA) e metodologia documentada |
| Garantia | Desativada | Ative em `/admin/configuracoes` apenas com as condições reais |
| Dados da empresa e suporte | Pendente | `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_COMPANY_DOCUMENT` e contato em `/admin/configuracoes` (aparecem nos termos e no rodapé) |
| SMTP de e-mails | Recomendado | Configurar SMTP próprio no Supabase para confirmação e recuperação de senha |
| Revisão jurídica | Recomendado | Revisar Termos e Política de Privacidade com advogado(a) |

> Conteúdo educativo: o programa não substitui orientação médica, nutricional ou de educação física. Recomenda-se revisão dos textos de saúde por profissional habilitado antes do lançamento.
