/**
 * Valida as migrações SQL em um Postgres real (PGlite/WASM) com stubs mínimos
 * dos esquemas `auth` e `storage` do Supabase, e testa RLS + pagamentos.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const STUB = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema auth, storage to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
`;

const db = new PGlite();
const U1 = "11111111-1111-1111-1111-111111111111";
const U2 = "22222222-2222-2222-2222-222222222222";
const ADMIN = "33333333-3333-3333-3333-333333333333";

async function as(uid: string | null, email: string | null, fn: () => Promise<void>) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claims', $2, false)", [
    uid ?? "",
    uid ? JSON.stringify({ sub: uid, email }) : "",
  ]);
  await db.exec(uid ? "set role authenticated" : "set role anon");
  try {
    await fn();
  } finally {
    await db.exec("reset role");
  }
}

beforeAll(async () => {
  await db.exec(STUB);
  const dir = path.resolve(import.meta.dirname, "../supabase/migrations");
  for (const f of readdirSync(dir).sort()) await db.exec(readFileSync(path.join(dir, f), "utf8"));
  await db.exec(`
    grant usage on schema public to anon, authenticated, service_role;
    grant all on all tables in schema public to anon, authenticated, service_role;
    grant select on storage.objects to anon, authenticated;
  `);
  await db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1,'ana@exemplo.com','{\"full_name\":\"Ana\"}'), ($2,'bia@exemplo.com','{}'), ($3,'admin@exemplo.com','{}')", [U1, U2, ADMIN]);
  await db.query("update public.profiles set role = 'admin' where id = $1", [ADMIN]);
}, 60_000);

describe("migrações", () => {
  it("cria perfil e hábitos padrão no cadastro", async () => {
    const p = await db.query<{ full_name: string }>("select full_name from public.profiles where id = $1", [U1]);
    expect(p.rows[0].full_name).toBe("Ana");
    const h = await db.query("select * from public.habits where user_id = $1", [U1]);
    expect(h.rows).toHaveLength(5);
  });

  it("sem compra, não há acesso e não é possível gravar progresso", async () => {
    await as(U1, "ana@exemplo.com", async () => {
      const r = await db.query<{ has_access: boolean }>("select public.has_access()");
      expect(r.rows[0].has_access).toBe(false);
      await expect(db.query("insert into public.day_progress (user_id, day) values ($1, 1)", [U1])).rejects.toThrow(/row-level security/);
    });
  });

  it("webhook pago libera acesso; duplicado é idempotente", async () => {
    const call = () =>
      db.query<{ r: { first_paid: boolean; changed: boolean; status: string } }>(
        "select public.process_payment_event('cakto','PED-1','ANA@exemplo.com','Ana','paid',2990,'{\"utm_source\":\"meta\"}','purchase_approved') as r",
      );
    const first = (await call()).rows[0].r;
    expect(first).toMatchObject({ first_paid: true, changed: true, status: "paid" });
    const dup = (await call()).rows[0].r;
    expect(dup).toMatchObject({ first_paid: false, changed: false });
    const ent = await db.query("select * from public.entitlements where lower(email) = 'ana@exemplo.com'");
    expect(ent.rows).toHaveLength(1);

    await as(U1, "ana@exemplo.com", async () => {
      expect((await db.query<{ has_access: boolean }>("select public.has_access()")).rows[0].has_access).toBe(true);
      await db.query("insert into public.day_progress (user_id, day, checklist) values ($1, 1, '{0,1}')", [U1]);
      await db.query("insert into public.journal_entries (user_id, entry_date, mood) values ($1, current_date, 4)", [U1]);
    });
  });

  it("uma usuária não lê nem altera dados de outra", async () => {
    await db.query("select public.process_payment_event('cakto','PED-2','bia@exemplo.com',null,'paid',2990,'{}','purchase_approved')");
    await as(U2, "bia@exemplo.com", async () => {
      const r = await db.query("select * from public.journal_entries");
      expect(r.rows).toHaveLength(0);
      const upd = await db.query("update public.day_progress set checklist = '{}' where user_id = $1", [U1]);
      expect(upd.affectedRows).toBe(0);
      await expect(db.query("insert into public.day_progress (user_id, day) values ($1, 2)", [U1])).rejects.toThrow();
      const h = await db.query<{ id: string }>("select id from public.habits where user_id = $1", [U1]);
      expect(h.rows).toHaveLength(0);
    });
  });

  it("usuária comum não acessa pedidos nem se promove a admin", async () => {
    await as(U1, "ana@exemplo.com", async () => {
      expect((await db.query("select * from public.orders")).rows).toHaveLength(0);
      expect((await db.query<{ is_admin: boolean }>("select public.is_admin()")).rows[0].is_admin).toBe(false);
      await expect(db.query("update public.profiles set role = 'admin' where id = $1", [U1])).rejects.toThrow(/administradores/);
      await expect(
        db.query("insert into public.recipes (slug, data) values ('x', '{}')"),
      ).rejects.toThrow(/row-level security/);
      await expect(db.query("select public.process_payment_event('x','y','ana@exemplo.com',null,'paid',1,'{}','x')")).rejects.toThrow(/permission denied/);
    });
  });

  it("admin vê pedidos e gerencia conteúdo", async () => {
    await as(ADMIN, "admin@exemplo.com", async () => {
      expect((await db.query("select * from public.orders")).rows.length).toBe(2);
      await db.query("insert into public.recipes (slug, data) values ('teste', '{\"title\":\"Teste\"}')");
      await db.query("update public.site_settings set value = '{\"email\":\"suporte@exemplo.com\"}' where key = 'support'");
    });
  });

  it("anônimo lê apenas configurações públicas", async () => {
    await as(null, null, async () => {
      expect((await db.query("select * from public.site_settings")).rows).toHaveLength(2);
      expect((await db.query("select * from public.recipes")).rows).toHaveLength(0);
      expect((await db.query("select * from public.profiles")).rows).toHaveLength(0);
    });
  });

  it("reembolso revoga acesso e pagamento atrasado não reativa", async () => {
    const r = await db.query<{ r: { changed: boolean; status: string } }>(
      "select public.process_payment_event('cakto','PED-1','ana@exemplo.com',null,'refunded',null,'{}','refund') as r",
    );
    expect(r.rows[0].r).toMatchObject({ changed: true, status: "refunded" });
    const late = await db.query<{ r: { changed: boolean; first_paid: boolean } }>(
      "select public.process_payment_event('cakto','PED-1','ana@exemplo.com',null,'paid',2990,'{}','purchase_approved') as r",
    );
    expect(late.rows[0].r).toMatchObject({ changed: false, first_paid: false });
    await as(U1, "ana@exemplo.com", async () => {
      expect((await db.query<{ has_access: boolean }>("select public.has_access()")).rows[0].has_access).toBe(false);
    });
    const ev = await db.query("select * from public.order_events oe join public.orders o on o.id = oe.order_id where o.provider_order_id = 'PED-1'");
    expect(ev.rows).toHaveLength(2);
  });

  it("compra antes do cadastro é vinculada ao criar a conta", async () => {
    await db.query("select public.process_payment_event('cakto','PED-3','nova@exemplo.com',null,'paid',2990,'{}','purchase_approved')");
    const NEW = "44444444-4444-4444-4444-444444444444";
    await db.query("insert into auth.users (id, email) values ($1, 'Nova@Exemplo.com')", [NEW]);
    const e = await db.query<{ user_id: string }>("select user_id from public.entitlements where email = 'nova@exemplo.com'");
    expect(e.rows[0].user_id).toBe(NEW);
  });

  it("exclusão de conta apaga dados pessoais em cascata", async () => {
    await as(U1, "ana@exemplo.com", async () => {
      await db.query("select public.delete_my_account()");
    });
    for (const t of ["profiles", "habits", "journal_entries", "day_progress"]) {
      const col = t === "profiles" ? "id" : "user_id";
      expect((await db.query(`select 1 from public.${t} where ${col} = $1`, [U1])).rows, t).toHaveLength(0);
    }
    expect((await db.query("select 1 from public.orders where provider_order_id = 'PED-1'")).rows).toHaveLength(1);
  });
});
