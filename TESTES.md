# Relatório de testes — Vida Leve 30

Data: 19/11/2026 · Ambiente: Node 22, Next.js 16.4, Google Chrome (headless), PGlite (Postgres 18 em WASM).

## Resumo

| Verificação | Comando | Resultado |
|---|---|---|
| Instalação de dependências | `npm install` | ✅ 0 vulnerabilidades reportadas |
| TypeScript | `npm run typecheck` | ✅ sem erros |
| Lint | `npm run lint` | ✅ 0 erros, 0 avisos |
| Testes automatizados | `npm test` | ✅ 42/42 |
| Build de produção | `npm run build` | ✅ 42 rotas geradas |
| Ponta a ponta no Chrome (modo demonstração) | `npm run test:e2e` | ✅ 20/20 etapas, 0 erros de console |
| Proteção em produção sem Supabase | build sem `NEXT_PUBLIC_DEMO_MODE` | ✅ `/app` e `/admin` → 307 para `/login`; PDFs e exportação → 401 |

## Testes automatizados (Vitest)

**Banco de dados (tests/db.test.ts):** as migrações reais são executadas em um Postgres (PGlite) com stubs mínimos dos esquemas `auth` e `storage` do Supabase; os testes trocam de papel (`anon`, `authenticated`, admin) para verificar as políticas RLS de verdade.

```
✓ tests/pdf.test.ts > materiais em PDF > gera guia-inicial 505ms
✓ tests/pdf.test.ts > materiais em PDF > gera calendario-30-dias 387ms
✓ tests/pdf.test.ts > materiais em PDF > gera livro-de-receitas 1263ms
✓ tests/pdf.test.ts > materiais em PDF > gera planner-semanal 192ms
✓ tests/pdf.test.ts > materiais em PDF > gera lista-de-compras 303ms
✓ tests/pdf.test.ts > materiais em PDF > gera diario-de-habitos 296ms
✓ tests/pdf.test.ts > materiais em PDF > gera guia-de-exercicios 418ms
✓ tests/pdf.test.ts > materiais em PDF > livro contém todas as receitas 59ms
✓ tests/pdf.test.ts > materiais em PDF > exporta o cardápio pessoal 203ms
✓ tests/db.test.ts > migrações > cria perfil e hábitos padrão no cadastro 3ms
✓ tests/db.test.ts > migrações > sem compra, não há acesso e não é possível gravar progresso 6ms
✓ tests/db.test.ts > migrações > webhook pago libera acesso; duplicado é idempotente 8ms
✓ tests/db.test.ts > migrações > uma usuária não lê nem altera dados de outra 4ms
✓ tests/db.test.ts > migrações > usuária comum não acessa pedidos nem se promove a admin 3ms
✓ tests/db.test.ts > migrações > admin vê pedidos e gerencia conteúdo 3ms
✓ tests/db.test.ts > migrações > anônimo lê apenas configurações públicas 3ms
✓ tests/db.test.ts > migrações > reembolso revoga acesso e pagamento atrasado não reativa 4ms
✓ tests/db.test.ts > migrações > compra antes do cadastro é vinculada ao criar a conta 3ms
✓ tests/db.test.ts > migrações > exclusão de conta apaga dados pessoais em cascata 6ms
✓ tests/content.test.ts > receitas > tem 50 receitas, 10 por categoria, slugs únicos 2ms
✓ tests/content.test.ts > receitas > cada receita está completa 5ms
✓ tests/content.test.ts > receitas > alergênicos declarados batem com os ingredientes 2ms
✓ tests/content.test.ts > exercícios > cobre todas as categorias com pelo menos 4 0ms
✓ tests/content.test.ts > exercícios > tem passos, adaptações e cuidados 1ms
✓ tests/content.test.ts > jornada > tem 30 dias em ordem, 4 semanas 1ms
✓ tests/content.test.ts > jornada > conteúdo não se repete 0ms
✓ tests/content.test.ts > jornada > referências a receitas e exercícios existem 1ms
✓ tests/content.test.ts > lista de compras > agrega ingredientes por seção 9ms
✓ tests/content.test.ts > filtros de receitas > filtra por categoria 0ms
✓ tests/content.test.ts > filtros de receitas > filtra por tempo 0ms
✓ tests/content.test.ts > filtros de receitas > busca ingredientes sem acento e com vários termos 2ms
✓ tests/content.test.ts > filtros de receitas > filtra favoritas 0ms
✓ tests/webhooks.test.ts > adaptador genérico > aceita assinatura válida e normaliza 17ms
✓ tests/webhooks.test.ts > adaptador genérico > rejeita assinatura inválida 0ms
✓ tests/webhooks.test.ts > adaptador genérico > rejeita corpo adulterado 0ms
✓ tests/webhooks.test.ts > adaptador genérico > rejeita timestamp antigo (replay) 0ms
✓ tests/webhooks.test.ts > adaptador genérico > sem segredo configurado não processa 0ms
✓ tests/webhooks.test.ts > adaptador Cakto > compra aprovada vira paid 1ms
✓ tests/webhooks.test.ts > adaptador Cakto > reembolso e chargeback 1ms
✓ tests/webhooks.test.ts > adaptador Cakto > segredo errado é rejeitado 0ms
✓ tests/webhooks.test.ts > adaptador Cakto > eventos que não alteram acesso são ignorados 0ms
✓ tests/webhooks.test.ts > Perfect Pay > permanece pendente até a configuração 0ms
```

## Ponta a ponta (scripts/e2e.mjs)

Executado em Chrome headless, viewport de celular (390×844; overflow verificado em 360px), contra o build de produção em modo demonstração.

```
✔ Landing: carrega, título, seções e FAQ
✔ Landing: consentimento + UTMs preservados no checkout + InitiateCheckout sem duplicar
✔ Landing: recusar cookies não carrega pixels
✔ Login demo → dashboard
✔ Jornada: checklist, concluir dia, conquista e persistência
✔ Jornada: revisar dia anterior e navegar entre dias
✔ Receitas: filtros por categoria, tempo e ingrediente; favoritos
✔ Receita: detalhe, alergênicos e lista de compras
✔ Exercícios: biblioteca e detalhe com segurança
✔ Cardápio: sugerir semana, gerar lista e exportar PDF
✔ Hábitos: marcar, personalizar e estatísticas
✔ Diário: registrar e ver na semana
✔ Progresso e conquistas
✔ Materiais: os 7 PDFs baixam
✔ Perfil: atualizar nome e exportar dados
✔ Navegação mobile: barra inferior e menu Mais
✔   (160 rotas verificadas)
✔ Links internos sem quebra (todas as rotas)
✔ Overflow horizontal: rotas principais em 360px
✔ Webhook: provedor desconhecido 404, sem configuração 503, Perfect Pay 501
✔ Cadastro: validação de formulário
```

Cobertura: página de vendas, consentimento de cookies, preservação de UTMs no checkout, deduplicação de InitiateCheckout, login, conclusão de dia e persistência após recarregar, conquistas, filtros de receitas, favoritos, lista de compras, exercícios, cardápio (sugestão, remoção, lista, PDF, validação de entrada), hábitos (marcação e personalização), diário, progresso, download dos 7 PDFs, perfil, navegação inferior mobile, varredura de links internos (160 rotas, nenhum quebrado), webhooks (404/503/501) e validação do cadastro.

## PDFs gerados

| Material | Páginas |
|---|---|
| guia-inicial | 4 |
| calendario-30-dias | 4 |
| livro-de-receitas | 29 |
| planner-semanal | 3 |
| lista-de-compras | 5 |
| diario-de-habitos | 6 |
| guia-de-exercicios | 14 |

Verificados: assinatura `%PDF`, número mínimo de páginas, paginação “Página X de Y”, ausência de texto de exemplo (`lorem`, `TODO`, `undefined`, `NaN`, `null`), presença de todas as 50 receitas no livro e inspeção visual de capas e páginas internas.

## O que NÃO pôde ser testado neste ambiente

- **Supabase real** (autenticação por e-mail, sessões, Storage, envio de e-mails): não havia credenciais. O SQL foi validado em Postgres real (PGlite) incluindo RLS, gatilhos e pagamentos; a integração com o serviço deve ser testada após configurar o projeto (README, seção 4).
- **Webhook com banco**: a validação de assinatura e o processamento SQL foram testados separadamente; o fluxo completo HTTP → Supabase deve ser testado com o evento de teste do provedor.
- **Checkout Cakto real** e **Perfect Pay** (pendente).
- **Meta CAPI / GA4 Measurement Protocol / UTMify**: dependem de IDs e tokens.
