-- ═══════════════════════════════════════════════════════════════════════
-- Agência Prisma CRM — schema completo do Supabase
-- ═══════════════════════════════════════════════════════════════════════
-- Como usar:
--   1. Abra o painel do seu projeto em https://supabase.com/dashboard
--   2. Vá em "SQL Editor" → "New query"
--   3. Cole este arquivo inteiro e clique em "Run"
--   4. Depois siga o SETUP.md para criar as 4 contas de demonstração
--      e publicar a Edge Function de gestão de usuários.
--
-- Este script é idempotente-ish: pode ser rodado do zero em um projeto
-- novo. Se algo já existir, alguns comandos vão falhar — nesse caso rode
-- só os blocos que faltam.
-- ═══════════════════════════════════════════════════════════════════════

-- necessário para gerar as senhas das contas demo via SQL (seção final)
create extension if not exists pgcrypto;

-- garante os GRANTs de tabela que o Supabase normalmente já provisiona por
-- padrão em projetos novos (a segurança de verdade vem do RLS abaixo, isto
-- aqui só evita "permission denied" caso os privilégios padrão do schema
-- public tenham sido alterados no seu projeto)
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;

-- ───────────────────────────────────────────────────────────────────────
-- 1. TABELA DE CAPACIDADES POR PAPEL (espelha o objeto ROLES do frontend)
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.role_capabilities (
  role        text primary key,
  label       text not null,
  can_view    boolean not null default true,
  can_create  boolean not null default false,
  can_edit    boolean not null default false,
  can_delete  boolean not null default false,
  can_finance boolean not null default false,
  can_users   boolean not null default false
);

insert into public.role_capabilities (role, label, can_view, can_create, can_edit, can_delete, can_finance, can_users) values
  ('master',          'Master',       true, true,  true,  true,  true,  true),
  ('gestor',          'Gestor',       true, true,  true,  false, true,  false),
  ('operacional',     'Operacional',  true, false, true,  false, false, false),
  ('comercial',       'Comercial',    true, true,  true,  false, false, false),
  ('financeiro_role', 'Financeiro',   true, true,  true,  false, true,  false),
  ('visualizador',    'Visualizador', true, false, false, false, false, false)
on conflict (role) do update set
  label = excluded.label, can_view = excluded.can_view, can_create = excluded.can_create,
  can_edit = excluded.can_edit, can_delete = excluded.can_delete,
  can_finance = excluded.can_finance, can_users = excluded.can_users;

-- ───────────────────────────────────────────────────────────────────────
-- 2. PERFIS (1:1 com auth.users — nunca guardamos senha aqui)
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  email      text not null,
  role       text not null references public.role_capabilities(role) default 'operacional',
  ativo      boolean not null default true,
  avatar     text not null default '',
  criado_em  timestamptz not null default now()
);

-- helper: papel do usuário autenticado atual (security definer p/ evitar
-- recursão de RLS quando outras policies chamam esta função)
create or replace function public.auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.auth_can(flag text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case flag
    when 'view'     then rc.can_view
    when 'create'   then rc.can_create
    when 'edit'     then rc.can_edit
    when 'delete'   then rc.can_delete
    when 'finance'  then rc.can_finance
    when 'users'    then rc.can_users
    else false
  end
  from public.profiles p join public.role_capabilities rc on rc.role = p.role
  where p.id = auth.uid();
$$;

-- cria automaticamente o profile quando uma conta é criada no auth.users
-- (usado tanto pelo signUp comum quanto pela Edge Function de admin)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, role, ativo, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'operacional'),
    coalesce((new.raw_user_meta_data->>'ativo')::boolean, true),
    coalesce(new.raw_user_meta_data->>'avatar', upper(left(split_part(new.email,'@',1),2)))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- impede que alguém sem ser master altere role/ativo (o próprio ou de outros)
create or replace function public.enforce_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- a Edge Function "manage-user" usa a service role key, que roda como
  -- auth.role() = 'service_role' e deve poder alterar role/ativo livremente
  if (new.role is distinct from old.role or new.ativo is distinct from old.ativo)
     and auth.role() <> 'service_role'
     and coalesce((select can_users from public.role_capabilities where role = public.auth_role()), false) = false then
    raise exception 'Apenas o perfil Master pode alterar papel/status de usuários';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_profile_role_change on public.profiles;
create trigger trg_enforce_profile_role_change
  before update on public.profiles
  for each row execute function public.enforce_profile_role_change();

alter table public.profiles enable row level security;

drop policy if exists "profiles: leitura para autenticados" on public.profiles;
create policy "profiles: leitura para autenticados"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles: cada um edita o próprio nome/avatar" on public.profiles;
create policy "profiles: cada um edita o próprio nome/avatar"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles: master edita qualquer perfil" on public.profiles;
create policy "profiles: master edita qualquer perfil"
  on public.profiles for update
  to authenticated
  using (coalesce((select can_users from public.role_capabilities where role = public.auth_role()), false));

-- Não há policy de INSERT/DELETE para o cliente: contas são criadas e
-- removidas via Edge Function "manage-user" (usa a service role key).

-- ───────────────────────────────────────────────────────────────────────
-- 3. PROSPECÇÃO
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.prospects (
  id            bigint generated always as identity primary key,
  nome          text not null,
  segmento      text,
  contato       text,
  telefone      text,
  status        text not null default 'Novo Lead',
  valor         numeric not null default 0,
  origem        text,
  notas         text,
  observacoes   text,
  data_criacao  date not null default current_date,
  created_by    uuid references public.profiles(id) default auth.uid(),
  criado_em     timestamptz not null default now()
);

alter table public.prospects enable row level security;

drop policy if exists "prospects: select" on public.prospects;
create policy "prospects: select" on public.prospects for select to authenticated using (true);

drop policy if exists "prospects: insert" on public.prospects;
create policy "prospects: insert" on public.prospects for insert to authenticated with check (public.auth_can('create'));

drop policy if exists "prospects: update" on public.prospects;
create policy "prospects: update" on public.prospects for update to authenticated using (public.auth_can('edit'));

drop policy if exists "prospects: delete" on public.prospects;
create policy "prospects: delete" on public.prospects for delete to authenticated using (public.auth_can('delete'));

-- ───────────────────────────────────────────────────────────────────────
-- 4. CLIENTES  (comentários e links guardados no próprio registro)
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.clientes (
  id             bigint generated always as identity primary key,
  nome           text not null,
  segmento       text,
  contato        text,
  telefone       text,
  plano          text not null default 'Starter',
  valor          numeric not null default 0,
  investimento   numeric not null default 0,
  inicio         date,
  status         text not null default 'Ativo',
  url_site       text,
  url_ads        text,
  url_relatorio  text,
  url_drive      text,
  comentarios    jsonb not null default '[]'::jsonb,
  created_by     uuid references public.profiles(id) default auth.uid(),
  criado_em      timestamptz not null default now()
);

alter table public.clientes enable row level security;

drop policy if exists "clientes: select" on public.clientes;
create policy "clientes: select" on public.clientes for select to authenticated using (true);

drop policy if exists "clientes: insert" on public.clientes;
create policy "clientes: insert" on public.clientes for insert to authenticated with check (public.auth_can('create'));

drop policy if exists "clientes: update" on public.clientes;
create policy "clientes: update" on public.clientes for update to authenticated using (public.auth_can('edit'));

drop policy if exists "clientes: delete" on public.clientes;
create policy "clientes: delete" on public.clientes for delete to authenticated using (public.auth_can('delete'));

-- ───────────────────────────────────────────────────────────────────────
-- 5. PROJETOS
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.projetos (
  id                  bigint generated always as identity primary key,
  cliente             text not null,
  nome                text not null,
  status              text not null default 'Planejamento',
  inicio              date,
  fim                 date,
  progresso           int not null default 0,
  tarefas             text[] not null default '{}',
  tarefas_concluidas  int[] not null default '{}',
  created_by          uuid references public.profiles(id) default auth.uid(),
  criado_em           timestamptz not null default now()
);

alter table public.projetos enable row level security;

drop policy if exists "projetos: select" on public.projetos;
create policy "projetos: select" on public.projetos for select to authenticated using (true);

drop policy if exists "projetos: insert" on public.projetos;
create policy "projetos: insert" on public.projetos for insert to authenticated with check (public.auth_role() in ('master','gestor'));

drop policy if exists "projetos: update" on public.projetos;
create policy "projetos: update" on public.projetos for update to authenticated using (public.auth_can('edit'));

drop policy if exists "projetos: delete" on public.projetos;
create policy "projetos: delete" on public.projetos for delete to authenticated using (public.auth_can('delete'));

-- ───────────────────────────────────────────────────────────────────────
-- 6. AGENDA
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.agenda (
  id          bigint generated always as identity primary key,
  titulo      text not null,
  data        date not null,
  hora        time not null,
  tipo        text not null default 'Reunião',
  cliente     text,
  descricao   text,
  created_by  uuid references public.profiles(id) default auth.uid(),
  criado_em   timestamptz not null default now()
);

alter table public.agenda enable row level security;

drop policy if exists "agenda: select" on public.agenda;
create policy "agenda: select" on public.agenda for select to authenticated using (true);

drop policy if exists "agenda: insert" on public.agenda;
create policy "agenda: insert" on public.agenda for insert to authenticated with check (public.auth_can('create'));

drop policy if exists "agenda: update" on public.agenda;
create policy "agenda: update" on public.agenda for update to authenticated using (public.auth_can('edit'));

drop policy if exists "agenda: delete" on public.agenda;
create policy "agenda: delete" on public.agenda for delete to authenticated using (public.auth_can('delete'));

-- ───────────────────────────────────────────────────────────────────────
-- 7. FINANCEIRO
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.financeiro_receitas (
  id          bigint generated always as identity primary key,
  descricao   text not null,
  valor       numeric not null default 0,
  data        date not null default current_date,
  status      text not null default 'Pendente',
  categoria   text,
  created_by  uuid references public.profiles(id) default auth.uid(),
  criado_em   timestamptz not null default now()
);

create table if not exists public.financeiro_despesas (
  id          bigint generated always as identity primary key,
  descricao   text not null,
  valor       numeric not null default 0,
  data        date not null default current_date,
  categoria   text,
  created_by  uuid references public.profiles(id) default auth.uid(),
  criado_em   timestamptz not null default now()
);

alter table public.financeiro_receitas enable row level security;
alter table public.financeiro_despesas enable row level security;

drop policy if exists "receitas: select" on public.financeiro_receitas;
create policy "receitas: select" on public.financeiro_receitas for select to authenticated using (public.auth_can('finance'));
drop policy if exists "receitas: insert" on public.financeiro_receitas;
create policy "receitas: insert" on public.financeiro_receitas for insert to authenticated with check (public.auth_can('finance') and public.auth_can('create'));
drop policy if exists "receitas: update" on public.financeiro_receitas;
create policy "receitas: update" on public.financeiro_receitas for update to authenticated using (public.auth_can('finance') and public.auth_can('edit'));
drop policy if exists "receitas: delete" on public.financeiro_receitas;
create policy "receitas: delete" on public.financeiro_receitas for delete to authenticated using (public.auth_can('finance') and public.auth_can('delete'));

drop policy if exists "despesas: select" on public.financeiro_despesas;
create policy "despesas: select" on public.financeiro_despesas for select to authenticated using (public.auth_can('finance'));
drop policy if exists "despesas: insert" on public.financeiro_despesas;
create policy "despesas: insert" on public.financeiro_despesas for insert to authenticated with check (public.auth_can('finance') and public.auth_can('create'));
drop policy if exists "despesas: update" on public.financeiro_despesas;
create policy "despesas: update" on public.financeiro_despesas for update to authenticated using (public.auth_can('finance') and public.auth_can('edit'));
drop policy if exists "despesas: delete" on public.financeiro_despesas;
create policy "despesas: delete" on public.financeiro_despesas for delete to authenticated using (public.auth_can('finance') and public.auth_can('delete'));

-- reforça os GRANTs também nas tabelas que acabaram de ser criadas nesta
-- mesma execução (o ALTER DEFAULT PRIVILEGES lá em cima só vale para
-- tabelas futuras; isto cobre a primeira rodada e reruns)
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- ───────────────────────────────────────────────────────────────────────
-- 8. DADOS DE EXEMPLO (mesmos dados que já existiam na versão mockada)
-- ───────────────────────────────────────────────────────────────────────
insert into public.prospects (nome, segmento, contato, telefone, status, valor, origem, data_criacao, notas) values
  ('Loja da Maria', 'E-commerce', 'maria@loja.com', '(11) 99999-1111', 'Novo Lead', 2500, 'Instagram', '2026-03-20', 'Interesse em tráfego pago'),
  ('Clínica Sorriso', 'Saúde', 'dr.carlos@clinica.com', '(11) 98888-2222', 'Proposta Enviada', 3800, 'Indicação', '2026-03-22', 'Captação de pacientes'),
  ('Academia FitLife', 'Fitness', 'joao@fitlife.com', '(11) 97777-3333', 'Negociando', 1800, 'Google', '2026-03-28', 'Foco em Meta Ads')
on conflict do nothing;

insert into public.clientes (nome, segmento, contato, telefone, plano, valor, inicio, status, investimento) values
  ('Pet Shop Amigo Fiel', 'Pet', 'ana@petshop.com', '(11) 96666-4444', 'Profissional', 3200, '2026-01-15', 'Ativo', 5000),
  ('Restaurante Sabor & Arte', 'Food', 'chef@sabor.com', '(11) 95555-5555', 'Starter', 1500, '2026-02-01', 'Ativo', 2000),
  ('Imobiliária Premium', 'Imóveis', 'renata@premium.com', '(11) 94444-6666', 'Enterprise', 6500, '2025-11-01', 'Ativo', 15000)
on conflict do nothing;

insert into public.projetos (cliente, nome, status, inicio, fim, progresso, tarefas, tarefas_concluidas) values
  ('Pet Shop Amigo Fiel', 'Campanhas Meta Q2', 'Em Andamento', '2026-04-01', '2026-06-30', 35, array['Criar criativos','Configurar campanhas','Relatório semanal','Otimização'], array[0]),
  ('Restaurante Sabor & Arte', 'Google Ads Launch', 'Em Revisão', '2026-03-15', '2026-05-15', 70, array['Pesquisa de palavras-chave','Criar anúncios','Landing page','Tracking'], array[0,1,2]),
  ('Imobiliária Premium', 'Funil de Captação', 'Planejamento', '2026-04-10', '2026-07-10', 10, array['Briefing','Estratégia','Criativos','Go-live'], array[]::int[])
on conflict do nothing;

insert into public.agenda (titulo, data, hora, tipo, cliente, descricao) values
  ('Reunião de resultado - Pet Shop', '2026-04-07', '10:00', 'Reunião', 'Pet Shop Amigo Fiel', 'Apresentar relatório de março'),
  ('Entrega de criativos - Restaurante', '2026-04-08', '14:00', 'Entrega', 'Restaurante Sabor & Arte', 'Enviar pack de criativos'),
  ('Call de prospecção - Academia', '2026-04-09', '09:00', 'Prospecção', 'Academia FitLife', 'Apresentar proposta comercial'),
  ('Relatório mensal - Imobiliária', '2026-04-10', '16:00', 'Relatório', 'Imobiliária Premium', 'Dashboard de resultados de março')
on conflict do nothing;

insert into public.financeiro_receitas (descricao, valor, data, status, categoria) values
  ('Mensalidade - Pet Shop Amigo Fiel', 3200, '2026-04-01', 'Recebido', 'Mensalidade'),
  ('Mensalidade - Restaurante Sabor & Arte', 1500, '2026-04-01', 'Recebido', 'Mensalidade'),
  ('Mensalidade - Imobiliária Premium', 6500, '2026-04-05', 'Pendente', 'Mensalidade'),
  ('Setup - Academia FitLife', 800, '2026-04-12', 'Pendente', 'Setup')
on conflict do nothing;

insert into public.financeiro_despesas (descricao, valor, data, categoria) values
  ('Ferramentas SaaS', 890, '2026-04-01', 'Ferramentas'),
  ('Freelancer - Designer', 1200, '2026-04-05', 'Equipe'),
  ('Escritório', 600, '2026-04-10', 'Infraestrutura')
on conflict do nothing;

-- ───────────────────────────────────────────────────────────────────────
-- 9. CONTAS DE DEMONSTRAÇÃO (opcional — veja SETUP.md para o passo a
--    passo recomendado pelo painel). Este bloco cria as 4 contas de auth
--    diretamente por SQL, com as mesmas credenciais do protótipo original.
--    ATENÇÃO: são senhas fracas e públicas — troque-as antes de usar isto
--    fora de um ambiente de demonstração.
-- ───────────────────────────────────────────────────────────────────────
do $$
declare
  v_instance_id uuid;
  v_users jsonb := '[
    {"email":"master@agencia.com",  "senha":"master123", "nome":"Você (Master)",  "role":"master",      "avatar":"VM"},
    {"email":"ana@agencia.com",     "senha":"ana123",     "nome":"Ana Gestora",    "role":"gestor",      "avatar":"AG"},
    {"email":"carlos@agencia.com",  "senha":"carlos123",  "nome":"Carlos Dev",     "role":"operacional", "avatar":"CD"},
    {"email":"julia@agencia.com",   "senha":"julia123",   "nome":"Julia Comercial","role":"comercial",   "avatar":"JC"}
  ]';
  v_row jsonb;
  v_new_id uuid;
begin
  select instance_id into v_instance_id from auth.users limit 1;
  if v_instance_id is null then v_instance_id := '00000000-0000-0000-0000-000000000000'; end if;

  for v_row in select * from jsonb_array_elements(v_users) loop
    if not exists (select 1 from auth.users where email = v_row->>'email') then
      v_new_id := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        v_instance_id, v_new_id, 'authenticated', 'authenticated', v_row->>'email',
        crypt(v_row->>'senha', gen_salt('bf')),
        now(), '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nome', v_row->>'nome', 'role', v_row->>'role', 'avatar', v_row->>'avatar', 'ativo', true),
        now(), now(), '', '', '', ''
      );
      insert into auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), v_new_id, v_new_id,
        jsonb_build_object('sub', v_new_id::text, 'email', v_row->>'email'),
        'email', now(), now(), now()
      );
    end if;
  end loop;
end $$;
