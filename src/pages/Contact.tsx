import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Send } from 'lucide-react';
import { databases, DB_ID } from '../../appwrite-config';
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID 
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY 
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID 

export default function Contact() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showCopyButton, setShowCopyButton] = useState(false);

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, 'profile', []);
      if (response.documents.length > 0) {
        setProfile(response.documents[0]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // EmailJS template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: profile?.email || 'your-email@example.com'
      };

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (result.status === 200) {
        toast({
          title: "Message Sent Successfully!",
          description: "Thank you for your message. I'll get back to you soon!",
        });
        
        // Clear form after successful submission
        setFormData({ name: '', email: '', subject: '', message: '' });
        setShowCopyButton(false);
      } else {
        throw new Error('Failed to send email');
      }
      
    } catch (error: any) {
      console.error('EmailJS error:', error);
      
      // Provide specific error messages based on the error type
      let errorMessage = "Failed to send email. Please try again.";
      
      if (error?.status === 400) {
        if (error?.text?.includes('service ID not found')) {
          errorMessage = "Email service not configured. Please contact me directly.";
        } else if (error?.text?.includes('template')) {
          errorMessage = "Email template not found. Please contact me directly.";
        }
      } else if (error?.status === 401) {
        errorMessage = "Email service authentication failed. Please contact me directly.";
      }
      
      toast({
        title: "Email Service Error",
        description: `${errorMessage} You can reach me at ${profile?.email || 'your-email@example.com'}`,
        variant: "destructive",
      });
      
      // Show copy button so user can copy their message
      setShowCopyButton(true);
      
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const copyMessageToClipboard = async () => {
    const messageText = `
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}
    `.trim();

    try {
      await navigator.clipboard.writeText(messageText);
      toast({
        title: "Message Copied!",
        description: "Your message has been copied to clipboard. You can paste it in your email client.",
      });
    } catch (error) {
      console.error('Failed to copy message:', error);
      toast({
        title: "Copy Failed",
        description: "Please manually copy your message from the form below.",
        variant: "destructive",
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: profile?.email || 'your-email@example.com',
      href: `mailto:${profile?.email || 'your-email@example.com'}`
    },
    {
      icon: Phone,
      label: 'Phone',
      value: profile?.phone || '+1 (555) 123-4567',
      href: `tel:${profile?.phone || '+15551234567'}`
    },
    {
      icon: MapPin,
      label: 'Location',
      value: profile?.location || 'Your City, Country',
      href: `https://maps.google.com/?q=${encodeURIComponent(profile?.location || 'Your City, Country')}`
    }
  ];

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: profile?.github,
      color: 'hover:text-gray-900'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: profile?.linkedin,
      color: 'hover:text-blue-600'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      href: profile?.twitter,
      color: 'hover:text-blue-400'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <section className="py-20 bg-gradient-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contact information...</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Get In <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have a project in mind or just want to chat about technology? 
            I'd love to hear from you. Let's build something amazing together.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-fade-in-up">
              <Card className="shadow-elegant">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Button type="submit" className="w-full hover-lift" disabled={submitting}>
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? 'Sending...' : 'Send Message'}
                      </Button>
                      
                      {showCopyButton && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full hover-lift" 
                          onClick={copyMessageToClipboard}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Copy Message to Clipboard
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="animate-slide-in-right">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    {contactInfo.map((info) => (
                      <Card key={info.label} className="hover-lift shadow-soft">
                        <CardContent className="p-6">
                          <a
                            href={info.href}
                            className="flex items-center space-x-4 text-foreground hover:text-primary transition-smooth"
                          >
                            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                              <info.icon className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{info.label}</p>
                              <p className="text-muted-foreground">{info.value}</p>
                            </div>
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Connect With Me</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => (
                      social.href && (
                        <Button
                          key={social.label}
                          variant="outline"
                          size="icon"
                          asChild
                          className="hover-scale hover:shadow-glow"
                        >
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                          >
                            <social.icon className="h-5 w-5" />
                          </a>
                        </Button>
                      )
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <Card className="bg-gradient-card">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Availability</h3>
                    <p className="text-muted-foreground mb-3">
                      I'm currently available for new projects and collaborations.
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Available for work</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}