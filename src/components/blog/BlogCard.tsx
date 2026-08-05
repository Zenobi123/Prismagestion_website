
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { BlogPost } from "@/types/blog";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const cardClass = featured 
    ? "carte overflow-hidden md:col-span-2"
    : "carte overflow-hidden";

  return (
    <article className={cardClass}>
      <div className={featured ? "md:flex" : ""}>
        <div className={featured ? "md:w-1/2" : ""}>
          <OptimizedImage 
            src={post.image} 
            alt={post.title}
            className={`w-full object-cover object-top ${featured ? "h-64 md:h-full" : "h-48"}`}
            fallback="/placeholder.svg"
            loading="lazy"
          />
        </div>
        <div className={`p-6 ${featured ? "md:w-1/2" : ""}`}>
          <h3 className={`font-heading font-bold text-prisma-purple mb-3 line-clamp-2 ${featured ? "text-2xl" : "text-xl"}`}>
            {post.title}
          </h3>
          <p className={`text-gray-600 mb-4 line-clamp-3 ${featured ? "text-base" : "text-sm"}`}>
            {post.excerpt}
          </p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <div className="flex items-center mr-4">
              <User className="h-4 w-4 mr-1" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(post.publishDate).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="bg-prisma-purple/10 text-prisma-purple text-xs font-medium px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <Link 
            to={`/blog/${post.slug}`}
            className="inline-flex items-center text-prisma-chartreuse font-medium hover:underline"
          >
            Lire l'article
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
