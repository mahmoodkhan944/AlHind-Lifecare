-- ============================================================================
-- AlHind Lifecare — Phone number check (002)
-- Backup check in the database, in case someone skips the website form and
-- calls the API directly. Safe to run more than once.
-- ============================================================================

create or replace function private.leads_phone_check()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_digits text;
begin
  if is_admin() or new.phone is null then
    return new;
  end if;

  v_digits := regexp_replace(new.phone, '[^0-9]', '', 'g');

  -- International numbers are at most 15 digits including country code
  if length(v_digits) > 15 then
    raise exception 'Please enter a valid phone number.' using errcode = 'P0422';
  end if;

  -- India (+91): exactly 10 digits after the country code
  if new.phone ~ '^\s*\+\s*91' and length(v_digits) <> 12 then
    raise exception 'Please enter a valid 10-digit Indian mobile number.' using errcode = 'P0422';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_leads_phone_check on public.leads;
create trigger trg_leads_phone_check
  before insert on public.leads
  for each row execute function private.leads_phone_check();