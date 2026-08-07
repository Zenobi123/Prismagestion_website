
import { supabase } from "@gestion/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@gestion/integrations/supabase/types";
import { Collaborateur, NouveauCollaborateur } from "@gestion/types/collaborateur";

// Les lectures visent la vue `collaborateurs_charge`, les écritures la table
// `collaborateurs`. La vue ajoute `tachesencours`, agrégé depuis `tasks` : la
// colonne dénormalisée du même nom a été supprimée le 07/08/2026, parce que
// la tenir à jour obligeait `getTasks()` à écrire au milieu d'une lecture.
const VUE_LECTURE = 'collaborateurs_charge';
const TABLE_ECRITURE = 'collaborateurs';

export const getCollaborateurs = async (): Promise<Collaborateur[]> => {
  const { data, error } = await supabase
    .from(VUE_LECTURE)
    .select('*')
    .eq('statut', 'actif')
    .order('nom', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as unknown as Collaborateur[];
};

export const getCollaborateur = async (id: string): Promise<Collaborateur | null> => {
  const { data, error } = await supabase
    .from(VUE_LECTURE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as Collaborateur;
};

export const createCollaborateur = async (collaborateurData: NouveauCollaborateur): Promise<Collaborateur> => {
  const { data, error } = await supabase
    .from(TABLE_ECRITURE)
    .insert([collaborateurData as unknown as TablesInsert<"collaborateurs">])
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Collaborateur;
};

export const addCollaborateur = createCollaborateur; // Alias for backward compatibility

export const updateCollaborateur = async (id: string, updates: Partial<NouveauCollaborateur>): Promise<Collaborateur> => {
  const { data, error } = await supabase
    .from(TABLE_ECRITURE)
    .update(updates as unknown as TablesUpdate<"collaborateurs">)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Collaborateur;
};

export const deleteCollaborateur = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_ECRITURE)
    .update({ statut: 'inactif' })
    .eq('id', id);

  if (error) throw error;
};
