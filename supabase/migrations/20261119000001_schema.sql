-- ════════════════════════════════════════════════════════════════════
-- Vida Leve 30 — esquema principal
-- Execute no SQL Editor do Supabase (ou via `supabase db push`).
-- ════════════════════════════════════════════════════════════════════

-- gen_random_uuid() é nativo no Postgres 13+ (Supabase usa 15+).

-- ───────────── Perfis ─────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  journey_started_at date default current_date,
  reminder_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_email_idx on public.profiles (lower(email));

-- ───────────── Direitos de acesso (liberados por pagamento ou admin) ─────────────
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  status text not null check (status in ('active', 'refunded', 'chargeback', 'canceled', 'revoked')),
  source text not null default 'checkout' check (source in ('checkout', 'admin')),
  order_id uuid,
  notes text,
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists entitlements_email_idx on public.entitlements (lower(email));
create index if not exists entitlements_user_idx on public.entitlements (user_id);

-- ───────────── Pedidos e eventos de webhook ─────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_order_id text not null,
  email text not null,
  customer_name text,
  status text not null check (status in ('pending', 'paid', 'refused', 'refunded', 'chargeback', 'canceled')),
  amount_cents integer,
  currency text not null default 'BRL',
  utm jsonb not null default '{}'::jsonb,
  purchase_tracked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status text,
  to_status text not null,
  event_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_key text not null,
  event_type text,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  received_at timestamptz not null default now(),
  unique (provider, event_key)
);

-- ───────────── Dados da usuária ─────────────
create table if not exists public.day_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  day smallint not null check (day between 1 and 30),
  checklist smallint[] not null default '{}',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_slug)
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  goal text check (char_length(goal) <= 160),
  icon text not null default 'Heart',
  position smallint not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists habits_user_idx on public.habits (user_id);

create table if not exists public.habit_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  primary key (habit_id, log_date)
);
create index if not exists habit_logs_user_idx on public.habit_logs (user_id, log_date);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  mood smallint check (mood between 1 and 5),
  energy smallint check (energy between 1 and 5),
  sleep smallint check (sleep between 1 and 5),
  reflection text check (char_length(reflection) <= 2000),
  wins text check (char_length(wins) <= 1000),
  notes text check (char_length(notes) <= 2000),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists public.meal_plans (
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  slots jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item text not null check (char_length(item) between 1 and 120),
  qty text check (char_length(qty) <= 200),
  source text check (char_length(source) <= 200),
  section text,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists shopping_user_idx on public.shopping_items (user_id);

-- ───────────── Conteúdo editável pelo admin ─────────────
create table if not exists public.recipes (
  slug text primary key,
  data jsonb not null,
  published boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.exercises (
  slug text primary key,
  data jsonb not null,
  published boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.journey_days (
  day smallint primary key check (day between 1 and 30),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  storage_path text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Configurações do site (oferta, checkout, garantia, contato)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
-- Funções auxiliares
-- ════════════════════════════════════════════════════════════════════

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.entitlements e
    where e.status = 'active'
      and (
        e.user_id = auth.uid()
        or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', '-'))
      )
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','entitlements','orders','day_progress','journal_entries','meal_plans','recipes','exercises','journey_days','site_settings']
  loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Impede que a própria usuária altere seu papel (role)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() nulo = SQL Editor / service role (permitido)
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Somente administradores podem alterar papéis.';
  end if;
  if new.email is distinct from old.email and auth.uid() is not null and not public.is_admin() then
    new.email = old.email;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Novo cadastro: cria perfil, hábitos padrão e vincula compras feitas com o mesmo e-mail
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.habits (user_id, label, goal, icon, position) values
    (new.id, 'Movimento', 'Me movimentar pelo menos 10 minutos', 'Footprints', 0),
    (new.id, 'Hidratação', 'Manter a garrafa de água por perto e beber ao longo do dia', 'Droplets', 1),
    (new.id, 'Sono', 'Deitar no horário que escolhi', 'Moon', 2),
    (new.id, 'Planejamento alimentar', 'Saber o que vou comer nas principais refeições', 'Salad', 3),
    (new.id, 'Pausas e autocuidado', 'Fazer uma pausa só para mim', 'Heart', 4);

  update public.entitlements
     set user_id = new.id
   where user_id is null and lower(email) = lower(new.email);

  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Exclusão da própria conta (LGPD): remove o usuário de auth.users, apagando em cascata os dados pessoais.
-- Pedidos permanecem para fins fiscais/contábeis, sem vínculo com a conta.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Não autenticado';
  end if;
  update public.entitlements set user_id = null where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.entitlements enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;
alter table public.webhook_events enable row level security;
alter table public.day_progress enable row level security;
alter table public.favorites enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.meal_plans enable row level security;
alter table public.shopping_items enable row level security;
alter table public.recipes enable row level security;
alter table public.exercises enable row level security;
alter table public.journey_days enable row level security;
alter table public.materials enable row level security;
alter table public.site_settings enable row level security;

-- Perfis
drop policy if exists "perfil: ler o próprio" on public.profiles;
create policy "perfil: ler o próprio" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "perfil: editar o próprio" on public.profiles;
create policy "perfil: editar o próprio" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- Direitos de acesso: a usuária vê os seus; admin gerencia
drop policy if exists "acesso: ler o próprio" on public.entitlements;
create policy "acesso: ler o próprio" on public.entitlements for select using (
  user_id = auth.uid() or public.is_admin()
);
drop policy if exists "acesso: admin gerencia" on public.entitlements;
create policy "acesso: admin gerencia" on public.entitlements for all using (public.is_admin()) with check (public.is_admin());

-- Pedidos e webhooks: somente admin (o webhook grava com a service role, que ignora RLS)
drop policy if exists "pedidos: admin" on public.orders;
create policy "pedidos: admin" on public.orders for select using (public.is_admin());
drop policy if exists "eventos pedido: admin" on public.order_events;
create policy "eventos pedido: admin" on public.order_events for select using (public.is_admin());
drop policy if exists "webhooks: admin" on public.webhook_events;
create policy "webhooks: admin" on public.webhook_events for select using (public.is_admin());

-- Dados pessoais: somente a dona dos dados (e com acesso ativo para escrever)
do $$
declare t text;
begin
  foreach t in array array['day_progress','favorites','habits','habit_logs','journal_entries','meal_plans','shopping_items']
  loop
    execute format('drop policy if exists "dono: ler" on public.%I', t);
    execute format('create policy "dono: ler" on public.%I for select using (user_id = auth.uid())', t);
    execute format('drop policy if exists "dono: inserir" on public.%I', t);
    execute format('create policy "dono: inserir" on public.%I for insert with check (user_id = auth.uid() and public.has_access())', t);
    execute format('drop policy if exists "dono: atualizar" on public.%I', t);
    execute format('create policy "dono: atualizar" on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid() and public.has_access())', t);
    execute format('drop policy if exists "dono: excluir" on public.%I', t);
    execute format('create policy "dono: excluir" on public.%I for delete using (user_id = auth.uid())', t);
  end loop;
end $$;

-- Garante que o hábito registrado pertence à usuária
drop policy if exists "dono: inserir" on public.habit_logs;
create policy "dono: inserir" on public.habit_logs for insert with check (
  user_id = auth.uid()
  and public.has_access()
  and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid())
);

-- Conteúdo: membros com acesso leem o publicado; admin gerencia tudo
do $$
declare t text;
begin
  foreach t in array array['recipes','exercises','materials']
  loop
    execute format('drop policy if exists "conteúdo: membros leem" on public.%I', t);
    execute format('create policy "conteúdo: membros leem" on public.%I for select using ((published and public.has_access()) or public.is_admin())', t);
    execute format('drop policy if exists "conteúdo: admin gerencia" on public.%I', t);
    execute format('create policy "conteúdo: admin gerencia" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "jornada: membros leem" on public.journey_days;
create policy "jornada: membros leem" on public.journey_days for select using (public.has_access());
drop policy if exists "jornada: admin gerencia" on public.journey_days;
create policy "jornada: admin gerencia" on public.journey_days for all using (public.is_admin()) with check (public.is_admin());

-- Configurações: públicas podem ser lidas por todos; admin gerencia
drop policy if exists "config: leitura pública" on public.site_settings;
create policy "config: leitura pública" on public.site_settings for select using (is_public or public.is_admin());
drop policy if exists "config: admin gerencia" on public.site_settings;
create policy "config: admin gerencia" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ════════════════════════════════════════════════════════════════════
-- Storage: imagens públicas (receitas) e materiais privados (PDFs enviados)
-- ════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true), ('materiais', 'materiais', false)
on conflict (id) do nothing;

drop policy if exists "imagens: leitura pública" on storage.objects;
create policy "imagens: leitura pública" on storage.objects for select using (bucket_id = 'imagens');
drop policy if exists "imagens: admin envia" on storage.objects;
create policy "imagens: admin envia" on storage.objects for insert with check (bucket_id in ('imagens', 'materiais') and public.is_admin());
drop policy if exists "imagens: admin altera" on storage.objects;
create policy "imagens: admin altera" on storage.objects for update using (bucket_id in ('imagens', 'materiais') and public.is_admin());
drop policy if exists "imagens: admin remove" on storage.objects;
create policy "imagens: admin remove" on storage.objects for delete using (bucket_id in ('imagens', 'materiais') and public.is_admin());
drop policy if exists "materiais: membros leem" on storage.objects;
create policy "materiais: membros leem" on storage.objects for select using (bucket_id = 'materiais' and public.has_access());

-- Configurações iniciais (podem ser alteradas no painel /admin/configuracoes)
insert into public.site_settings (key, value, is_public) values
  ('offer', '{"productName":"Vida Leve 30","priceCents":2990,"checkoutUrl":"","guaranteeEnabled":false,"guaranteeText":""}', true),
  ('support', '{"email":"","whatsapp":"","hours":""}', true)
on conflict (key) do nothing;
