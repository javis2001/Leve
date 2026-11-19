-- Permissões da Data API (o acesso real continua controlado pelas políticas RLS).
-- Necessário em projetos criados sem "conceder acesso automático da API a novas tabelas".
grant usage on schema public to anon, authenticated, service_role;
grant select on public.site_settings to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant execute on function public.has_access(), public.is_admin() to anon, authenticated;
