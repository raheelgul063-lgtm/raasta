-- Raasta database setup. Paste into Supabase: SQL Editor > New query > Run.

-- 1. University applications per student
create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  university  text not null check (char_length(university) <= 200),
  program     text not null check (char_length(program) <= 200),
  portal      text not null default 'uni-assist' check (char_length(portal) <= 50),
  deadline    date,
  status      text not null default 'planning' check (status in ('planning','applied','admitted','rejected')),
  notes       text check (char_length(notes) <= 2000),
  created_at  timestamptz not null default now()
);
create index if not exists applications_user_idx on public.applications(user_id);

-- 2. Document checklist ticks per student
create table if not exists public.checklist_items (
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  item_key   text not null check (char_length(item_key) <= 60),
  done       boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

-- 3. Daily AI usage per student (keeps API costs under control)
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  credits int  not null default 0,
  primary key (user_id, day)
);

-- Row Level Security: every student only sees their own rows
alter table public.applications    enable row level security;
alter table public.checklist_items enable row level security;
alter table public.ai_usage        enable row level security;

drop policy if exists "own applications" on public.applications;
create policy "own applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own checklist" on public.checklist_items;
create policy "own checklist" on public.checklist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "read own usage" on public.ai_usage;
create policy "read own usage" on public.ai_usage
  for select using (auth.uid() = user_id);
-- No insert/update policy on ai_usage: only the function below can change it.

-- Atomic credit check used by the AI Edge Function.
-- Returns true and spends credits if the student is under the daily limit.
create or replace function public.use_ai_credit(p_cost int, p_daily_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  used int;
begin
  if uid is null then return false; end if;
  if p_cost < 1 or p_cost > 10 then return false; end if;

  insert into ai_usage (user_id, day, credits) values (uid, current_date, 0)
  on conflict (user_id, day) do nothing;

  select credits into used from ai_usage where user_id = uid and day = current_date for update;
  if used + p_cost > p_daily_limit then return false; end if;

  update ai_usage set credits = credits + p_cost where user_id = uid and day = current_date;
  return true;
end;
$$;

revoke all on function public.use_ai_credit(int, int) from public, anon;
grant execute on function public.use_ai_credit(int, int) to authenticated;

-- Handy view for you (run in SQL editor): how many students and AI calls per day
-- select day, count(*) as students, sum(credits) as credits from ai_usage group by day order by day desc;

-- =====================================================================
-- Part 2: student profiles, feedback, admin dashboard
-- =====================================================================

-- 4. Student profile (filled once after first login)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  full_name    text check (char_length(full_name) <= 120),
  city         text check (char_length(city) <= 80),
  province     text check (char_length(province) <= 40),
  field        text check (char_length(field) <= 80),
  degree_level text check (char_length(degree_level) <= 40),
  intake       text check (char_length(intake) <= 40),
  updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- 5. Feedback from the Facebook test (anyone can send, nobody can read except admins via the function)
create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete set null default auth.uid(),
  rating     int check (rating between 1 and 5),
  message    text check (char_length(message) <= 2000),
  page       text check (char_length(page) <= 40),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists "send feedback" on public.feedback;
create policy "send feedback" on public.feedback
  for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());

-- 6. Admins: put your own login email here (the one you use with Google)
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;  -- no policies: not readable from the website
-- insert into public.admins (email) values ('YOUR_EMAIL@gmail.com');

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- Everything the admin dashboard shows, in one call
create or replace function public.admin_stats()
returns json language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  return json_build_object(
    'students',        (select count(*) from auth.users),
    'new_7d',          (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active_today',    (select count(*) from ai_usage where day = current_date),
    'profiles',        (select count(*) from profiles),
    'applications',    (select count(*) from applications),
    'admitted',        (select count(*) from applications where status = 'admitted'),
    'docs_ticked',     (select count(*) from checklist_items where done),
    'ai_today',        (select coalesce(sum(credits), 0) from ai_usage where day = current_date),
    'ai_7d',           (select coalesce(sum(credits), 0) from ai_usage where day > current_date - 7),
    'feedback_count',  (select count(*) from feedback),
    'avg_rating',      (select round(avg(rating)::numeric, 1) from feedback where rating is not null),
    'daily', (
      select coalesce(json_agg(d order by d.day), '[]'::json) from (
        select g::date as day,
          (select count(*) from auth.users u where u.created_at::date = g::date) as signups,
          (select coalesce(sum(credits), 0) from ai_usage a where a.day = g::date) as ai
        from generate_series(current_date - 13, current_date, interval '1 day') g
      ) d),
    'top_universities', (
      select coalesce(json_agg(t), '[]'::json) from (
        select university as label, count(*) as n from applications group by university order by n desc limit 8
      ) t),
    'fields', (
      select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(nullif(field, ''), 'Not set') as label, count(*) as n from profiles group by 1 order by n desc limit 8
      ) t),
    'provinces', (
      select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(nullif(province, ''), 'Not set') as label, count(*) as n from profiles group by 1 order by n desc
      ) t),
    'recent_students', (
      select coalesce(json_agg(t), '[]'::json) from (
        select u.email, p.full_name, p.city, p.field, p.intake, u.created_at,
               coalesce(u.raw_app_meta_data ->> 'provider', 'email') as provider
        from auth.users u left join profiles p on p.id = u.id
        order by u.created_at desc limit 25
      ) t),
    'recent_feedback', (
      select coalesce(json_agg(t), '[]'::json) from (
        select f.rating, f.message, f.page, f.created_at, u.email
        from feedback f left join auth.users u on u.id = f.user_id
        order by f.created_at desc limit 25
      ) t)
  );
end;
$$;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- =====================================================================
-- Part 3: University finder
-- =====================================================================
create table if not exists public.programs (
  id              serial primary key,
  university      text not null,
  program         text not null,
  degree          text not null check (degree in ('Master','Bachelor')),
  title           text,
  field           text not null,
  city            text,
  state           text,
  type            text,
  language        text default 'English',
  duration        int,            -- semesters
  tuition         int,            -- EUR per semester for non EU students, 0 = free, null = check page
  tuition_note    text,
  semester_fee    text,
  intakes         text[] not null default '{}',
  deadline_winter text,           -- 'MM-DD' non EU deadline for winter intake
  deadline_summer text,           -- 'MM-DD' non EU deadline for summer intake
  deadline_note   text,
  english_req     text,
  other_req       text,
  apply_via       text,
  summary         text,
  url             text not null,  -- official listing, students are redirected here
  source          text,
  verified_on     date,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists programs_field_idx on public.programs(field);
alter table public.programs enable row level security;
drop policy if exists "programs are public" on public.programs;
create policy "programs are public" on public.programs for select to anon, authenticated using (active);

-- Link tracker entries to a program (optional)
alter table public.applications add column if not exists program_id int references public.programs(id) on delete set null;
alter table public.applications add column if not exists url text check (char_length(url) <= 500);

-- Saved (shortlisted) programs per student
create table if not exists public.saved_programs (
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  program_id int  not null references public.programs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, program_id)
);
alter table public.saved_programs enable row level security;
drop policy if exists "own saved" on public.saved_programs;
create policy "own saved" on public.saved_programs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
