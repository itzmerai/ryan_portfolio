import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Award, Save, X, Upload, ExternalLink, Calendar } from 'lucide-react';
import { databases, storage, account, APPWRITE, DB_ID, BUCKET_ID } from '../../../appwrite-config';
import { Query, Permission, Role } from 'appwrite';

export default function AdminCertificates() {
  const { state, dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    certificate_title: '',
    issuing_organization: '',
    issue_date: '',
    certificateimage_url: '',
    credential_url: '',
    onlinecertificate_url: ''
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/admin');
      return;
    }
    loadCertificates();
  }, [state.isAuthenticated, navigate]);

  const loadCertificates = async () => {
    try {
      // Check if session is valid before making database calls
      await account.get();
      const res = await databases.listDocuments(DB_ID, 'cerificates');
      console.log('Loaded certificates from database:', res.documents);
      setCertificates(res.documents);
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to load certificates', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      certificate_title: '',
      issuing_organization: '',
      issue_date: '',
      certificateimage_url: '',
      credential_url: '',
      onlinecertificate_url: ''
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
        certificate_title: formData.certificate_title,
        issuing_organization: formData.issuing_organization,
        issue_date: formData.issue_date,
        certificateimage_url: formData.certificateimage_url,
        credential_url: formData.credential_url,
        onlinecertificate_url: formData.onlinecertificate_url,
      };

      if (editingId) {
        // Update existing certificate
        await databases.updateDocument(
          DB_ID,
          'cerificates',
          editingId,
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
        toast({
          title: "Certificate Updated",
          description: "The certificate has been updated successfully.",
        });
      } else {
        // Add new certificate
        await databases.createDocument(
          DB_ID,
          'cerificates',
          'unique()',
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
        toast({
          title: "Certificate Added",
          description: "New certificate has been added successfully.",
        });
      }

      // Reload certificates from database
      await loadCertificates();
      resetForm();
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to save certificate', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (certificate: any) => {
    setFormData({
      certificate_title: certificate.certificate_title || '',
      issuing_organization: certificate.issuing_organization || '',
      issue_date: certificate.issue_date || '',
      certificateimage_url: certificate.certificateimage_url || '',
      credential_url: certificate.credential_url || '',
      onlinecertificate_url: certificate.onlinecertificate_url || ''
    });
    setEditingId(certificate.$id);
    setIsAdding(true);
  };

  const handleDelete = async (certificateId: string) => {
    try {
      // Check session before database operations
      await account.get();
      await databases.deleteDocument(DB_ID, 'cerificates', certificateId);
      toast({
        title: "Certificate Deleted",
        description: "The certificate has been removed successfully.",
      });
      // Reload certificates from database
      await loadCertificates();
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
      
      setFormData(prev => ({ ...prev, certificateimage_url: cacheBusted }));
      
      toast({
        title: "Image Uploaded",
        description: "Certificate image has been uploaded successfully.",
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
              <h1 className="text-2xl font-bold text-gradient">Manage Certificates</h1>
            </div>
            <Button onClick={() => setIsAdding(true)} className="hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
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
                <Award className="h-5 w-5 mr-2" />
                {editingId ? 'Edit Certificate' : 'Add New Certificate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certificate_title">Certificate Title</Label>
                    <Input
                      id="certificate_title"
                      value={formData.certificate_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, certificate_title: e.target.value }))}
                      placeholder="e.g., AWS Certified Solutions Architect"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuing_organization">Issuing Organization</Label>
                    <Input
                      id="issuing_organization"
                      value={formData.issuing_organization}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))}
                      placeholder="e.g., Amazon Web Services"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issue_date">Issue Date</Label>
                    <Input
                      id="issue_date"
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="credential_url">Credential URL (optional)</Label>
                    <Input
                      id="credential_url"
                      value={formData.credential_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, credential_url: e.target.value }))}
                      placeholder="https://verify-certificate.com/..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="certificateimage_url">Certificate Image</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    {formData.certificateimage_url && (
                      <img src={formData.certificateimage_url} alt="Preview" className="w-24 h-16 object-cover rounded-lg" />
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
                    value={formData.certificateimage_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificateimage_url: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="onlinecertificate_url">Online Certificate URL (optional)</Label>
                  <Input
                    id="onlinecertificate_url"
                    value={formData.onlinecertificate_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, onlinecertificate_url: e.target.value }))}
                    placeholder="https://example.com/certificate.pdf"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" className="hover-lift" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : (editingId ? 'Update' : 'Add')} Certificate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <Card key={certificate.$id} className="shadow-elegant hover-lift">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={certificate.certificateimage_url || certificate.onlinecertificate_url || '/placeholder-certificate.jpg'}
                    alt={certificate.certificate_title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(certificate)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(certificate.$id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 leading-tight">{certificate.certificate_title}</h3>
                  <p className="text-muted-foreground font-medium mb-2">{certificate.issuing_organization}</p>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(certificate.issue_date).toLocaleDateString()}</span>
                  </div>
                  {certificate.credential_url && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={certificate.credential_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View Credential
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {certificates.length === 0 && (
          <Card className="shadow-elegant">
            <CardContent className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Added Yet</h3>
              <p className="text-muted-foreground mb-4">
                Showcase your professional achievements and certifications to build credibility.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Certificate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}