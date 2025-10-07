import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Github, ExternalLink, Star } from 'lucide-react';
import { databases, DB_ID } from '../../appwrite-config';

export default function Projects() {
  const { state } = usePortfolio();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, 'projects');
      console.log('Loaded projects from database:', res.documents);
      setProjects(res.documents);
    } catch (error) {
      console.error('Failed to load projects:', error);
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
            My <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A collection of projects I've worked on, showcasing different technologies and approaches 
            to solving real-world problems. Each project represents a unique challenge and learning experience.
          </p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-lg text-muted-foreground">Loading projects...</div>
          </div>
        </section>
      )}

      {/* All Projects */}
      {!loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">My Projects</h2>
              <p className="text-lg text-muted-foreground">
                A showcase of my work and technical expertise
              </p>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <Card key={project.$id} className={`hover-lift shadow-elegant animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
                    <CardContent className="p-0">
                      <img
                        src={project.projectimg_url || project.onlineimage_url || '/placeholder-project.jpg'}
                        alt={project.project_title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-2">{project.project_title}</h3>
                        <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
                          {project.project_description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.technology_used && project.technology_used.split(',').slice(0, 3).map((tech: string) => (
                            <span
                              key={tech.trim()}
                              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                          {project.technology_used && project.technology_used.split(',').length > 3 && (
                            <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                              +{project.technology_used.split(',').length - 3}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {project.livedemo_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.livedemo_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          {project.githubrepo_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={project.githubrepo_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground">
                  Projects will be displayed here once they're added.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}
