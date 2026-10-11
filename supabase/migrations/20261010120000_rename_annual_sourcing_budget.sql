-- Rename the buyer budget column to drop the legacy "gifting" naming.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'buyer_profiles'
      and column_name = 'annual_gifting_budget'
  ) then
    alter table public.buyer_profiles
      rename column annual_gifting_budget to annual_sourcing_budget;
  end if;
end $$;
