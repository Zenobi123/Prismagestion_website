
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, BlogPostStatus } from "@/types/blog";
import { DEFAULT_BLOG_POSTS } from "./getBlogPosts";
import { getBlogImageForTitle } from "@/constants/blogImages";

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    // Base injoignable ou requête en erreur : on sert la version embarquée de
    // l'article plutôt que de renvoyer le visiteur vers la liste (cf. BlogPost.tsx).
    if (error) {
      console.error(`Erreur lors de la récupération de l'article avec slug "${slug}":`, error);
      return DEFAULT_BLOG_POSTS.find(p => p.slug === slug) ?? null;
    }

    if (!data) {
      return DEFAULT_BLOG_POSTS.find(p => p.slug === slug) ?? null;
    }

    const defaultImage = getBlogImageForTitle(data.title);
    const defaultPost = DEFAULT_BLOG_POSTS.find(p => p.slug === data.slug);

    return {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt || defaultPost?.excerpt || "",
      content: data.content || defaultPost?.content || "",
      author: data.author || defaultPost?.author || "",
      publishDate: data.publish_date || defaultPost?.publishDate || new Date().toISOString().split('T')[0],
      status: data.status as BlogPostStatus || defaultPost?.status || "Brouillon",
      image: data.image || defaultImage || defaultPost?.image,
      slug: data.slug,
      tags: Array.isArray(data.tags) ? data.tags : defaultPost?.tags || [],
      seoTitle: data.seo_title || defaultPost?.seoTitle || "",
      seoDescription: data.seo_description || defaultPost?.seoDescription || "",
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'article avec slug "${slug}":`, error);
    return DEFAULT_BLOG_POSTS.find(p => p.slug === slug) ?? null;
  }
};
