
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogPost as BlogPostType } from '@/types/blog';
import { getPublishedBlogPosts } from '@/services/blog/getBlogPosts';
import { getBlogPostBySlug } from '@/services/blog/getBlogPost';
import { SEOHead } from '@/components/SEOHead';
import { MetadataService } from '@/services/metadataService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import RelatedPosts from '@/components/blog/RelatedPosts';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        const fetchedPost = await getBlogPostBySlug(slug);
        if (!fetchedPost) {
          navigate('/blog');
          return;
        }
        
        setPost(fetchedPost);
        const allPosts = await getPublishedBlogPosts();
        
        // Find similar posts
        const similarPosts = allPosts.filter(p => 
          p.id !== fetchedPost.id && 
          (p.tags.some(tag => fetchedPost.tags.includes(tag)) || p.author === fetchedPost.author)
        ).slice(0, 3);
        
        setRelatedPosts(similarPosts);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'article:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-prisma-purple"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const metadata = MetadataService.generateBlogMetadata(post);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        config={{
          title: metadata.title,
          description: metadata.description,
          keywords: metadata.keywords,
          ogImage: metadata.ogImage,
          canonicalUrl: metadata.canonicalUrl,
          type: 'article',
          publishedTime: metadata.publishedTime,
          author: metadata.author
        }}
      />
      <Navbar />
      <main className="flex-grow pt-24 xs:pt-28 md:pt-36 lg:pt-44 pb-16">
        <div className="container mx-auto px-0 max-w-full">
          <div className="px-4 md:px-8 max-w-4xl mx-auto">
            <BlogPostHeader post={post} onBackClick={() => navigate('/blog')} />
          </div>
          <BlogPostContent content={post.content} />
          <div className="px-4 md:px-8 max-w-4xl mx-auto">
            <RelatedPosts relatedPosts={relatedPosts} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
