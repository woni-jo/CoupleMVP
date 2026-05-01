alter table public.places
  drop constraint if exists places_category_check;

alter table public.places
  add constraint places_category_check
  check (category in ('restaurant', 'cafe', 'dessert', 'walk', 'culture', 'attraction'));
