-- Private bucket for face photos. Run this in the Supabase SQL editor.
--
-- Objects MUST be uploaded under a '{userId}/' folder prefix (e.g.
-- '{userId}/face.jpg') so storage.foldername(name)[1] resolves to the
-- caller's uid. A flat filename with no folder separator would make that
-- helper return empty and break every storage RLS check below.

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "Users can upload own photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can view own photo"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can replace own photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
