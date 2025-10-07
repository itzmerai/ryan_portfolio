import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/contexts/PortfolioContext';

export function Footer() {
  const { state } = usePortfolio();
  const { profile } = state;

  const socialLinks = [
    { 
      name: 'GitHub', 
      url: profile.socialLinks.github, 
      icon: Github 
    },
    { 
      name: 'LinkedIn', 
      url: profile.socialLinks.linkedin, 
      icon: Linkedin 
    },
    { 
      name: 'Twitter', 
      url: profile.socialLinks.twitter, 
      icon: Twitter 
    },
    { 
      name: 'Email', 
      url: `mailto:${profile.email}`, 
      icon: Mail 
    },
  ];

  const quickLinks = [
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Blog', href: '/blogs' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-gradient-card border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 font-bold text-xl text-gradient"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-md"></div>
              <span>{profile.name}</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {profile.bio.slice(0, 120)}...
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary transition-smooth text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                social.url && (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="hover-scale hover:shadow-glow"
                  >
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  </Button>
                )
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile.location}
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {profile.name}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground flex items-center">
              Made with <Heart className="h-3 w-3 mx-1 text-destructive" /> using React & Vite
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}