-- Durcissement anti-abus : bornes de longueur sur les tables de collecte
-- ouvertes aux visiteurs anonymes (contact, devis, rendez-vous). La RLS
-- autorise l'INSERT anonyme sur ces tables ; sans bornes, un attaquant
-- peut y injecter des payloads arbitrairement volumineux.
--
-- Les contraintes sont ajoutées en NOT VALID : elles s'appliquent à toutes
-- les nouvelles écritures sans faire échouer la migration si des lignes
-- historiques dépassaient déjà ces limites.

alter table public.contact_messages
  drop constraint if exists contact_messages_field_length_limits;
alter table public.contact_messages
  add constraint contact_messages_field_length_limits check (
    char_length(first_name) <= 200
    and char_length(last_name) <= 200
    and char_length(email) <= 320
    and char_length(coalesce(whatsapp, '')) <= 50
    and char_length(coalesce(subject, '')) <= 200
    and char_length(message) <= 5000
  ) not valid;

alter table public.quote_requests
  drop constraint if exists quote_requests_field_length_limits;
alter table public.quote_requests
  add constraint quote_requests_field_length_limits check (
    char_length(full_name) <= 200
    and char_length(email) <= 320
    and char_length(coalesce(phone, '')) <= 50
    and char_length(coalesce(service, '')) <= 100
    and char_length(coalesce(details, '')) <= 5000
  ) not valid;

alter table public.appointments
  drop constraint if exists appointments_field_length_limits;
alter table public.appointments
  add constraint appointments_field_length_limits check (
    char_length(full_name) <= 200
    and char_length(coalesce(phone, '')) <= 50
    and char_length(coalesce(subject, '')) <= 200
    and char_length(appointment_time) <= 20
    and char_length(coalesce(message, '')) <= 5000
  ) not valid;
