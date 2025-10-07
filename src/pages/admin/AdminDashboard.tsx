import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { 
  User, 
  FileText, 
  Code, 
  FolderOpen, 
  Award, 
  BookOpen, 
  Mail, 
  Settings,
  BarChart3,
  Eye,
  LogOut
} from 'lucide-react';
import { databases, account, DB_ID } from '../../../appwrite-config';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { state, dispatch } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    loadStats();
  }, [state.isAuthenticated, navigate]);

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

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (e) {
      // ignore if already invalid/expired
    } finally {
      dispatch({ type: 'SET_AUTH', payload: false });
      navigate('/admin');
    }
  };

  const dashboardCards = [
    {
      title: 'Profile',
      description: 'Edit personal information and profile image',
      icon: User,
      href: '/admin/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'About',
      description: 'Update biography and personal details',
      icon: FileText,
      href: '/admin/about',
      color: 'bg-green-500'
    },
    {
      title: 'Skills',
      description: 'Manage technical skills and tools',
      icon: Code,
      href: '/admin/skills',
      color: 'bg-purple-500'
    },
    {
      title: 'Projects',
      description: 'Add and edit portfolio projects',
      icon: FolderOpen,
      href: '/admin/projects',
      color: 'bg-orange-500'
    },
    {
      title: 'Certificates',
      description: 'Upload and manage certificates',
      icon: Award,
      href: '/admin/certificates',
      color: 'bg-yellow-500'
    },
    {
      title: 'Blog Posts',
      description: 'Create and edit blog articles',
      icon: BookOpen,
      href: '/admin/blogs',
      color: 'bg-red-500'
    },
    {
      title: 'Contact',
      description: 'Update contact information',
      icon: Mail,
      href: '/admin/contact',
      color: 'bg-teal-500'
    },
    {
      title: 'Settings',
      description: 'General portfolio settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  const statsData = [
    {
      title: 'Total Projects',
      value: stats.projects,
      icon: FolderOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Blog Posts',
      value: stats.blogs,
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      title: 'Certificates',
      value: stats.certificates,
      icon: Award,
      color: 'text-purple-600'
    },
    {
      title: 'Skills',
      value: stats.skills,
      icon: Code,
      color: 'text-orange-600'
    }
  ];

  if (!state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/">
                  <Eye className="h-4 w-4 mr-2" />
                  View Site
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, Ryan!</h2>
          <p className="text-muted-foreground">
            Manage your portfolio content and settings from this dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => (
            <Card key={stat.title} className="hover-lift shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => (
            <Card key={card.title} className="hover-lift shadow-elegant">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4 text-sm">
                  {card.description}
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={card.href}>
                    Manage {card.title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="hover-lift">
                <Link to="/admin/projects">Add New Project</Link>
              </Button>
              <Button asChild variant="outline" className="hover-lift">
                <Link to="/admin/blogs">Write Blog Post</Link>
              </Button>
              <Button asChild variant="outline" className="hover-lift">
                <Link to="/admin/certificates">Upload Certificate</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}