import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Leaf, Scale, GraduationCap, Utensils, Users, Brain, Church } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { CorePrograms } from '@/entities';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<CorePrograms[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<CorePrograms>('coreprograms');
      setPrograms(result.items);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconMap: Record<string, any> = {
    APJP: Scale,
    LGG: Leaf,
    EA: GraduationCap,
    AMA: Utensils,
    GEA: Users,
    MMI: Brain,
    TRSI: Church
  };

  const colorMap: Record<string, string> = {
    APJP: 'text-accent-red',
    LGG: 'text-secondary',
    EA: 'text-accent-red',
    AMA: 'text-accent-red',
    GEA: 'text-secondary',
    MMI: 'text-accent-red',
    TRSI: 'text-accent-red'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 bg-gradient-to-br from-black to-black/80">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6">
              Our Initiatives
            </h1>
            <p className="font-paragraph text-xl md:text-2xl text-white/95 max-w-4xl mx-auto">
              Ministering to Mind, Body, and Soul
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="w-full py-16 md:py-20 bg-background">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-paragraph text-lg md:text-xl text-foreground text-center max-w-5xl mx-auto leading-relaxed"
          >
            Stemming from this purpose, RAYAC has identified seven (7) core Programs for the coming five-year period which will greatly benefit from collaboration with stakeholders through learning, solidarity, and resource support (technical and financial). These seven (7) Programs will be supported by the Institutional Capacity Building Program (ICBP), a Program which will enhance the capacity of RAYAC to implement the Programs effectively and efficiently at all levels of the 17th Episcopal district.
          </motion.p>
        </div>
      </section>

      {/* Programs List */}
      <section className="w-full pb-20 md:pb-32">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <div className="min-h-[600px]">
            {isLoading ? null : programs.length > 0 ? (
              <div className="space-y-24">
                {programs.map((program, index) => {
                  const IconComponent = iconMap[program.acronym || ''] || Church;
                  const iconColor = colorMap[program.acronym || ''] || 'text-primary';
                  const isEven = index % 2 === 0;

                  return (
                    <motion.div
                      key={program._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                        isEven ? '' : 'lg:grid-flow-dense'
                      }`}
                    >
                      {/* Image */}
                      <div className={isEven ? '' : 'lg:col-start-2'}>
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                          <Image
                            src={program.programImage || 'https://static.wixstatic.com/media/20287c_f3c96b08cf6e4926baea95f489e8ca46~mv2.png?originWidth=768&originHeight=576'}
                            alt={program.programName || 'Program image'}
                            className="w-full h-full object-cover"
                            width={800}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className={isEven ? '' : 'lg:col-start-1 lg:row-start-1'}>
                        <div className={`${iconColor} mb-6`}>
                          <IconComponent className="h-16 w-16" />
                        </div>
                        
                        <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">
                          {program.programName}
                        </h2>
                        
                        {program.acronym && (
                          <p className="font-paragraph text-lg text-accent-red font-semibold mb-6">
                            {program.acronym}
                          </p>
                        )}

                        {program.briefDescription && (
                          <p className="font-paragraph text-lg text-white/90 mb-6 leading-relaxed">
                            {program.briefDescription}
                          </p>
                        )}

                        {program.detailedDescription && (
                          <p className="font-paragraph text-base text-white/80 mb-6 leading-relaxed">
                            {program.detailedDescription}
                          </p>
                        )}

                        {program.sdgAlignment && (
                          <div className="mb-6">
                            <h3 className="font-heading text-xl text-accent-red mb-3">
                              SDG Alignment
                            </h3>
                            <p className="font-paragraph text-base text-white/80 leading-relaxed">
                              {program.sdgAlignment}
                            </p>
                          </div>
                        )}

                        {program.keyActivities && (
                          <div className="bg-black/40 border border-accent-red/30 p-6 rounded-xl">
                            <h3 className="font-heading text-xl text-accent-red mb-4">
                              Key Activities
                            </h3>
                            <div className="font-paragraph text-base text-white/80 leading-relaxed whitespace-pre-line">
                              {program.keyActivities}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-paragraph text-lg text-foreground/60">
                  Programs information coming soon
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
