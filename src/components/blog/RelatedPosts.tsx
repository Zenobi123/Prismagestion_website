
import React from "react";
import { Link } from "react-router-dom";
import { BlogPost } from "@/types/blog";

interface RelatedPostsProps {
  relatedPosts: BlogPost[];
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ relatedPosts }) => {
  if (!relatedPosts.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-prisma-purple mb-6">Articles similaires</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {relatedPosts.map(relatedPost => (
          <article key={relatedPost.id} className="carte overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src={relatedPost.image} 
                alt={relatedPost.title} 
                className="w-full h-32 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-prisma-purple">{relatedPost.title}</h3>
              <Link 
                to={`/blog/${relatedPost.slug}`}
                className="inline-flex items-center text-prisma-chartreuse font-medium text-sm hover:underline"
              >
                Lire l'article
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
