-- ============================================================================
-- AlHind Lifecare — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper: auto-maintain updated_date on every table
-- ----------------------------------------------------------------------------
create or replace function set_updated_date()
returns trigger as $$
begin
  new.updated_date = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, holds app role (admin / user)
-- Created automatically for every new auth.users row.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function set_updated_date();

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

alter table public.profiles enable row level security;

create policy "profiles: user can read own" on public.profiles
  for select using (auth.uid() = id or is_admin());

create policy "profiles: user can update own (not role)" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles: admin can update any" on public.profiles
  for update using (is_admin());

-- ----------------------------------------------------------------------------
-- doctors
-- ----------------------------------------------------------------------------
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  photo_url text,
  speciality text not null,
  designation text,
  experience_years numeric,
  qualifications text,
  hospital_name text,
  hospital_id text,
  country text default 'India' check (country in ('India','Turkey')),
  city text,
  languages text,
  bio text,
  consultation_fee_usd numeric,
  rating numeric,
  reviews_count numeric default 0,
  treatments_offered text,
  specializations text,
  treatments_list text,
  overview text,
  overview_points text,
  detailed_experience text,
  experience_details text,
  qualifications_list text,
  clinical_focus text,
  additional_info text,
  research_publications text,
  awards_achievements text,
  award_document_url text,
  why_choose_doctor text,
  featured boolean default false,
  status text default 'active' check (status in ('active','inactive')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_doctors_updated before update on public.doctors for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- hospitals
-- ----------------------------------------------------------------------------
create table public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  logo_url text,
  cover_image_url text,
  country text default 'India' check (country in ('India','Turkey')),
  city text not null,
  address text,
  state text,
  hospital_type text,
  google_maps_embed_url text,
  description text,
  hospital_owner text,
  full_description text,
  specialities text,
  doctors_list text,
  facilities text,
  international_patient_services text,
  accreditations text,
  area_of_expertise text,
  infrastructure_details text,
  awards text,
  emergency_services boolean default false,
  parking_available boolean default false,
  beds_count numeric,
  established_year numeric,
  rating numeric,
  reviews_count numeric default 0,
  doctors_count numeric default 0,
  contact_email text,
  contact_phone text,
  website text,
  featured boolean default false,
  status text default 'active' check (status in ('active','inactive')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_hospitals_updated before update on public.hospitals for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- treatments
-- ----------------------------------------------------------------------------
create table public.treatments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  category text not null,
  description text,
  detailed_content text,
  image_url text,
  key_benefits text,
  treatment_procedures text,
  overview text,
  additional_information text,
  signs_symptoms text,
  related_conditions text,
  diagnosis text,
  treatment_types text,
  surgery_types text,
  how_its_done text,
  purpose text,
  recovery_details text,
  risks text,
  success_rate text,
  summary text,
  why_choose_india text,
  gvhd_info text,
  gvhd_symptoms text,
  conditions_treated text,
  diagnosis_detail text,
  why_india_detail text,
  cost_range_usd text,
  duration text,
  recovery_time text,
  country text default 'Both' check (country in ('India','Turkey','Both')),
  hospitals_count numeric default 0,
  doctors_count numeric default 0,
  featured boolean default false,
  status text default 'active' check (status in ('active','inactive')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_treatments_updated before update on public.treatments for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- blog_posts
-- ----------------------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  excerpt text,
  content text not null,
  cover_image_url text,
  category text,
  author text,
  tags text,
  status text default 'draft' check (status in ('draft','published')),
  featured boolean default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_blog_posts_updated before update on public.blog_posts for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- testimonials
-- ----------------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  country text,
  photo_url text,
  treatment text,
  hospital text,
  doctor text,
  rating numeric,
  review_text text not null,
  video_url text,
  featured boolean default false,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_testimonials_updated before update on public.testimonials for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- faqs
-- ----------------------------------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  "order" numeric default 0,
  status text default 'active' check (status in ('active','inactive')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_faqs_updated before update on public.faqs for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- site_settings (single row, but modeled as a table for consistency)
-- ----------------------------------------------------------------------------
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null,
  email text,
  phone text,
  whatsapp_number text,
  address text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,
  emergency_phone text,
  support_email text,
  postal_code text,
  weekday_hours text,
  weekend_hours text,
  departments text,
  google_maps_embed_url text,
  latitude text,
  longitude text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_site_settings_updated before update on public.site_settings for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- leads (contains PII — private)
-- ----------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  email text not null,
  phone text,
  country text,
  treatment_interest text,
  message text,
  source text default 'website' check (source in ('website','whatsapp','referral','social','other')),
  status text default 'new' check (status in ('new','contacted','follow_up','interested','quotation_sent','converted','closed')),
  assigned_to text,
  notes text,
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_leads_updated before update on public.leads for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- appointments (contains PII — private)
-- ----------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  patient_email text not null,
  patient_phone text,
  patient_country text,
  doctor_id text,
  doctor_name text,
  hospital_id text,
  hospital_name text,
  treatment text not null,
  preferred_date date,
  medical_reports_url text,
  notes text,
  status text default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_appointments_updated before update on public.appointments for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- quotes (contains PII — private)
-- ----------------------------------------------------------------------------
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null,
  patient_name text not null,
  treatment text not null,
  hospital_name text,
  country text,
  estimated_cost_usd numeric,
  cost_currency text default 'USD',
  cost_breakdown text,
  duration_of_stay text,
  inclusions text,
  exclusions text,
  validity_days numeric default 30,
  notes text,
  status text default 'draft' check (status in ('draft','sent','accepted','rejected')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_quotes_updated before update on public.quotes for each row execute function set_updated_date();

-- ----------------------------------------------------------------------------
-- newsletter_subscribers (contains PII — private)
-- ----------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text default 'subscribed' check (status in ('subscribed','unsubscribed')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger trg_newsletter_updated before update on public.newsletter_subscribers for each row execute function set_updated_date();

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Public content: anyone can read, only admins can write
alter table public.doctors enable row level security;
alter table public.hospitals enable row level security;
alter table public.treatments enable row level security;
alter table public.blog_posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['doctors','hospitals','treatments','blog_posts','testimonials','faqs','site_settings']
  loop
    execute format('create policy "%1$s: public read" on public.%1$s for select using (true)', t);
    execute format('create policy "%1$s: admin write" on public.%1$s for insert with check (is_admin())', t);
    execute format('create policy "%1$s: admin update" on public.%1$s for update using (is_admin())', t);
    execute format('create policy "%1$s: admin delete" on public.%1$s for delete using (is_admin())', t);
  end loop;
end $$;

-- Private/PII tables: public can INSERT only (lead capture forms), admin can read/write/delete
alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.quotes enable row level security;
alter table public.newsletter_subscribers enable row level security;

do $$
declare t text;
begin
  foreach t in array array['leads','appointments','quotes','newsletter_subscribers']
  loop
    execute format('create policy "%1$s: public insert" on public.%1$s for insert with check (true)', t);
    execute format('create policy "%1$s: admin read" on public.%1$s for select using (is_admin())', t);
    execute format('create policy "%1$s: admin update" on public.%1$s for update using (is_admin())', t);
    execute format('create policy "%1$s: admin delete" on public.%1$s for delete using (is_admin())', t);
  end loop;
end $$;

-- ============================================================================
-- Storage bucket for uploaded files (doctor photos, hospital images, docs...)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "uploads: public read"
  on storage.objects for select
  using (bucket_id = 'uploads');

create policy "uploads: admin write"
  on storage.objects for insert
  with check (bucket_id = 'uploads' and is_admin());

create policy "uploads: admin update"
  on storage.objects for update
  using (bucket_id = 'uploads' and is_admin());

create policy "uploads: admin delete"
  on storage.objects for delete
  using (bucket_id = 'uploads' and is_admin());

-- ============================================================================
-- Make yourself an admin after you sign up once through the app:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================================
