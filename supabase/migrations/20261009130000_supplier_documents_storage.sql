-- Create storage bucket for supplier profile documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('supplier-documents', 'supplier-documents', false, 10485760,
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set 
  public = false, 
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS policies for supplier-documents bucket
drop policy if exists "merchants_can_upload_to_own_folder" on storage.objects;
create policy "merchants_can_upload_to_own_folder" on storage.objects for insert
to authenticated
with check (
  bucket_id = 'supplier-documents' 
  and (storage.foldername(name))[1] in (
    select id::text from public.merchant_profiles where profile_id = auth.uid()
  )
);

drop policy if exists "merchants_can_read_own_files" on storage.objects;
create policy "merchants_can_read_own_files" on storage.objects for select
to authenticated
using (
  bucket_id = 'supplier-documents' 
  and (storage.foldername(name))[1] in (
    select id::text from public.merchant_profiles where profile_id = auth.uid()
  )
);

drop policy if exists "admins_can_read_all_supplier_documents" on storage.objects;
create policy "admins_can_read_all_supplier_documents" on storage.objects for select
to authenticated
using (
  bucket_id = 'supplier-documents' 
  and public.is_admin()
);
