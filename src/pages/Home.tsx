import { useState, useEffect } from 'react';
import { ArrowRight, Download, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { databases, DB_ID } from '../../appwrite-config';

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadProfile(),
        loadProjects(),
        loadBlogs(),
        loadSettings()
      ]);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, 'profile', []);
      if (response.documents.length > 0) {
        setProfile(response.documents[0]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, 'projects', []);
      setProjects(response.documents.slice(0, 2)); // Get first 2 projects as featured
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadBlogs = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, 'blogs', []);
      setBlogs(response.documents.slice(0, 2)); // Get first 2 blogs as latest
    } catch (error) {
      console.error('Failed to load blogs:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, 'settings', []);
      if (response.documents.length > 0) {
        setSettings(response.documents[0]);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleResumeDownload = () => {
    if (settings?.resume_url) {
      window.open(settings.resume_url, '_blank');
    } else if (settings?.onlineresume_url) {
      window.open(settings.onlineresume_url, '_blank');
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-subtle overflow-hidden">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-subtle overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <img
                src={'/amasora.JPG'}
                alt={profile?.fullname || 'Profile'}
                className="w-32 h-32 rounded-full mx-auto shadow-elegant hover-glow transition-smooth"
              />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              Hi, I'm <span className="text-hero-gradient">{profile?.fullname?.split(' ')[0] || 'Developer'}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-4 animate-delay-100">
              {profile?.professional_title || 'Full Stack Developer'}
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-delay-200">
              {profile?.bio || 'Passionate developer creating amazing digital experiences'}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-delay-300">
              <Button asChild className="hover-lift">
                <Link to="/projects">
                  View My Work <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="hover-lift" onClick={handleResumeDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-4 animate-delay-400">
              {profile?.github && (
                <Button variant="ghost" size="icon" asChild className="hover-scale">
                  <a href={profile.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5" />
                  </a>
                </Button>
              )}
              {profile?.linkedin && (
                <Button variant="ghost" size="icon" asChild className="hover-scale">
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </Button>
              )}
              {profile?.email && (
                <Button variant="ghost" size="icon" asChild className="hover-scale">
                  <a href={`mailto:${profile.email}`}>
                    <Mail className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A showcase of my recent work and the technologies I'm passionate about
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {projects.map((project, index) => (
              <Card key={project.$id} className={`hover-lift shadow-elegant animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
                <CardContent className="p-0">
                  <img
                    src={project.projectimg_url || project.onlineimage_url || '/placeholder.svg'}
                    alt={project.project_title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{project.project_title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {project.project_description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technology_used?.split(',').slice(0, 3).map((tech: string) => (
                        <span
                          key={tech.trim()}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      {project.livedemo_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.livedemo_url} target="_blank" rel="noopener noreferrer">
                            Live Demo
                          </a>
                        </Button>
                      )}
                      {project.githubrepo_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={project.githubrepo_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" className="hover-lift">
              <Link to="/projects">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Latest Thoughts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights, tutorials, and thoughts on web development and technology
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {blogs.map((blog, index) => (
              <Card key={blog.$id} className={`hover-lift shadow-elegant animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
                <CardContent className="p-0">
                  <img
                    src={blog.blogimage_url || blog.onlineblogimage_url || '/placeholder.svg'}
                    alt={blog.post_title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(blog.blog_date).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        {blog.blog_tags?.split(',').slice(0, 2).map((tag: string) => (
                          <span
                            key={tag.trim()}
                            className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{blog.post_title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {blog.blog_excerpt}
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/blogs/${blog.$id}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" className="hover-lift">
              <Link to="/blogs">
                View All Posts <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Let's Work Together
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Have a project in mind? I'd love to hear about it and help bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="secondary" size="lg" asChild className="hover-lift">
              <Link to="/contact">
                Get In Touch <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover-lift" onClick={handleResumeDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}