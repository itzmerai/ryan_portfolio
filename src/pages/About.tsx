import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Download, MapPin, Mail, Phone } from 'lucide-react';
import { databases, account, DB_ID, PROFILE_COLLECTION_ID } from '../../appwrite-config';

export default function About() {
  const { state } = usePortfolio();
  const [profile, setProfile] = useState<any>(null);
  const [carousels, setCarousels] = useState<any[]>([]);
  const [coreValues, setCoreValues] = useState<any[]>([]);
  const [journey, setJourney] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadAllData();
  }, []);

  // Auto-rotate carousel images every 2 seconds
  useEffect(() => {
    if (carousels.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % carousels.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [carousels.length]);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadProfile(),
        loadCarousels(),
        loadCoreValues(),
        loadJourney()
      ]);
    } catch (error) {
      console.error('Failed to load about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, PROFILE_COLLECTION_ID);
      if (res.documents.length > 0) {
        setProfile(res.documents[0]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadCarousels = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, 'carousels');
      setCarousels(res.documents);
    } catch (error) {
      console.error('Failed to load carousels:', error);
    }
  };

  const loadCoreValues = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, 'core');
      setCoreValues(res.documents);
    } catch (error) {
      console.error('Failed to load core values:', error);
    }
  };

  const loadJourney = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, 'journey');
      setJourney(res.documents);
    } catch (error) {
      console.error('Failed to load journey:', error);
    }
  };


  return (
    <Layout>
      {/* Loading State */}
      {loading && (
        <section className="py-20 bg-gradient-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-lg text-muted-foreground">Loading about information...</div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      {!loading && (
        <section className="py-20 bg-gradient-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in-up">
                <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                  About <span className="text-gradient">Me</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {profile?.bio || 'Loading bio...'}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="hover-lift">
                    <Download className="mr-2 h-4 w-4" />
                    Download Resume
                  </Button>
                  <Button variant="outline" asChild className="hover-lift">
                    <a href={`mailto:${profile?.email || ''}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Get In Touch
                    </a>
                  </Button>
                </div>
              </div>

              <div className="animate-slide-in-right">
                <Card className="shadow-elegant hover-lift">
                  <CardContent className="p-8">
                    {carousels.length > 0 ? (
                      <div className="relative">
                        <img
                          src={carousels[currentImageIndex]?.image_url}
                          alt="About me"
                          className="w-full max-w-sm mx-auto rounded-lg shadow-soft hover-glow transition-smooth"
                        />
                        {carousels.length > 1 && (
                          <div className="flex justify-center mt-4 space-x-2">
                            {carousels.map((_, index) => (
                              <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentImageIndex ? 'bg-primary' : 'bg-muted'
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full max-w-sm mx-auto h-64 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">No images available</span>
                      </div>
                    )}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{profile?.location || 'Location not available'}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{profile?.email || 'Email not available'}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{profile?.phone || 'Phone not available'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Core Values */}
      {!loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Core Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide my work and approach to development
              </p>
            </div>

            {coreValues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {coreValues.map((value, index) => (
                  <Card 
                    key={value.$id} 
                    className={`hover-lift shadow-elegant animate-fade-in-up animate-delay-${(index + 1) * 100}`}
                  >
                    <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-semibold mb-4 text-gradient">{value.values}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.values_description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-semibold mb-2">No Core Values Yet</h3>
                <p className="text-muted-foreground">
                  Core values will be displayed here once they're added.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Timeline */}
      {!loading && (
        <section className="py-20 bg-gradient-subtle">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">My Journey</h2>
              <p className="text-lg text-muted-foreground">
                A timeline of my professional growth and experiences
              </p>
            </div>

            {journey.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

                <div className="space-y-8">
                  {journey.map((item, index) => (
                    <div 
                      key={item.$id} 
                      className={`relative flex items-start animate-fade-in-up animate-delay-${(index + 1) * 100}`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-6 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-soft"></div>
                      
                      <div className="ml-16">
                        <Card className="hover-lift shadow-elegant">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <h3 className="text-lg font-semibold">{item.experience}</h3>
                              <span className="text-sm text-primary font-medium">{item.experience_time}</span>
                            </div>
                            <p className="text-muted-foreground">{item.experience_description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">No Journey Yet</h3>
                <p className="text-muted-foreground">
                  Journey experiences will be displayed here once they're added.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}