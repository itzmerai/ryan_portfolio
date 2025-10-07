import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, LogIn } from 'lucide-react';
import { account, databases, APPWRITE, DB_ID, PROFILE_COLLECTION_ID, ADMIN_USER_ID } from '../../../appwrite-config';
import { Query, Permission, Role } from 'appwrite';
export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
  
      try {
        // Preemptively close any active session, then login once
        try {
          await account.get();
          await account.deleteSession('current');
        } catch {}
        await account.createEmailPasswordSession(
          credentials.email,
          credentials.password
        );

      // Get current user info
      const user = await account.get();
      // Enforce only the configured admin user id
      if (user.$id !== ADMIN_USER_ID) {
        await account.deleteSession('current');
        throw new Error('Unauthorized user.');
      }

      // Compute SHA-256 hash of password for storage (never store plaintext)
      const pwBytes = new TextEncoder().encode(credentials.password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', pwBytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Derive a username (before '@') as a default
      const username = credentials.email.split('@')[0];

      // Upsert profile by userId
      const existing = await databases.listDocuments(
        DB_ID,
        PROFILE_COLLECTION_ID,
        [Query.equal('email', [user.email]), Query.limit(1)]
      );
      const payload: any = {
        username,
        passwordHash,
        email: user.email,
      };
      if (existing.documents.length > 0) {
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
  
      dispatch({ type: 'SET_AUTH', payload: true });
      toast({ title: 'Login Successful', description: `Welcome!` });
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: 'Login Failed',
        description: err instanceof Error ? err.message : 'Invalid email or password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <p className="text-muted-foreground">Access the portfolio dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full hover-lift"
              disabled={loading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
