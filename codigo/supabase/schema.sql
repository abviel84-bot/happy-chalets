-- =====================================================================
--  Happy Chalets · Esquema de Supabase
--  Cómo usarlo: Supabase → SQL Editor → New query → pega todo → Run.
--  Se puede correr más de una vez sin romper nada.
-- =====================================================================

-- ---------- Administradores ----------
-- Solo los correos en esta tabla pueden editar el sitio.
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- (sin políticas públicas: nadie puede leer ni editar esta tabla desde el sitio)

-- Función que usan todas las políticas: ¿el usuario conectado es admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admin_users a
    join auth.users u on lower(trim(u.email)) = lower(trim(a.email))
    where u.id = auth.uid()
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Contenido del sitio (un solo documento JSON) ----------
create table if not exists public.site_content (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop policy if exists "site_content lectura publica" on public.site_content;
create policy "site_content lectura publica" on public.site_content for select using (true);
drop policy if exists "site_content admin escribe" on public.site_content;
create policy "site_content admin escribe" on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());
insert into public.site_content (id, data) values ('main', '{}'::jsonb) on conflict (id) do nothing;

-- ---------- Galería (fotos y videos) ----------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('image','video')),
  url text not null,
  path text,                      -- ruta dentro del bucket (para poder borrarlo)
  category text not null default 'ext' check (category in ('ext','int','pool','beach')),
  caption_es text default '',
  caption_en text default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.media enable row level security;
drop policy if exists "media lectura publica" on public.media;
create policy "media lectura publica" on public.media for select using (true);
drop policy if exists "media admin escribe" on public.media;
create policy "media admin escribe" on public.media for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Fechas ocupadas ----------
-- start_date = primera noche ocupada · end_date = día de salida (no incluido)
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  chalet_id text not null,
  start_date date not null,
  end_date date not null,
  note text default '',
  created_at timestamptz not null default now(),
  constraint blocked_dates_rango check (end_date > start_date)
);
create index if not exists blocked_dates_chalet_idx on public.blocked_dates (chalet_id, end_date);
alter table public.blocked_dates enable row level security;
drop policy if exists "blocked lectura publica" on public.blocked_dates;
create policy "blocked lectura publica" on public.blocked_dates for select using (true);
drop policy if exists "blocked admin escribe" on public.blocked_dates;
create policy "blocked admin escribe" on public.blocked_dates for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Solicitudes de reserva ----------
-- Cada vez que un huésped presiona "Enviar por WhatsApp" se guarda aquí una copia.
-- El público solo puede INSERTAR; únicamente el admin las puede ver.
create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  chalet_id text,
  chalet_name text,
  check_in date,
  check_out date,
  nights int,
  adults int,
  kids int,
  babies int,
  pets int,
  guest_name text,
  reason text,
  comments text,
  message text,
  lang text,
  status text not null default 'nueva' check (status in ('nueva','contestada','confirmada','descartada')),
  created_at timestamptz not null default now(),
  constraint booking_requests_largo check (char_length(coalesce(message,'')) < 4000 and char_length(coalesce(comments,'')) < 2000)
);
alter table public.booking_requests enable row level security;
drop policy if exists "requests publico inserta" on public.booking_requests;
create policy "requests publico inserta" on public.booking_requests for insert to anon, authenticated
  with check (status = 'nueva');
drop policy if exists "requests admin lee" on public.booking_requests;
create policy "requests admin lee" on public.booking_requests for select using (public.is_admin());
drop policy if exists "requests admin edita" on public.booking_requests;
create policy "requests admin edita" on public.booking_requests for update
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "requests admin borra" on public.booking_requests;
create policy "requests admin borra" on public.booking_requests for delete using (public.is_admin());

-- ---------- Storage: bucket público "media" ----------
-- file_size_limit en bytes. 5 GB aquí; el límite real lo pone tu plan
-- (Free = 50 MB por archivo. Pro = sube el límite global en Storage → Settings).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5368709120,
        array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/quicktime','video/webm'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media publico lee" on storage.objects;
create policy "media publico lee" on storage.objects for select
  using (bucket_id = 'media');
drop policy if exists "media admin sube" on storage.objects;
create policy "media admin sube" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin actualiza" on storage.objects;
create policy "media admin actualiza" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin borra" on storage.objects;
create policy "media admin borra" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------- Tu usuario administrador ----------
-- 1) Supabase → Authentication → Users → "Add user" (correo + contraseña, marca "Auto confirm").
-- 2) Cambia el correo abajo si es otro y corre esta línea:
insert into public.admin_users (email) values ('happychaletsbh@gmail.com') on conflict do nothing;
