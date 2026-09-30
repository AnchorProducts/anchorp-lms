-- Lesson assignments: admins assign individual lessons to specific users.
create table if not exists public.lesson_assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

create index if not exists lesson_assignments_user_id_idx
  on public.lesson_assignments (user_id);

alter table public.lesson_assignments enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Learners read own lesson assignments" on public.lesson_assignments;
create policy "Learners read own lesson assignments"
  on public.lesson_assignments for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage lesson assignments" on public.lesson_assignments;
create policy "Admins manage lesson assignments"
  on public.lesson_assignments for all
  using (public.is_admin())
  with check (public.is_admin());

-- Enforce quizzes.max_attempts on the server, not just in the UI.
create or replace function public.enforce_quiz_max_attempts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed integer;
  used integer;
begin
  select max_attempts into allowed from public.quizzes where id = new.quiz_id;
  if allowed is null or allowed <= 0 then
    return new;
  end if;

  select count(*) into used
  from public.quiz_attempts
  where quiz_id = new.quiz_id and user_id = new.user_id;

  if used >= allowed then
    raise exception 'Maximum attempts (%) reached for this quiz.', allowed;
  end if;

  return new;
end;
$$;

drop trigger if exists quiz_attempts_max_attempts on public.quiz_attempts;
create trigger quiz_attempts_max_attempts
  before insert on public.quiz_attempts
  for each row execute function public.enforce_quiz_max_attempts();
