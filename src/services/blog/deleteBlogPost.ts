
import { supabase } from "@/integrations/supabase/client";

// Supprime par id
export const deleteBlogPost = async (postId: number): Promise<void> => {
  console.log("Suppression de l'article ID:", postId);

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    throw error;
  }

  console.log("Article supprimé avec succès, ID:", postId);
  window.dispatchEvent(new CustomEvent('blogPostsUpdated'));
};

// La suppression par fragment de titre (`ilike '%…%'`) a été retirée : elle
// supprimait en une requête tous les articles dont le titre contenait le
// fragment. Supprimer un article passe par son identifiant, depuis /admin.
