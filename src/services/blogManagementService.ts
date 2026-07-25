
import { deleteBlogPostByTitle } from '@/services/blog';
import { updateBlogPostImage, enforceImagesConsistency } from '@/services/blog';
import { addBlogPost } from '@/services/blog/createBlogPost';
import { getPublishedBlogPosts } from '@/services/blog';

export class BlogManagementService {
  static async performMaintenanceTasks(): Promise<void> {
    try {
      // Remove problematic article
      await deleteBlogPostByTitle('nouvelles normes comptables pour 2025');
      
      // Fix IGS article image
      await updateBlogPostImage(
        'Impôt Général Synthétique', 
        "/blog-images/impot-general-synthetique.jpg"
      );
      
      // Update fiscal norms 2025 image
      await updateBlogPostImage(
        'Les nouvelles normes fiscales et comptables pour 2025',
        "/blog-images/normes-fiscales-2025.jpg"
      );

      // Enforce image consistency
      await enforceImagesConsistency();
    } catch (error) {
      console.error("Erreur lors des tâches de maintenance du blog:", error);
    }
  }

  static async ensureRequiredArticles(): Promise<boolean> {
    try {
      const allPosts = await getPublishedBlogPosts();
      const exists = allPosts.some(post =>
        post.title === "Les nouvelles normes fiscales et comptables pour 2025"
      );
      
      if (!exists) {
        console.log("Article 'Les nouvelles normes fiscales et comptables pour 2025' non trouvé, création en cours...");
        await addBlogPost({
          title: "Les nouvelles normes fiscales et comptables pour 2025",
          excerpt: "Lois des finances 2025, ce que vous devez savoir.",
          content: "",
          author: "Nathan OBIANG TIME",
          publishDate: "2025-04-22",
          status: "Publié",
          image: "/blog-images/normes-fiscales-2025.jpg",
          slug: "nouvelles-normes-fiscales-2025",
          tags: ["Fiscalité"],
          seoTitle: "",
          seoDescription: ""
        });
        console.log("Nouvel article créé avec succès");
        return true;
      } else {
        console.log("L'article existe déjà");
        await updateBlogPostImage(
          'Les nouvelles normes fiscales et comptables pour 2025',
          "/blog-images/normes-fiscales-2025.jpg"
        );
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des articles requis:", error);
      return false;
    }
  }
}
