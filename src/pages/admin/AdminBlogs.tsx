import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, Save, X, Upload, Calendar, Tag } from 'lucide-react';
import { databases, storage, account, APPWRITE, DB_ID, BUCKET_ID } from '../../../appwrite-config';
import { Query, Permission, Role } from 'appwrite';

export default function AdminBlogs() {
  const { state, dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    post_title: '',
    blog_excerpt: '',
    blog_content: '',
    blogimage_url: '',
    blog_date: new Date().toISOString().split('T')[0],
    blog_tags: '',
    onlineblogimage_url: ''
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/admin');
      return;
    }
    loadBlogs();
  }, [state.isAuthenticated, navigate]);

  const loadBlogs = async () => {
    try {
      // Check if session is valid before making database calls
      await account.get();
      const res = await databases.listDocuments(DB_ID, 'blogs');
      console.log('Loaded blogs from database:', res.documents);
      setBlogs(res.documents);
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to load blogs', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      post_title: '',
      blog_excerpt: '',
      blog_content: '',
      blogimage_url: '',
      blog_date: new Date().toISOString().split('T')[0],
      blog_tags: '',
      onlineblogimage_url: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check session before database operations
      await account.get();
      const payload = {
        post_title: formData.post_title,
        blog_excerpt: formData.blog_excerpt,
        blog_content: formData.blog_content,
        blogimage_url: formData.blogimage_url,
        blog_date: formData.blog_date,
        blog_tags: formData.blog_tags,
        onlineblogimage_url: formData.onlineblogimage_url,
      };

      if (editingId) {
        // Update existing blog
        await databases.updateDocument(
          DB_ID,
          'blogs',
          editingId,
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
        toast({
          title: "Blog Post Updated",
          description: "The blog post has been updated successfully.",
        });
      } else {
        // Add new blog
        await databases.createDocument(
          DB_ID,
          'blogs',
          'unique()',
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
        toast({
          title: "Blog Post Added",
          description: "New blog post has been published successfully.",
        });
      }

      // Reload blogs from database
      await loadBlogs();
      resetForm();
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to save blog post', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: any) => {
    setFormData({
      post_title: blog.post_title || '',
      blog_excerpt: blog.blog_excerpt || '',
      blog_content: blog.blog_content || '',
      blogimage_url: blog.blogimage_url || '',
      blog_date: blog.blog_date || '',
      blog_tags: blog.blog_tags || '',
      onlineblogimage_url: blog.onlineblogimage_url || ''
    });
    setEditingId(blog.$id);
    setIsAdding(true);
  };

  const handleDelete = async (blogId: string) => {
    try {
      // Check session before database operations
      await account.get();
      await databases.deleteDocument(DB_ID, 'blogs', blogId);
      toast({
        title: "Blog Post Deleted",
        description: "The blog post has been removed successfully.",
      });
      // Reload blogs from database
      await loadBlogs();
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Check session before storage operations
      await account.get();
      
      const uploaded = await storage.createFile(
        BUCKET_ID,
        APPWRITE.ID.unique(),
        file,
        [Permission.read(Role.users()), Permission.update(Role.users()), Permission.delete(Role.users())]
      );
      
      const fileId = uploaded.$id;
      const imageUrl = `https://syd.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=68d60226000a9faf9d65&mode=admin`;
      const cacheBusted = `${imageUrl}&t=${Date.now()}`;
      
      setFormData(prev => ({ ...prev, blogimage_url: cacheBusted }));
      
      toast({
        title: "Image Uploaded",
        description: "Blog image has been uploaded successfully.",
      });
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to upload image', variant: 'destructive' });
    }
  };

  if (!state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-white border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" asChild className="mr-4">
                <Link to="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gradient">Manage Blog Posts</h1>
            </div>
            <Button onClick={() => setIsAdding(true)} className="hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Write Post
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="mb-8 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                {editingId ? 'Edit Blog Post' : 'Write New Blog Post'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="post_title">Post Title</Label>
                  <Input
                    id="post_title"
                    value={formData.post_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, post_title: e.target.value }))}
                    placeholder="e.g., Building Scalable React Applications"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="blog_excerpt">Excerpt</Label>
                  <Textarea
                    id="blog_excerpt"
                    value={formData.blog_excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, blog_excerpt: e.target.value }))}
                    rows={3}
                    placeholder="A brief summary of your blog post that will appear in listings..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="blog_content">Content</Label>
                  <Textarea
                    id="blog_content"
                    value={formData.blog_content}
                    onChange={(e) => setFormData(prev => ({ ...prev, blog_content: e.target.value }))}
                    rows={12}
                    placeholder="Write your full blog post content here..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="blogimage_url">Featured Image</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    {formData.blogimage_url && (
                      <img src={formData.blogimage_url} alt="Preview" className="w-32 h-20 object-cover rounded-lg" />
                    )}
                    <div>
                      <Label htmlFor="imageFile" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <Input
                    value={formData.blogimage_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, blogimage_url: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="onlineblogimage_url">Online Blog Image URL (optional)</Label>
                  <Input
                    id="onlineblogimage_url"
                    value={formData.onlineblogimage_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, onlineblogimage_url: e.target.value }))}
                    placeholder="https://example.com/blog-image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blog_date">Publish Date</Label>
                    <Input
                      id="blog_date"
                      type="date"
                      value={formData.blog_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, blog_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog_tags">Tags (comma-separated)</Label>
                    <Input
                      id="blog_tags"
                      value={formData.blog_tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, blog_tags: e.target.value }))}
                      placeholder="React, JavaScript, Tutorial"
                    />
                  </div>
                </div>


                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" className="hover-lift" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : (editingId ? 'Update' : 'Publish')} Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Blog Posts List */}
        <div className="space-y-6">
          {blogs.map((blog) => (
            <Card key={blog.$id} className="shadow-elegant hover-lift">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <img
                    src={blog.blogimage_url || blog.onlineblogimage_url || '/placeholder-blog.jpg'}
                    alt={blog.post_title}
                    className="w-full lg:w-48 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
                          {blog.post_title}
                        </h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2">{blog.blog_excerpt}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(blog.blog_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {blog.blog_tags && blog.blog_tags.split(',').slice(0, 3).map((tag: string) => (
                              <span
                                key={tag.trim()}
                                className="flex items-center text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(blog.$id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {blogs.length === 0 && (
          <Card className="shadow-elegant">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start sharing your knowledge and insights by writing your first blog post.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Write Your First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}