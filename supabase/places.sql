create table if not exists public.places (
  id bigserial primary key,
  external_id text unique,
  name text not null,
  area text not null check (area in ('hongdae', 'hapjeong', 'yeonnam', 'mangwon')),
  category text not null check (category in ('restaurant', 'cafe', 'dessert', 'walk', 'culture', 'attraction')),
  address text,
  lat double precision not null,
  lng double precision not null,
  manual_score int not null default 50 check (manual_score between 0 and 100),
  tags text[] not null default '{}',
  time_slots text[] not null default '{}',
  place_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists places_active_area_idx
  on public.places (is_active, area);

create index if not exists places_category_idx
  on public.places (category);

create index if not exists places_time_slots_idx
  on public.places using gin (time_slots);

alter table public.places enable row level security;

drop policy if exists "Allow anon read active places" on public.places;

create policy "Allow anon read active places"
  on public.places
  for select
  to anon
  using (is_active = true);
