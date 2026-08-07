-- Générateur de tâches fiscales : idempotence — 07/08/2026.
--
-- Les échéances du cabinet sont calendaires et répétitives (IGS et PSL
-- trimestriels, DSF, DARP, DBEF, Patente annuels). Le calendrier était
-- parfaitement modélisé dans `lib/spec/fiscal-constants.ts` et ne produisait
-- aucune tâche : le lien entre « ce client est assujetti » et « quelqu'un doit
-- préparer T3 avant le 15 août » se faisait de tête, chaque trimestre.
--
-- Une génération répétée ne doit pas créer de doublons. `reference_obligation`
-- identifie le couple obligation + période (« IGS-2026-T3 », « DSF-2026 ») et
-- l'index unique garantit qu'une même échéance ne peut être générée deux fois
-- pour un même client.

alter table public.tasks
  add column if not exists reference_obligation text;

comment on column public.tasks.reference_obligation is
  'Identifiant de l''echeance fiscale a l''origine de la tache (ex. IGS-2026-T3, DSF-2026). NULL pour une tache saisie a la main. Sert de cle d''idempotence au generateur.';

-- Index partiel : les tâches saisies à la main n'ont pas de référence et ne
-- doivent pas se gêner entre elles.
create unique index if not exists tasks_obligation_unique_idx
  on public.tasks (client_id, reference_obligation)
  where reference_obligation is not null;
