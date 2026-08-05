
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getPublishedBlogPosts } from '@/services/blog/getBlogPosts';
import { BlogPost } from '@/types/blog';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getBlogImageForTitle } from '@/constants/blogImages';
import { webpTwin } from '@/utils/blogImageFormats';

/** Nombre d'articles mis en avant sur la page d'accueil. */
const HOME_PREVIEW_COUNT = 3;

const BlogSection = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchPosts = async () => {
      if (!isMounted.current) return;
      
      try {
        setIsLoading(true);
        const publishedPosts = await getPublishedBlogPosts();
        
        if (!isMounted.current) return;
        
        console.log('Articles publiés chargés:', publishedPosts.length);

        // L'accueil ne présente qu'un aperçu : les trois articles les plus
        // récents. Le catalogue complet reste accessible via /blog.
        const latest = [...publishedPosts]
          .sort((a, b) => b.publishDate.localeCompare(a.publishDate))
          .slice(0, HOME_PREVIEW_COUNT);

        setBlogPosts(latest);
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    fetchPosts();
    
    channelRef.current = supabase
      .channel('blog-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts'
        },
        (payload) => {
          console.log('BlogSection: Changement détecté dans la table blog_posts:', payload);
          if (isMounted.current) {
            fetchPosts();
          }
        }
      )
      .subscribe();
    
    const handleInternalBlogUpdate = () => {
      console.log('BlogSection: Mise à jour interne des articles de blog détectée');
      if (isMounted.current) {
        fetchPosts();
      }
    };
    
    window.addEventListener('blogPostsUpdated', handleInternalBlogUpdate);
    
    return () => {
      isMounted.current = false;
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      window.removeEventListener('blogPostsUpdated', handleInternalBlogUpdate);
    };
  }, []);

  return (
    <section id="blog" className="section py-12 xs:py-16 md:py-20 bg-gray-50">
      <div className="container">
        <h2 className="heading-lg mb-3 md:mb-4 text-prisma-purple text-center">Notre Blog</h2>
        <p className="text-gray-600 mb-8 xs:mb-10 md:mb-12 measure mx-auto text-center">
          Restez informé des dernières tendances, conseils et actualités dans les domaines de la comptabilité, 
          des ressources humaines, et des technologies d'entreprise.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-prisma-purple"></div>
          </div>
        ) : blogPosts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="carte overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={webpTwin(post.image ?? '') ?? post.image}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover object-top"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Repli en deux temps : le WebP peut manquer pour une
                      // image téléversée depuis l'administration, on revient
                      // alors au fichier d'origine avant l'image par défaut.
                      if (post.image && target.src.endsWith('.webp')) {
                        target.src = post.image;
                        return;
                      }
                      console.log(`Image non chargée pour ${post.title}, utilisation de l'image par défaut`);
                      target.onerror = null;
                      target.src = getBlogImageForTitle(post.title);
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-prisma-purple/10 text-prisma-purple text-xs font-medium px-2.5 py-1 rounded">
                      {post.tags[0] || "Article"}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.publishDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-prisma-purple">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                  {/* Le chartreuse sur fond blanc plafonne à 1,48:1 de contraste,
                      très loin du minimum WCAG AA de 4,5:1. Il reste la couleur
                      d'accent sur fond violet, où il atteint 10,5:1. */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="cible-tactile text-prisma-purple font-medium text-sm hover:underline"
                  >
                    Lire la suite <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucun article publié pour le moment.</p>
          </div>
        )}
        
        {blogPosts.length > 0 && (
          <div className="mt-10 text-center">
            <Link 
              to="/blog"
              className="btn-primary inline-flex items-center"
            >
              Voir tous les articles <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
