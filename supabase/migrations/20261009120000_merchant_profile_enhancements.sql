-- Merchant Profile Enhancements for Store Owner Onboarding
-- Adds fields required for the new merchant onboarding flow

-- Add new fields to merchant_profiles
alter table public.merchant_profiles
  add column if not exists target_market text,
  add column if not exists average_order_value text,
  add column if not exists monthly_order_volume text,
  add column if not exists custom_branding_packaging boolean default false,
  add column if not exists shipping_markets text[], -- array of markets: US, UK, Europe, Australia, Canada, Worldwide
  add column if not exists current_monthly_revenue text,
  add column if not exists current_sales_channels text[], -- array: Own website, Shopify, Etsy, Amazon, Wholesale, Retail, Other
  add column if not exists supplier_profile_document_url text,
  add column if not exists supplier_profile_document_status text default 'not_uploaded', -- not_uploaded, under_preparation, uploaded_and_approved
  add column if not exists location text; -- City or state, e.g. Wyoming

-- Create enum for application tracker status
do $$
begin
  if not exists (select from pg_type where typname = 'application_tracker_status') then
    create type application_tracker_status as enum (
      'saved', 'applied', 'in_conversation', 'deal_closed', 'not_successful'
    );
  end if;
end
$$;

-- Create table for merchant opportunity applications (application tracker)
create table if not exists public.merchant_opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchant_profiles(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  opportunity_title text not null,
  opportunity_type text,
  status application_tracker_status not null default 'applied',
  notes text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for faster queries
create index if not exists idx_merchant_opportunity_applications_merchant_id 
  on public.merchant_opportunity_applications(merchant_id);
create index if not exists idx_merchant_opportunity_applications_status 
  on public.merchant_opportunity_applications(status);

-- Create table for in-app notifications
create table if not exists public.merchant_notifications (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchant_profiles(id) on delete cascade,
  type text not null, -- opportunity_match, profile_review, message, opportunity_expiring, application_reminder
  title text not null,
  message text,
  action_url text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Create index for notification queries
create index if not exists idx_merchant_notifications_merchant_id 
  on public.merchant_notifications(merchant_id);
create index if not exists idx_merchant_notifications_read 
  on public.merchant_notifications(read);

-- Create table for testimonials (deal closed testimonials)
create table if not exists public.merchant_testimonials (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchant_profiles(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  content text not null,
  status text not null default 'pending_review', -- pending_review, approved, rejected
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

-- Enable RLS
alter table public.merchant_opportunity_applications enable row level security;
alter table public.merchant_notifications enable row level security;
alter table public.merchant_testimonials enable row level security;

-- RLS policies for merchant_opportunity_applications
create policy "merchants_manage_own_applications" on public.merchant_opportunity_applications
  for all using (
    merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
  )
  with check (
    merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
  );

create policy "admins_view_all_applications" on public.merchant_opportunity_applications
  for select using (public.is_admin());

-- RLS policies for merchant_notifications
create policy "merchants_view_own_notifications" on public.merchant_notifications
  for select using (
    merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
  );

create policy "merchants_update_own_notifications" on public.merchant_notifications
  for update using (
    merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
  )
  with check (
    merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
  );

create policy "service_role_can_create_notifications" on public.merchant_notifications
  for insert with check (true);

-- RLS policies for merchant_testimonials
create policy "merchants_manage_own_testimonials" on public.merchant_testimonials
  for all using (
    merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
  )
  with check (
    merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
  );

create policy "admins_manage_testimonials" on public.merchant_testimonials
  for all using (public.is_admin())
  with check (public.is_admin());

-- Grant permissions
grant all on public.merchant_opportunity_applications to authenticated;
grant all on public.merchant_notifications to authenticated;
grant all on public.merchant_testimonials to authenticated;
grant usage, select on all sequences in schema public to authenticated;
