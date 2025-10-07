import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { ArrowRight, Calendar, Tag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { databases, DB_ID } from '../../appwrite-config';

export default function Blogs() {
  const { state } = usePortfolio();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, 'blogs');
      console.log('Loaded blogs from database:', res.documents);
      setBlogs(res.documents);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-gradient">Blog</span> & Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Thoughts, tutorials, and insights about web development, technology trends, 
            and lessons learned from building digital products. 
          </p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-lg text-muted-foreground">Loading blog posts...</div>
          </div>
        </section>
      )}

      {/* All Posts */}
      {!loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Recent Posts</h2>
              <p className="text-lg text-muted-foreground">
                Latest articles and insights
              </p>
            </div>

            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog, index) => (
                  <Card key={blog.$id} className={`hover-lift shadow-elegant animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
                    <CardContent className="p-0">
                      <img
                        src={blog.blogimage_url || blog.onlineblogimage_url || '/placeholder-blog.jpg'}
                        alt={blog.post_title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(blog.blog_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2 leading-tight">{blog.post_title}</h3>
                        <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
                          {blog.blog_excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {blog.blog_tags && blog.blog_tags.split(',').slice(0, 3).map((tag: string) => (
                            <span
                              key={tag.trim()}
                              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                        
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/blogs/${blog.$id}`}>
                            Read More <ArrowRight className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No Blog Posts Yet</h3>
                <p className="text-muted-foreground">
                  Blog posts will appear here once they're published.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}