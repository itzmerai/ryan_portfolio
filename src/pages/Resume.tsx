import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Download, Eye, FileText } from 'lucide-react';

export default function Resume() {
  const { state } = usePortfolio();
  const { profile } = state;

  const handleDownload = () => {
    // Mock download functionality
    const link = document.createElement('a');
    link.href = '/path-to-resume.pdf'; // Would be replaced with actual resume URL
    link.download = `${profile.name.replace(' ', '_')}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            My <span className="text-gradient">Resume</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Download my latest resume or view it online to learn more about my professional 
            experience, education, and technical skills.
          </p>
        </div>
      </section>

      {/* Resume Actions */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Download Option */}
            <Card className="hover-lift shadow-elegant animate-fade-in-up">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 hover-glow transition-smooth">
                  <Download className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Download Resume</h2>
                <p className="text-muted-foreground mb-6">
                  Get a PDF copy of my resume to review offline or share with your team.
                </p>
                <Button onClick={handleDownload} className="hover-lift">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            {/* View Online Option */}
            <Card className="hover-lift shadow-elegant animate-fade-in-up animate-delay-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 hover-glow transition-smooth">
                  <Eye className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-4">View Online</h2>
                <p className="text-muted-foreground mb-6">
                  Browse through my resume content directly on this website for a quick overview.
                </p>
                <Button variant="outline" asChild className="hover-lift">
                  <a href="#resume-content">
                    <Eye className="h-4 w-4 mr-2" />
                    View Below
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resume Content */}
      <section id="resume-content" className="py-20 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-elegant">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8 pb-8 border-b border-border">
                <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                <p className="text-xl text-primary mb-4">{profile.title}</p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <span>{profile.email}</span>
                  <span>•</span>
                  <span>{profile.phone}</span>
                  <span>•</span>
                  <span>{profile.location}</span>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Professional Summary
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </div>

              {/* Experience */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Professional Experience
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold">Senior Full-Stack Developer</h3>
                    <p className="text-primary">Tech Innovation Inc. • 2024 - Present</p>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>• Leading development of scalable web applications using React and Node.js</li>
                      <li>• Mentoring junior developers and conducting code reviews</li>
                      <li>• Implementing CI/CD pipelines and cloud deployment strategies</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Full-Stack Developer</h3>
                    <p className="text-primary">Digital Solutions LLC • 2022 - 2024</p>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>• Built responsive web applications with modern frameworks</li>
                      <li>• Collaborated with cross-functional teams to deliver projects on time</li>
                      <li>• Optimized application performance and user experience</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Education
                </h2>
                <div>
                  <h3 className="font-semibold">Bachelor of Science in Computer Science</h3>
                  <p className="text-primary">University of California • 2019</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Graduated with honors • GPA: 3.8/4.0
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Technical Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Frontend</h3>
                    <p className="text-muted-foreground text-sm">
                      React, TypeScript, Vue.js, HTML5, CSS3, Tailwind CSS
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Backend</h3>
                    <p className="text-muted-foreground text-sm">
                      Node.js, Express, Python, PostgreSQL, MongoDB
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Tools & Platforms</h3>
                    <p className="text-muted-foreground text-sm">
                      Docker, AWS, Git, Figma, VS Code
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Other</h3>
                    <p className="text-muted-foreground text-sm">
                      API Design, Testing, Agile, UI/UX Design
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Work Together?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Download my resume or get in touch to discuss how I can help with your next project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={handleDownload}
              className="hover-lift"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover-lift"
            >
              <a href="/contact">
                Get In Touch
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}