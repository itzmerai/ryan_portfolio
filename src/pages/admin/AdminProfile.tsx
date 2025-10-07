import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Upload, User } from 'lucide-react';
import { databases, storage, APPWRITE, DB_ID, PROFILE_COLLECTION_ID, BUCKET_ID } from '../../../appwrite-config';
import { account } from '../../../appwrite-config';
import { Query, Permission, Role } from 'appwrite';

export default function AdminProfile() {
  const { state, dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(state.profile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/admin');
      return;
    }
    // Fetch profile from DB
    (async () => {
      try {
        const me = await account.get();
        const res = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal('email', [me.email]), Query.limit(1)]
        );
        const doc = res.documents?.[0];
        if (doc) {
          // Turn stored fileId or URL into a display URL
          let displayImage = doc.profileimage_url ?? '';
          if (displayImage && !/^https?:\/\//.test(displayImage)) {
            displayImage = `https://syd.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${displayImage}/view?project=68d60226000a9faf9d65&mode=admin`;
          }
          setFormData((prev: any) => ({
            ...prev,
            name: doc.fullname ?? prev.name,
            title: doc.professional_title ?? prev.title,
            bio: doc.bio ?? prev.bio,
            email: doc.email ?? prev.email,
            phone: doc.phone ?? prev.phone,
            location: doc.location ?? prev.location,
            image: displayImage || prev.image,
            socialLinks: {
              github: doc.github ?? prev.socialLinks.github,
              linkedin: doc.linkedin ?? prev.socialLinks.linkedin,
              twitter: doc.twitter ?? prev.socialLinks.twitter,
              website: doc.website ?? prev.socialLinks.website,
            },
            _docId: doc.$id,
          }));
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
    })();
  }, [state.isAuthenticated, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Ensure session is valid before attempting upload
      try { await account.get(); } catch { toast({ title: 'Session expired. Please sign in.', variant: 'destructive' }); navigate('/admin'); return; }
      const uploaded = await storage.createFile(
        BUCKET_ID,
        APPWRITE.ID.unique(),
        file,
        [
          Permission.read(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ]
      );
      const fileId = uploaded.$id;
      const previewUrl = `https://syd.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=68d60226000a9faf9d65&mode=admin`;
      const cacheBusted = `${previewUrl}&t=${Date.now()}`;
      setFormData(prev => ({ ...prev, image: cacheBusted, profileFileId: fileId }));

      // Upsert to database: update existing profile doc by _docId or email, else create one
      let docId: string | undefined = (formData as any)._docId;
      try {
        const me = await account.get();
        if (!docId) {
          const found = await databases.listDocuments(
            DB_ID,
            PROFILE_COLLECTION_ID,
            [Query.equal('email', [me.email]), Query.limit(1)]
          );
          docId = found.documents?.[0]?.$id;
        }

        if (docId) {
          const updated = await databases.updateDocument(
            DB_ID,
            PROFILE_COLLECTION_ID,
            docId,
            { profileimage_url: fileId },
            [
              Permission.read(Role.users()),
              Permission.update(Role.users()),
              Permission.delete(Role.users()),
            ]
          );
          // ensure local state tracks doc id
          setFormData(prev => ({ ...(prev as any), _docId: updated.$id } as any));
        } else {
          const created = await databases.createDocument(
            DB_ID,
            PROFILE_COLLECTION_ID,
            APPWRITE.ID.unique(),
            { email: me.email, profileimage_url: fileId },
            [
              Permission.read(Role.users()),
              Permission.update(Role.users()),
              Permission.delete(Role.users()),
            ]
          );
          setFormData(prev => ({ ...(prev as any), _docId: created.$id } as any));
        }
      } catch (err) {
        console.error(err);
        toast({ title: 'Failed to save photo', variant: 'destructive' });
      }

      // Update context profile immediately so UI reflects change across app
      dispatch({ type: 'UPDATE_PROFILE', payload: { image: cacheBusted } });
      toast({ title: 'Photo uploaded' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        fullname: formData.name,
        bio: formData.bio,
        professional_title: formData.title,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        github: formData.socialLinks.github,
        linkedin: formData.socialLinks.linkedin,
        twitter: formData.socialLinks.twitter,
        website: formData.socialLinks.website,
      };
      if ((formData as any).profileFileId) {
        payload.profileimage_url = (formData as any).profileFileId;
      }

      if ((formData as any)._docId) {
        await databases.updateDocument(
          DB_ID,
          PROFILE_COLLECTION_ID,
          (formData as any)._docId,
          payload,
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      } else {
        await databases.createDocument(
          DB_ID,
          PROFILE_COLLECTION_ID,
          APPWRITE.ID.unique(),
          { ...payload },
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      }

      dispatch({ type: 'UPDATE_PROFILE', payload: formData });
      toast({ title: 'Profile Updated', description: 'Saved successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gradient">Edit Profile</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
                <div>
                  <Label htmlFor="image" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Change Photo
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      name="socialLinks.github"
                      value={formData.socialLinks.github || ''}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks.linkedin || ''}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      name="socialLinks.twitter"
                      value={formData.socialLinks.twitter || ''}
                      onChange={handleChange}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="socialLinks.website"
                      value={formData.socialLinks.website || ''}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" asChild>
                  <Link to="/admin/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" className="hover-lift">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}