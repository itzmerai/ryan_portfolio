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
import { ArrowLeft, Plus, Edit, Trash2, FolderOpen, Save, X, Upload, ExternalLink, Github } from 'lucide-react';
import { databases, storage, account, APPWRITE, DB_ID, BUCKET_ID } from '../../../appwrite-config';
import { Query, Permission, Role } from 'appwrite';

export default function AdminProjects() {
  const { state, dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    project_title: '',
    project_description: '',
    projectimg_url: '',
    technology_used: '',
    livedemo_url: '',
    githubrepo_url: '',
    onlineimage_url: ''
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/admin');
      return;
    }
    loadProjects();
  }, [state.isAuthenticated, navigate]);

  const loadProjects = async () => {
    try {
      // Check if session is valid before making database calls
      await account.get();
      const res = await databases.listDocuments(DB_ID, 'projects');
      console.log('Loaded projects from database:', res.documents);
      setProjects(res.documents);
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to load projects', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      project_title: '',
      project_description: '',
      projectimg_url: '',
      technology_used: '',
      livedemo_url: '',
      githubrepo_url: '',
      onlineimage_url: ''
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
        project_title: formData.project_title,
        project_description: formData.project_description,
        projectimg_url: formData.projectimg_url,
        technology_used: formData.technology_used,
        livedemo_url: formData.livedemo_url,
        githubrepo_url: formData.githubrepo_url,
        onlineimage_url: formData.onlineimage_url,
      };

      if (editingId) {
        // Update existing project
        await databases.updateDocument(
          DB_ID,
          'projects',
          editingId,
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
        toast({
          title: "Project Updated",
          description: "The project has been updated successfully.",
        });
      } else {
        // Add new project
        await databases.createDocument(
          DB_ID,
          'projects',
          'unique()',
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
        toast({
          title: "Project Added",
          description: "New project has been added successfully.",
        });
      }

      // Reload projects from database
      await loadProjects();
      resetForm();
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to save project', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: any) => {
    setFormData({
      project_title: project.project_title || '',
      project_description: project.project_description || '',
      projectimg_url: project.projectimg_url || '',
      technology_used: project.technology_used || '',
      livedemo_url: project.livedemo_url || '',
      githubrepo_url: project.githubrepo_url || '',
      onlineimage_url: project.onlineimage_url || ''
    });
    setEditingId(project.$id);
    setIsAdding(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      // Check session before database operations
      await account.get();
      await databases.deleteDocument(DB_ID, 'projects', projectId);
      toast({
        title: "Project Deleted",
        description: "The project has been removed successfully.",
      });
      // Reload projects from database
      await loadProjects();
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
      
      setFormData(prev => ({ ...prev, projectimg_url: cacheBusted }));
      
      toast({
        title: "Image Uploaded",
        description: "Project image has been uploaded successfully.",
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
              <h1 className="text-2xl font-bold text-gradient">Manage Projects</h1>
            </div>
            <Button onClick={() => setIsAdding(true)} className="hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
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
                <FolderOpen className="h-5 w-5 mr-2" />
                {editingId ? 'Edit Project' : 'Add New Project'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project_title">Project Title</Label>
                    <Input
                      id="project_title"
                      value={formData.project_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
                      placeholder="e.g., E-Commerce Platform"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="technology_used">Technologies (comma-separated)</Label>
                    <Input
                      id="technology_used"
                      value={formData.technology_used}
                      onChange={(e) => setFormData(prev => ({ ...prev, technology_used: e.target.value }))}
                      placeholder="React, Node.js, PostgreSQL"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="project_description">Description</Label>
                  <Textarea
                    id="project_description"
                    value={formData.project_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_description: e.target.value }))}
                    rows={4}
                    placeholder="Describe the project, its features, and your role..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="projectimg_url">Project Image</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    {formData.projectimg_url && (
                      <img src={formData.projectimg_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
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
                    value={formData.projectimg_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectimg_url: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="livedemo_url">Live Demo URL (optional)</Label>
                    <Input
                      id="livedemo_url"
                      value={formData.livedemo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, livedemo_url: e.target.value }))}
                      placeholder="https://your-project.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="githubrepo_url">GitHub URL (optional)</Label>
                    <Input
                      id="githubrepo_url"
                      value={formData.githubrepo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubrepo_url: e.target.value }))}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="onlineimage_url">Online Image URL (optional)</Label>
                  <Input
                    id="onlineimage_url"
                    value={formData.onlineimage_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, onlineimage_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>


                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" className="hover-lift" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : (editingId ? 'Update' : 'Add')} Project
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.$id} className="shadow-elegant hover-lift">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <img
                    src={project.projectimg_url || project.onlineimage_url || '/placeholder-project.jpg'}
                    alt={project.project_title}
                    className="w-full lg:w-48 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          {project.project_title}
                        </h3>
                        <p className="text-muted-foreground mt-1">{project.project_description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.$id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technology_used && project.technology_used.split(',').map((tech: string) => (
                        <span
                          key={tech.trim()}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4">
                      {project.livedemo_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.livedemo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                      {project.githubrepo_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={project.githubrepo_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <Card className="shadow-elegant">
            <CardContent className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Added Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your portfolio by adding your projects and work samples.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}