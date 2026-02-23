import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { Leaf, Scale, GraduationCap, Utensils, Users, Brain, Church } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { CorePrograms } from "@/entities";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<CorePrograms[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      if (!res.ok) throw new Error("Failed to load programs");

      const data = await res.json();
      setPrograms(data.items || []);
    } catch (error) {
      console.error("Error loading programs:", error);
      setPrograms([]);
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
    TRSI: Church,
  };

  const colorMap: Record<string, string> = {
    APJP: "text-accent-red",
    LGG: "text-secondary",
    EA: "text-accent-red",
    AMA: "text-accent-red",
    GEA: "text-secondary",
    MMI: "text-accent-red",
    TRSI: "text-accent-red",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative w-full py-24 md:py-32 bg-gradient-to-br from-black to-black/80">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6"
          >
            Our Initiatives
          </motion.h1>
          <p className="text-xl md:text-2xl text-white/95">
            Ministering to Mind, Body, and Soul
          </p>
        </div>
      </section>

      <section className="w-full pb-20 md:pb-32">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          {isLoading ? null : programs.length > 0 ? (
            <div className="space-y-24">
              {programs.map((program, index) => {
                const IconComponent = iconMap[program.acronym || ""] || Church;
                const iconColor = colorMap[program.acronym || ""] || "text-primary";
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={program._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                      isEven ? "" : "lg:grid-flow-dense"
                    }`}
                  >
                    <div className={isEven ? "" : "lg:col-start-2"}>
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                        <Image
                          src={program.programImage}
                          alt={program.programName || "Program image"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className={isEven ? "" : "lg:col-start-1 lg:row-start-1"}>
                      <div className={`${iconColor} mb-6`}>
                        <IconComponent className="h-16 w-16" />
                      </div>

                      <h2 className="text-4xl md:text-5xl mb-4 text-secondary">
                        {program.programName}
                      </h2>

                      {program.briefDescription && (
                        <p className="text-lg mb-6 text-secondary">
                          {program.briefDescription}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-foreground/60">
                Programs information coming soon
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
