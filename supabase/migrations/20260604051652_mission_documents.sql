-- Migration: Mission documents (ordres de mission + rapports de mission)
--
-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ CONSERVEE POUR MEMOIRE — NE PAS REJOUER. Voir la migration               │
-- │ 20260801171728_creer_rapports_mission_et_bucket.sql, qui la remplace.    │
-- └──────────────────────────────────────────────────────────────────────────┘
--
-- Deux defauts, constates sur la base le 01/08/2026 :
--
--   1. Ligne « CREATE POLICY IF NOT EXISTS » (etape 4) : cette syntaxe n'existe
--      pas en PostgreSQL. L'instruction echoue, et l'echec annule la creation
--      de la table de l'etape 2. C'est pourquoi `rapports_mission` n'a jamais
--      existe en base alors que ce fichier etait present depuis le 04/06/2026.
--      Les colonnes `task_id` et `mission_doc_type` de `courriers` (etape 1)
--      sont bien presentes : elles ont ete posees par un autre chemin.
--
--   2. Etape 3, « FOR ALL USING (true) WITH CHECK (true) » : accorde un acces
--      total a tous les roles, anon compris, sur une table metier. Incompatible
--      avec le durcissement du 29/07/2026 (private.has_role).
--
-- La migration de remplacement cree la table, l'index, le trigger et le bucket,
-- avec des policies reservees au role authenticated et au role admin.

-- 1. Ajouter les colonnes de liaison mission dans la table courriers
ALTER TABLE courriers
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mission_doc_type TEXT;

-- 2. Créer la table rapports_mission
CREATE TABLE IF NOT EXISTS rapports_mission (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_format TEXT NOT NULL DEFAULT 'txt',
  contenu_parse TEXT,
  file_path TEXT,
  statut TEXT NOT NULL DEFAULT 'soumis',
  rapport_superviseur_id UUID,
  rapport_client_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. RLS pour rapports_mission
ALTER TABLE rapports_mission ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rapports_mission_all" ON rapports_mission
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Bucket de stockage pour les rapports de mission (best-effort)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('rapports-mission', 'rapports-mission', false, 5242880)
ON CONFLICT DO NOTHING;

CREATE POLICY IF NOT EXISTS "rapports_mission_storage_all" ON storage.objects
  FOR ALL USING (bucket_id = 'rapports-mission')
  WITH CHECK (bucket_id = 'rapports-mission');
