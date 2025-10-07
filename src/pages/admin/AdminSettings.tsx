import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Settings, Upload, FileText, LogOut, Trash2 } from 'lucide-react';
import { databases, storage, account, APPWRITE, DB_ID, BUCKET_ID } from '../../../appwrite-config';
import { Query, Permission, Role } from 'appwrite';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AdminSettings() {
  const { state, dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    resume_url: '',
    onlineresume_url: ''
  });
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    certificates: 0,
    skills: 0
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/admin');
      return;
    }
    loadSettings();
    loadStats();
  }, [state.isAuthenticated, navigate]);

  const loadSettings = async () => {
    try {
      // Check if session is valid before making database calls
      await account.get();
      const res = await databases.listDocuments(DB_ID, 'settings');
      const settings = res.documents?.[0];
      
      if (settings) {
        setFormData({
          resume_url: settings.resume_url || '',
          onlineresume_url: settings.onlineresume_url || ''
        });
      }
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      // Don't show error toast for settings as it might not exist yet
    }
  };

  const loadStats = async () => {
    try {
      // Check if session is valid before making database calls
      await account.get();
      
      // Load counts from all collections
      const [projectsRes, blogsRes, certificatesRes, skillsRes] = await Promise.all([
        databases.listDocuments(DB_ID, 'projects'),
        databases.listDocuments(DB_ID, 'blogs'),
        databases.listDocuments(DB_ID, 'cerificates'), // Note: using the typo from your database
        databases.listDocuments(DB_ID, 'skill')
      ]);

      setStats({
        projects: projectsRes.total,
        blogs: blogsRes.total,
        certificates: certificatesRes.total,
        skills: skillsRes.total
      });
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      // Don't show error toast for stats as collections might not exist yet
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const resumeUrl = `https://syd.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=68d60226000a9faf9d65&mode=admin`;
      const cacheBusted = `${resumeUrl}&t=${Date.now()}`;
      
      setFormData(prev => ({ ...prev, resume_url: cacheBusted }));
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully.",
      });
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to upload resume', variant: 'destructive' });
    }
  };

  const handleSaveResume = async () => {
    setLoading(true);
    
    try {
      // Check session before database operations
      await account.get();
      
      // Check if settings document exists
      const existing = await databases.listDocuments(DB_ID, 'settings', [Query.limit(1)]);
      
      const payload = {
        resume_url: formData.resume_url,
        onlineresume_url: formData.onlineresume_url,
      };

      if (existing.documents.length > 0) {
        // Update existing settings
        await databases.updateDocument(
          DB_ID,
          'settings',
          existing.documents[0].$id,
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      } else {
        // Create new settings document
        await databases.createDocument(
          DB_ID,
          'settings',
          'unique()',
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      }

      toast({
        title: "Settings Updated",
        description: "Your resume settings have been saved successfully.",
      });
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (e) {
      // ignore if already invalid/expired
    } finally {
      dispatch({ type: 'SET_AUTH', payload: false });
      navigate('/admin');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your portfolio data has been downloaded.",
    });
  };

  const handleClearData = () => {
    // Reset to initial state (keeping authentication)
    window.location.reload();
    toast({
      title: "Data Cleared",
      description: "All portfolio data has been reset to defaults.",
    });
  };

  const statsData = [
    { label: 'Total Projects', value: stats.projects },
    { label: 'Blog Posts', value: stats.blogs },
    { label: 'Certificates', value: stats.certificates },
    { label: 'Skills', value: stats.skills },
  ];

  if (!state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-white border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" asChild className="mr-4">
              <Link to="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gradient">Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Portfolio Stats */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statsData.map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resume Management */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Resume Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload and manage your resume file for download links
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resumeFile">Upload Resume</Label>
              <div className="mt-2 flex items-center space-x-4">
                <Label htmlFor="resumeFile" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </Label>
                <Input
                  id="resumeFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  PDF, DOC, or DOCX files only
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="resume_url">Uploaded Resume URL</Label>
              <Input
                id="resume_url"
                value={formData.resume_url}
                onChange={(e) => setFormData(prev => ({ ...prev, resume_url: e.target.value }))}
                placeholder="Direct link to your uploaded resume file"
                className="mb-2"
              />
            </div>

            <div>
              <Label htmlFor="onlineresume_url">Online Resume URL (optional)</Label>
              <Input
                id="onlineresume_url"
                value={formData.onlineresume_url}
                onChange={(e) => setFormData(prev => ({ ...prev, onlineresume_url: e.target.value }))}
                placeholder="External link to your resume (e.g., LinkedIn, personal website)"
                className="mb-2"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveResume} className="hover-lift" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>

            {(formData.resume_url || formData.onlineresume_url) && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                {formData.resume_url && (
                  <p className="text-sm">
                    <strong>Uploaded Resume:</strong>{' '}
                    <a
                      href={formData.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {formData.resume_url}
                    </a>
                  </p>
                )}
                {formData.onlineresume_url && (
                  <p className="text-sm">
                    <strong>Online Resume:</strong>{' '}
                    <a
                      href={formData.onlineresume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {formData.onlineresume_url}
                    </a>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Export your data or reset the portfolio to default state
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleExportData} variant="outline" className="hover-lift">
                <FileText className="h-4 w-4 mr-2" />
                Export Portfolio Data
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="hover-lift">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Portfolio Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will reset your portfolio to the default state. All your projects, 
                      blog posts, certificates, and custom content will be lost. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-destructive hover:bg-destructive/90">
                      Yes, Clear All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> In a production environment, you would have options to 
                backup data to cloud storage, import data from files, and manage user authentication.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Session Management</h3>
                <p className="text-sm text-muted-foreground">
                  Log out of the admin dashboard
                </p>
              </div>
              <Button onClick={handleLogout} variant="outline" className="hover-lift">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
