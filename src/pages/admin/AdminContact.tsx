import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Mail, Phone, MapPin, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import { databases, account, APPWRITE, DB_ID, PROFILE_COLLECTION_ID } from '../../../appwrite-config';
import { Query, Permission, Role } from 'appwrite';

export default function AdminContact() {
  const { state, dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    location: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: ''
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/admin');
      return;
    }
    loadProfile();
  }, [state.isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      // Check if session is valid before making database calls
      await account.get();
      const me = await account.get();
      const res = await databases.listDocuments(DB_ID, PROFILE_COLLECTION_ID, [Query.equal('email', [me.email]), Query.limit(1)]);
      const doc = res.documents?.[0];
      
      if (doc) {
        setFormData({
          email: doc.email || '',
          phone: doc.phone || '',
          location: doc.location || '',
          github: doc.github || '',
          linkedin: doc.linkedin || '',
          twitter: doc.twitter || '',
          website: doc.website || ''
        });
      }
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to load profile', variant: 'destructive' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check session before database operations
      await account.get();
      const me = await account.get();
      
      // Check if profile exists
      const existing = await databases.listDocuments(DB_ID, PROFILE_COLLECTION_ID, [Query.equal('email', [me.email]), Query.limit(1)]);
      
      const payload = {
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        website: formData.website,
      };

      if (existing.documents.length > 0) {
        // Update existing profile
        await databases.updateDocument(
          DB_ID,
          PROFILE_COLLECTION_ID,
          existing.documents[0].$id,
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      } else {
        // Create new profile
        await databases.createDocument(
          DB_ID,
          PROFILE_COLLECTION_ID,
          APPWRITE.ID.unique(),
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      }

      toast({
        title: "Contact Information Updated",
        description: "Your contact details have been saved successfully.",
      });
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
      console.error(error);
      toast({ title: 'Failed to save contact information', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const contactFields = [
    {
      icon: Mail,
      label: 'Email Address',
      name: 'email',
      type: 'email',
      placeholder: 'your.email@example.com',
      value: formData.email,
      required: true
    },
    {
      icon: Phone,
      label: 'Phone Number',
      name: 'phone',
      type: 'tel',
      placeholder: '+1 (555) 123-4567',
      value: formData.phone,
      required: false
    },
    {
      icon: MapPin,
      label: 'Location',
      name: 'location',
      type: 'text',
      placeholder: 'City, State/Province, Country',
      value: formData.location,
      required: false
    }
  ];

  const socialFields = [
    {
      icon: Github,
      label: 'GitHub',
      name: 'github',
      placeholder: 'https://github.com/username',
      value: formData.github || ''
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      name: 'linkedin',
      placeholder: 'https://linkedin.com/in/username',
      value: formData.linkedin || ''
    },
    {
      icon: Twitter,
      label: 'Twitter',
      name: 'twitter',
      placeholder: 'https://twitter.com/username',
      value: formData.twitter || ''
    },
    {
      icon: Globe,
      label: 'Website',
      name: 'website',
      placeholder: 'https://yourwebsite.com',
      value: formData.website || ''
    }
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
            <h1 className="text-2xl font-bold text-gradient">Contact Information</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Details */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Details
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Primary contact information that visitors can use to reach you
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactFields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name} className="flex items-center mb-2">
                    <field.icon className="h-4 w-4 mr-2" />
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Social Media & Links</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add your social media profiles and personal website
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {socialFields.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name} className="flex items-center mb-2">
                      <field.icon className="h-4 w-4 mr-2" />
                      {field.label}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="url"
                      value={field.value}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                How your contact information will appear to visitors
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>{formData.phone}</span>
                  </div>
                )}
                {formData.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{formData.location}</span>
                  </div>
                )}
                
                {/* Social Links Preview */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Social Links:</p>
                  <div className="flex flex-wrap gap-2">
                    {socialFields.map((field) => {
                      if (!field.value) return null;
                      return (
                        <a
                          key={field.name}
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-sm bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-md transition-smooth"
                        >
                          <field.icon className="h-4 w-4" />
                          <span className="capitalize">{field.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" className="hover-lift" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Contact Information'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}