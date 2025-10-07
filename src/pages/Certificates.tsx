import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { ExternalLink, Calendar, Award } from 'lucide-react';
import { databases, DB_ID } from '../../appwrite-config';

export default function Certificates() {
  const { state } = usePortfolio();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, 'cerificates'); // Note: using the typo from your database
      console.log('Loaded certificates from database:', res.documents);
      setCertificates(res.documents);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-gradient">Certificates</span> & Achievements
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional certifications and achievements that demonstrate my commitment to continuous 
            learning and staying current with industry standards and best practices.
          </p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-lg text-muted-foreground">Loading certificates...</div>
          </div>
        </section>
      )}

      {/* Certificates Grid */}
      {!loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((certificate, index) => (
                  <Card 
                    key={certificate.$id} 
                    className={`hover-lift shadow-elegant animate-fade-in-up animate-delay-${(index + 1) * 100}`}
                  >
                    <CardContent className="p-0">
                      <div className="relative group">
                        <img
                          src={certificate.certificateimage_url || certificate.onlinecertificate_url || '/placeholder-certificate.jpg'}
                          alt={certificate.certificate_title}
                          className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-smooth"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-smooth rounded-t-lg"></div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Award className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                          <div className="ml-3 flex-1">
                            <h3 className="font-semibold text-lg leading-tight">{certificate.certificate_title}</h3>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground font-medium mb-3">{certificate.issuing_organization}</p>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(certificate.issue_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>

                        {certificate.credential_url && (
                          <Button variant="outline" size="sm" asChild className="w-full hover-lift">
                            <a href={certificate.credential_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Credential
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground">
                  Certificates and achievements will be displayed here once added.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Achievement Stats */}
      {!loading && (
        <section className="py-20 bg-gradient-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="animate-fade-in-up">
                <div className="text-4xl font-bold mb-2">{certificates.length}</div>
                <div className="text-lg opacity-90">Certificates Earned</div>
              </div>
              <div className="animate-fade-in-up animate-delay-100">
                <div className="text-4xl font-bold mb-2">
                  {certificates.length > 0 ? new Set(certificates.map(c => c.issuing_organization)).size : 0}
                </div>
                <div className="text-lg opacity-90">Certifying Organizations</div>
              </div>
              <div className="animate-fade-in-up animate-delay-200">
                <div className="text-4xl font-bold mb-2">
                  {certificates.length > 0 ? 
                    (new Date().getFullYear() - Math.min(...certificates.map(c => new Date(c.issue_date).getFullYear()))) + '+'
                    : '0+'
                  }
                </div>
                <div className="text-lg opacity-90">Years of Learning</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}