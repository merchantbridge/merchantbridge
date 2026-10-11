-- Free-text business location (city/state), e.g. "Wyoming".
-- Country stays the required selector; location adds detail on top of it.
alter table public.merchant_profiles
  add column if not exists location text;
