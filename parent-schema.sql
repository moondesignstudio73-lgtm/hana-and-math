-- Apply once in the dedicated academy database. Staff maintain records in the dashboard.
begin;
create table public.academy_students (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(trim(display_name)) > 0)
);
create table public.academy_guardians (
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.academy_students(id) on delete cascade,
  primary key(user_id,student_id)
);
create table public.academy_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.academy_students(id) on delete cascade,
  lesson_date date not null, subject text not null, summary text not null, homework text
);
create table public.academy_notices (
  id uuid primary key default gen_random_uuid(),
  posted_on date not null default current_date, title text not null, body text not null
);
create table public.academy_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.academy_students(id) on delete cascade,
  event_date date not null, title text not null, detail text not null default ''
);
create table public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.academy_students(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null, end_time time not null check (end_time > start_time), subject text not null
);
create index academy_record_dates on public.academy_records(student_id,lesson_date);
create index academy_event_dates on public.academy_events(event_date,student_id);
create index academy_lesson_days on public.academy_lessons(student_id,weekday);
alter table public.academy_students enable row level security;
alter table public.academy_guardians enable row level security;
alter table public.academy_records enable row level security;
alter table public.academy_notices enable row level security;
alter table public.academy_events enable row level security;
alter table public.academy_lessons enable row level security;
revoke all on public.academy_students, public.academy_guardians, public.academy_records, public.academy_notices, public.academy_events, public.academy_lessons from public, anon, authenticated;
grant select on public.academy_students, public.academy_guardians, public.academy_records, public.academy_notices, public.academy_events, public.academy_lessons to authenticated;
create policy guardian_own_links on public.academy_guardians for select to authenticated
  using (user_id = (select auth.uid()));
create policy guardian_students on public.academy_students for select to authenticated
  using (id in (select student_id from public.academy_guardians where user_id=(select auth.uid())));
create policy guardian_records on public.academy_records for select to authenticated
  using (student_id in (select student_id from public.academy_guardians where user_id=(select auth.uid())));
create policy approved_notices on public.academy_notices for select to authenticated
  using (exists (select 1 from public.academy_guardians where user_id=(select auth.uid())));
create policy guardian_events on public.academy_events for select to authenticated
  using (exists (select 1 from public.academy_guardians g where g.user_id=(select auth.uid())
    and (academy_events.student_id is null or academy_events.student_id=g.student_id)));
create policy guardian_lessons on public.academy_lessons for select to authenticated
  using (student_id in (select student_id from public.academy_guardians where user_id=(select auth.uid())));

-- Staff deliver the code through the guardian's verified contact channel.
create table public.academy_invitations (
  code uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(trim(email)) and position('@' in email)>1),
  student_id uuid not null references public.academy_students(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days')
);
alter table public.academy_invitations enable row level security;
revoke all on public.academy_invitations from public, anon, authenticated;
grant select, delete on public.academy_invitations to service_role;

-- Account creation, attaching the child and consuming the invitation commit together.
create schema if not exists academy_private;
create function academy_private.link_invited_guardian() returns trigger
language plpgsql security definer set search_path = '' as $$
declare linked_student uuid;
begin
  if new.raw_app_meta_data->>'academy_invite' is null then return new; end if;
  delete from public.academy_invitations
    where code = (new.raw_app_meta_data->>'academy_invite')::uuid
      and email = lower(new.email) and expires_at > now()
    returning student_id into strict linked_student;
  insert into public.academy_guardians(user_id,student_id) values(new.id,linked_student);
  return new;
end;
$$;
revoke all on function academy_private.link_invited_guardian() from public,anon,authenticated;
create trigger academy_invited_guardian after insert on auth.users
for each row execute function academy_private.link_invited_guardian();
commit;
