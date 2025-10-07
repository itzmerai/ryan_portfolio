import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Code, Server, Package, Cloud, Database, Monitor } from 'lucide-react';
import { databases, DB_ID } from '../../appwrite-config';
import { Query } from 'appwrite';

const categoryList = [
  'Front_End',
  'Back_end',
  'Database',
  'Tools',
  'Crm',
  'Automation',
  'language'
];

const categoryTitles: Record<string, string> = {
  'Front_End': 'Frontend Development',
  'Back_end': 'Backend Development',
  'Tools': 'Tools & Technologies',
  'Database': 'Database Technologies',
  'Crm': 'CRM Systems',
  'Automation': 'Automation',
  'language': 'Language',
};

export default function Skills() {
  const { state } = usePortfolio();
  const [skills, setSkills] = useState<any[]>([]);
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, 'skill', [Query.limit(100)]);
      const allSkills = res.documents;

      // Map skills by category
      const byCategory: Record<string, any[]> = {};
      categoryList.forEach(cat => byCategory[cat] = []);
      allSkills.forEach(skill => {
        if (!byCategory[skill.skill_category]) byCategory[skill.skill_category] = [];
        byCategory[skill.skill_category].push(skill);
      });

      setSkills(allSkills);
      setSkillsByCategory(byCategory);
    } catch (error) {
      console.error('Failed to load skills:', error);
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
            Skills & <span className="text-gradient">Technologies</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A comprehensive overview of the technologies and tools I use to bring ideas to life. 
            From frontend frameworks to backend services, here's what powers my development workflow.
          </p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-lg text-muted-foreground">Loading skills...</div>
          </div>
        </section>
      )}

      {/* Skills Grid */}
      {!loading && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {skills.length > 0 ? (
              categoryList.map(category => {
                const categorySkills = skillsByCategory[category] || [];
                // Only render category if it has skills
                if (categorySkills.length === 0) return null;
                
                return (
                  <div key={category} className="mb-16 last:mb-0">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
                      {categoryTitles[category]}
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {categorySkills.map((skill, skillIndex) => {
                        return (
                          <Card 
                            key={skill.$id} 
                            className={`hover-lift shadow-elegant animate-fade-in-up animate-delay-${(skillIndex + 1) * 100}`}
                          >
                            <CardContent className="p-6 text-center">
                              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                {skill.icon_url ? (
                                  <img 
                                    src={skill.icon_url} 
                                    alt={skill.skill_name}
                                    className="h-12 w-12 object-contain"
                                  />
                                ) : (
                                  <Code className="h-12 w-12 text-primary" />
                                )}
                              </div>
                              <h3 className="font-semibold text-lg">{skill.skill_name}</h3>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-xl font-semibold mb-2">No Skills Yet</h3>
                <p className="text-muted-foreground">
                  Skills will be displayed here once they're added.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let's discuss how these skills can help bring your project to life.
          </p>
        </div>
      </section>
    </Layout>
  );
}