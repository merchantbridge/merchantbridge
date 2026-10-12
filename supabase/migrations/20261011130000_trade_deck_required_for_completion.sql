-- Make a trade deck required for 100% profile completion.

alter table public.marketplace_merchant_profiles
  add column if not exists has_trade_deck boolean not null default false;

create or replace function public.marketplace_merchant_has_trade_deck(marketplace_merchant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select exists (
    select 1
    from public.marketplace_merchant_profiles mmp
    join public.merchant_profiles mp on mp.user_id = mmp.user_id
    join public.documents d on d.merchant_id = mp.id
    join storage.objects o on o.bucket_id = 'trade-decks' and o.name = d.storage_path
    where mmp.id = marketplace_merchant_id
      and d.file_type = 'pdf'
      and d.is_visible_to_merchant = true
      and d.storage_path like mp.user_id::text || '/%'
  );
$$;

revoke all on function public.marketplace_merchant_has_trade_deck(uuid) from public;
grant execute on function public.marketplace_merchant_has_trade_deck(uuid) to anon, authenticated, service_role;

-- Backfill existing merchants who already have an approved trade deck.
update public.marketplace_merchant_profiles mmp
set has_trade_deck = true
where exists (
  select 1
  from public.merchant_profiles mp
  join public.documents d on d.merchant_id = mp.id
  join storage.objects o on o.bucket_id = 'trade-decks' and o.name = d.storage_path
  where mp.user_id = mmp.user_id
    and d.file_type = 'pdf'
    and d.is_visible_to_merchant = true
    and d.storage_path like mp.user_id::text || '/%'
);
