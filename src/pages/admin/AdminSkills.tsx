import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Code, Save, X, Upload } from 'lucide-react';
import { databases, storage, account, DB_ID, BUCKET_ID } from '../../../appwrite-config';
import { Permission, Role, Query } from 'appwrite';

const categoryList = [
  'Front_End',
  'Back_end',
  'Database',
  'Tools',
  'Crm',
  'Automation',
  'language'
];

const categoryTitles: Record<string, string> = {
  'Front_End': 'Frontend Development',
  'Back_end': 'Backend Development',
  'Tools': 'Tools & Technologies',
  'Database': 'Database Technologies',
  'Crm': 'CRM Systems',
  'Automation': 'Automation',
  'language': 'Language',
};

export default function AdminSkills() {
  const { state } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<any[]>([]);
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, any[]>>({});
  const [categoryOptions] = useState(categoryList.map(c => ({ value: c, label: categoryTitles[c] })));

  const [formData, setFormData] = useState({
    skill_name: '',
    icon_url: '',
    skill_category: 'Front_End'
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/admin');
      return;
    }
    loadSkills();
  }, [state.isAuthenticated, navigate]);

  const loadSkills = async () => {
    try {
      await account.get();
      const res = await databases.listDocuments(DB_ID, 'skill', [Query.limit(100)]);
      const allSkills = res.documents;

      // Map skills by category
      const byCategory: Record<string, any[]> = {};
      categoryList.forEach(cat => byCategory[cat] = []);
      allSkills.forEach(skill => {
        if (!byCategory[skill.skill_category]) byCategory[skill.skill_category] = [];
        byCategory[skill.skill_category].push(skill);
      });

      setSkills(allSkills);
      setSkillsByCategory(byCategory);
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to load skills', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      skill_name: '',
      icon_url: '',
      skill_category: 'Front_End'
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await account.get();
      const uploaded = await storage.createFile(BUCKET_ID, 'unique()', file, [
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      const fileId = uploaded.$id;
      const iconUrl = `https://syd.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=68d60226000a9faf9d65&mode=admin`;
      setFormData(prev => ({ ...prev, icon_url: iconUrl }));
      toast({ title: 'Icon uploaded successfully' });
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Icon upload failed', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.get();
      const payload = {
        skill_name: formData.skill_name,
        icon_url: formData.icon_url,
        skill_category: formData.skill_category,
      };

      if (editingId) {
        await databases.updateDocument(DB_ID, 'skill', editingId, payload);
        toast({ title: 'Skill Updated', description: 'The skill has been updated successfully.' });
      } else {
        await databases.createDocument(DB_ID, 'skill', 'unique()', payload, [
          Permission.read(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ]);
        toast({ title: 'Skill Added', description: 'New skill has been added successfully.' });
      }

      resetForm();
      await loadSkills(); // Refresh all skills from server to ensure new ones appear
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (skill: any) => {
    setFormData({
      skill_name: skill.skill_name,
      icon_url: skill.icon_url,
      skill_category: skill.skill_category
    });
    setEditingId(skill.$id);
    setIsAdding(true);
  };

  const handleDelete = async (skillId: string) => {
    try {
      await account.get();
      await databases.deleteDocument(DB_ID, 'skill', skillId);
      toast({ title: 'Skill Deleted', description: 'The skill has been removed successfully.' });
      await loadSkills();
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

  if (!state.isAuthenticated) return null;

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
              <h1 className="text-2xl font-bold text-gradient">Manage Skills</h1>
            </div>
            <Button onClick={() => setIsAdding(true)} className="hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdding && (
          <Card className="mb-8 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                {editingId ? 'Edit Skill' : 'Add New Skill'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="skill_name">Skill Name</Label>
                    <Input
                      id="skill_name"
                      value={formData.skill_name}
                      onChange={e => setFormData(prev => ({ ...prev, skill_name: e.target.value }))}
                      placeholder="e.g., React, Node.js"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill_category">Category</Label>
                    <Select
                      value={formData.skill_category}
                      onValueChange={value => setFormData(prev => ({ ...prev, skill_category: value }))}
                    >
                      <SelectTrigger id="skill_category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(category => (
                          <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="icon">Icon Upload</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <Button type="button" variant="outline" asChild>
                      <Label htmlFor="icon" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Icon
                      </Label>
                    </Button>
                    <Input id="icon" type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
                    {formData.icon_url && (
                      <div className="flex items-center space-x-2">
                        <img src={formData.icon_url} alt="Icon preview" className="w-8 h-8 object-cover rounded" />
                        <span className="text-sm text-muted-foreground">Icon uploaded</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                </div>
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" className="hover-lift" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : (editingId ? 'Update' : 'Add')} Skill
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          {categoryList.map(category => {
            const categorySkills = skillsByCategory[category] || [];
            // Only render category if it has skills
            if (categorySkills.length === 0) return null;
            
            return (
              <Card key={category} className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{categoryTitles[category]}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorySkills.map(skill => (
                      <div key={skill.$id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-soft transition-smooth">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                            {skill.icon_url ? <img src={skill.icon_url} alt={skill.skill_name} className="w-6 h-6 object-cover rounded" /> : <Code className="h-4 w-4 text-primary" />}
                          </div>
                          <span className="font-medium">{skill.skill_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(skill)}><Edit className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(skill.$id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {skills.length === 0 && (
          <Card className="shadow-elegant">
            <CardContent className="text-center py-12">
              <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Skills Added Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your skills showcase by adding your technical expertise.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
