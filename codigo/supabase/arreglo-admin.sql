-- =====================================================================
--  Arreglo de permisos de administrador (se puede correr varias veces)
--  Supabase → SQL Editor → New query → pega todo → Run
-- =====================================================================

-- 1) Asegura la tabla de administradores
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

-- 2) Limpia espacios y mayúsculas en los correos guardados
update public.admin_users set email = lower(trim(email));

-- 3) Función de verificación más robusta: busca el correo del usuario
--    conectado directamente en auth.users (no depende del token).
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

-- 4) ✏️ PON AQUÍ LOS CORREOS DE LOS ADMINISTRADORES y corre el archivo
insert into public.admin_users (email) values
  (lower(trim('primer-correo@gmail.com'))),
  (lower(trim('segundo-correo@gmail.com')))
on conflict do nothing;

-- 5) Revisión: cada administrador debe salir con "existe_en_auth = true"
--    y "confirmado = true". Si sale false, el usuario no está creado
--    (o no está confirmado) en Authentication → Users.
select a.email,
       (u.id is not null)                as existe_en_auth,
       (u.email_confirmed_at is not null) as confirmado
from public.admin_users a
left join auth.users u on lower(u.email) = a.email
order by a.email;
