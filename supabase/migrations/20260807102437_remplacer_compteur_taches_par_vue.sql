-- Charge des collaborateurs : une vue, plutôt qu'un compteur dénormalisé.
--
-- `collaborateurs.tachesencours` était tenu à jour par le code applicatif, à
-- trois endroits concurrents (création de tâche, changement de statut,
-- suppression) puis resynchronisé intégralement à chaque appel de
-- `getTasks()`. Un compteur qu'il faut recalculer à chaque lecture n'est pas
-- un compteur : c'est un agrégat. Il en devient un.
--
-- L'ordre compte : la colonne doit disparaître AVANT la création de la vue,
-- sinon `c.*` et l'agrégat produisent deux colonnes `tachesencours`.

alter table public.collaborateurs drop column tachesencours;

-- Une tâche pèse sur la charge dès qu'elle est commencée et pas terminée.
-- Une tâche en retard compte : elle reste à faire. Une tâche planifiée dont
-- la date de début est à venir ne compte pas. Cette règle est la transcription
-- exacte de `peseSurLaCharge()` de `lib/spec/statutTache.ts` — les deux
-- doivent évoluer ensemble.
--
-- `security_invoker = true` (PostgreSQL 15+) est indispensable : sans lui la
-- vue s'exécuterait avec les droits de son propriétaire et court-circuiterait
-- les policies de `collaborateurs` et de `tasks`.
--
-- Attention : `c.*` est résolu une fois pour toutes à la création. Ajouter une
-- colonne à `collaborateurs` impose de recréer cette vue.
create view public.collaborateurs_charge
with (security_invoker = true) as
select
  c.*,
  coalesce(t.charge, 0)::int as tachesencours
from public.collaborateurs c
left join (
  select
    collaborateur_id,
    count(*) as charge
  from public.tasks
  where status <> 'termine'
    and (
      (end_date is not null and end_date < current_date)
      or status = 'en_cours'
      or (status = 'en_attente' and start_date is not null and start_date <= current_date)
    )
  group by collaborateur_id
) t on t.collaborateur_id = c.id;

comment on view public.collaborateurs_charge is
  'Collaborateurs et leur charge courante. Remplace le compteur dénormalisé collaborateurs.tachesencours, supprimé le 07/08/2026. Lecture seule : les écritures visent la table collaborateurs.';

revoke all on public.collaborateurs_charge from anon, public;
grant select on public.collaborateurs_charge to authenticated;
