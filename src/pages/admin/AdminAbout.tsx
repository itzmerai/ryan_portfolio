import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { databases, account, DB_ID, PROFILE_COLLECTION_ID } from '../../../appwrite-config';
import { Query, Permission, Role } from 'appwrite';

export default function AdminAbout() {
  const { state, dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bio, setBio] = useState(state.profile.bio);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/admin');
      return;
    }
    // Load bio from database
    (async () => {
      try {
        const me = await account.get();
        const res = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal('email', [me.email]), Query.limit(1)]
        );
        const doc = res.documents?.[0];
        if (doc?.bio) {
          setBio(doc.bio);
        }
      } catch (error: any) {
        if (error?.code === 401) {
          toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
          navigate('/admin');
          return;
        }
        console.error(error);
        toast({ title: 'Failed to load bio', variant: 'destructive' });
      }
    })();
  }, [state.isAuthenticated, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const me = await account.get();
      const existing = await databases.listDocuments(
        DB_ID,
        PROFILE_COLLECTION_ID,
        [Query.equal('email', [me.email]), Query.limit(1)]
      );
      
      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DB_ID,
          PROFILE_COLLECTION_ID,
          existing.documents[0].$id,
          { bio },
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
          'unique()',
          { email: me.email, bio },
          [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      }

      dispatch({ type: 'UPDATE_PROFILE', payload: { bio } });
      toast({
        title: "About Section Updated",
        description: "Your biography has been saved successfully.",
      });
    } catch (error: any) {
      if (error?.code === 401) {
        toast({ title: 'Session expired. Please sign in.', variant: 'destructive' });
        navigate('/admin');
        return;
      }
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
            <h1 className="text-2xl font-bold text-gradient">Edit About Section</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Form */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Biography Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={12}
                    placeholder="Write about yourself, your experience, passion, and what drives you as a professional..."
                    className="mt-2"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tell your story. This will appear on your About page and home page.
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link to="/admin/dashboard">Cancel</Link>
                  </Button>
                  <Button type="submit" className="hover-lift" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                How your bio will appear on the website
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="mb-4">
                  <img
                    src={state.profile.image}
                    alt={state.profile.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{state.profile.name}</h3>
                <p className="text-primary font-medium mb-4">{state.profile.title}</p>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {bio || 'Your biography will appear here...'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Writing Tips */}
        <Card className="mt-8 shadow-elegant">
          <CardHeader>
            <CardTitle>Writing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">What to Include:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your professional background and experience</li>
                  <li>• What drives and motivates you</li>
                  <li>• Your key skills and expertise</li>
                  <li>• Personal interests or hobbies</li>
                  <li>• Your career goals or mission</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Writing Style:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep it conversational and authentic</li>
                  <li>• Use first person ("I am" not "John is")</li>
                  <li>• Be specific with examples</li>
                  <li>• Show personality alongside professionalism</li>
                  <li>• Keep paragraphs concise and readable</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}