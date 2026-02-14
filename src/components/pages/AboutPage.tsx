import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Users, Target, TrendingUp, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const conferences = [
    'Zambia Conference',
    'East Africa Conference',
    'Congo Conference',
    'Burundi Conference',
    'Rwanda Conference',
    'Tanzania Conference',
    'Kenya Conference',
    'Uganda Conference',
    'South Sudan Conference',
    'Ethiopia Conference',
    'Malawi Conference',
    'Zimbabwe Conference',
    'Mozambique Conference',
    'Botswana Conference'
  ];

  const strengths = [
    'Deep-rooted organizational structure across 14 conferences',
    'Skilled and passionate human resources',
    'Strong connection to AME Church heritage',
    'Established network of young adult leaders'
  ];

  const opportunities = [
    'Growing youth engagement in faith-based initiatives',
    'Increasing awareness of sustainable development',
    'Strategic partnerships with international organizations',
    'Digital transformation for broader reach'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6">
              About RAYAC
            </h1>
            <p className="font-paragraph text-xl md:text-2xl text-white/95 max-w-4xl mx-auto">
              Empowering Young Adults to Lead with Faith and Purpose
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our History */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-4xl md:text-5xl text-primary mb-8">
                Our History
              </h2>
              <div className="space-y-6 font-paragraph text-lg text-foreground leading-relaxed">
                <p>
                  Founded in 1937 as the RAYC (Richard Allen Young Council), our organization has a rich heritage of empowering young people within the African Methodist Episcopal Church.
                </p>
                <p>
                  We evolved into the Richard Allen Young Adults Council (RAYAC) to specifically focus on young adults aged 21-39, recognizing the unique potential and challenges of this demographic.
                </p>
                <p>
                  Our mission has always been clear: to empower young adults to use their gifts, talents, and resources in service of the Lord and their communities. We believe that young adults are not just the future of the church—they are vital leaders in the present.
                </p>
                <p>
                  Through decades of service, we have remained committed to our fourfold purpose of Discipleship, Leadership, Fellowship, and Networking, creating a movement that spans across the 17th Episcopal District.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image
                  src="https://static.wixstatic.com/media/20287c_243af0ea25ef401196627467755e708a~mv2.png?originWidth=768&originHeight=576"
                  alt="RAYAC history and heritage"
                  className="w-full h-full object-cover"
                  width={800}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Structure */}
      <section className="w-full py-20 md:py-32 bg-gray-50">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-primary mb-6">
              Our Structure
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-foreground max-w-4xl mx-auto leading-relaxed">
              RAYAC operates across the 17th Episcopal District of the African Methodist Episcopal Church, spanning multiple countries and conferences throughout Africa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conference, index) => (
              <motion.div
                key={conference}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white p-6 rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-paragraph text-base text-foreground font-medium">
                    {conference}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Leadership */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-primary mb-6">
              Our Leadership
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-foreground max-w-4xl mx-auto leading-relaxed">
              RAYAC is guided by a dedicated leadership structure committed to excellence and impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl border border-gray-200"
            >
              <div className="bg-primary/10 p-4 rounded-lg w-fit mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-2xl text-primary mb-4">
                Episcopal Executive Board
              </h3>
              <p className="font-paragraph text-base text-foreground/90 leading-relaxed">
                Our governing body provides strategic oversight and ensures alignment with the AME Church's mission and values across the 17th Episcopal District.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white p-8 rounded-xl border border-gray-200"
            >
              <div className="bg-secondary/10 p-4 rounded-lg w-fit mb-6">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-heading text-2xl text-primary mb-4">
                Management Team
              </h3>
              <p className="font-paragraph text-base text-foreground/90 leading-relaxed mb-4">
                Our operational leadership ensures effective program implementation:
              </p>
              <ul className="space-y-2 font-paragraph text-base text-foreground/90">
                <li>• Executive Director</li>
                <li>• Director of Programs</li>
                <li>• Director of Finance</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Strategic Approach */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-primary mb-6">
              Our Strategic Approach
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-foreground max-w-4xl mx-auto leading-relaxed">
              We are committed to building on our strengths while tackling challenges through strategic resource mobilization and leadership development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-heading text-2xl text-primary">
                  Our Strengths
                </h3>
              </div>
              <ul className="space-y-4">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-secondary/20 rounded-full p-1 mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                    </div>
                    <p className="font-paragraph text-base text-foreground/90 leading-relaxed">
                      {strength}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Opportunities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white p-8 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-accent-orange/10 p-3 rounded-lg">
                  <Target className="h-8 w-8 text-accent-orange" />
                </div>
                <h3 className="font-heading text-2xl text-primary">
                  Our Opportunities
                </h3>
              </div>
              <ul className="space-y-4">
                {opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-accent-orange/20 rounded-full p-1 mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-accent-orange rounded-full" />
                    </div>
                    <p className="font-paragraph text-base text-foreground/90 leading-relaxed">
                      {opportunity}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
