import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';
import { Shield, Target, TrendingUp, Users } from 'lucide-react';

export default function AboutPage() {
  const conferences = [
    'South East Zambia Conference (SEZC)',
    'South West Zambia conference (SWZC)',
    'Zambezi conference',
    'North East Zambia conference (NEZC)',
    'North West Zambia conference (NWZC)',
    'East Africa conference (EAC)',
    'Great Lakes conference (GLC)',
    'Katanga conference',
    'Kananga conference',
    'Mbujimayi conference',
    'Congo River conference (CRC)',
    'Burundi conference',
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
      <section className="relative w-full py-24 md:py-32 bg-gradient-to-br from-black to-black/80">
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
              I Must Be About My Fathers Business
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
              <h2 className="font-heading text-4xl md:text-5xl text-accent-red mb-8">
                Our History
              </h2>
              <div className="space-y-6 font-paragraph text-lg text-gray-800 leading-relaxed">
                <p>
                  The Richard Allen Youth Council was founded in Memphis, Tennessee, during the 150th celebration of the African Methodist Episcopal Church.

The Sesquicential Festival of Negro Methodism was celebrated by the African Methodist Episcopal Church, June 22-27, 1937. It marked 150 years of progress by the AME Church since Richard Allen and his followers withdrew from St. George M.E. Church in Philadelphia, PA, in 1787. It was the beginning of a movement for self-help, self-movement, and self-direction in the religious life of people of African descent in America.

This agency came from the vision of Dr. S. S. Morris, Sr., who committed to the idea of bringing existing youth organizations together in the format of a council. It was not the intent of the RAYC to replace any youth agency or organization. Each organization would keep its own identity.

The primary goal of the RAYC was to coordinate and unify the total program which the local church offered its youth.
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
      <section className="w-full py-20 md:py-32 bg-black">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-accent-red mb-6">
              Our Structure
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
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
                className="bg-black/40 border border-accent-red/30 p-6 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-accent-red/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-accent-red" />
                  </div>
                  <p className="font-paragraph text-base text-white/90 font-medium">
                    {conference}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Leadership */}
      <section className="w-full py-20 md:py-32 bg-white">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-accent-red mb-6">
              Our Leadership
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-gray-800 max-w-4xl mx-auto leading-relaxed">
              RAYAC is guided by a dedicated leadership structure committed to excellence and impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-black/5 border border-accent-red/30 p-8 rounded-xl"
            >
              <div className="bg-accent-red/10 p-4 rounded-lg w-fit mb-6">
                <Shield className="h-8 w-8 text-accent-red" />
              </div>
              <h3 className="font-heading text-2xl text-accent-red mb-4">
                Episcopal Executive Board
              </h3>
              <p className="font-paragraph text-base text-gray-800 leading-relaxed">
                Our governing body provides strategic oversight and ensures alignment with the AME Church's mission and values across the 17th Episcopal District.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-black/5 border border-accent-red/30 p-8 rounded-xl"
            >
              <div className="bg-secondary/10 p-4 rounded-lg w-fit mb-6">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-heading text-2xl text-accent-red mb-4">
                Management Team
              </h3>
              <p className="font-paragraph text-base text-gray-800 leading-relaxed mb-4">
                Our operational leadership ensures effective program implementation:
              </p>
              <ul className="space-y-2 font-paragraph text-base text-gray-800">
                <li>• Executive Director</li>
                <li>• Director of Programs</li>
                <li>• Director of Finance</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Strategic Approach */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-br from-black/5 to-accent-red/5">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-accent-red mb-6">
              Our Strategic Approach
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-gray-800 max-w-4xl mx-auto leading-relaxed">
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
              className="bg-white p-8 rounded-xl border border-accent-red/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-accent-red/10 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-accent-red" />
                </div>
                <h3 className="font-heading text-2xl text-accent-red">
                  Our Strengths
                </h3>
              </div>
              <ul className="space-y-4">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-accent-red/20 rounded-full p-1 mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-accent-red rounded-full" />
                    </div>
                    <p className="font-paragraph text-base text-gray-800 leading-relaxed">
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
              className="bg-white p-8 rounded-xl border border-accent-red/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-accent-red/10 p-3 rounded-lg">
                  <Target className="h-8 w-8 text-accent-red" />
                </div>
                <h3 className="font-heading text-2xl text-accent-red">
                  Our Opportunities
                </h3>
              </div>
              <ul className="space-y-4">
                {opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-accent-red/20 rounded-full p-1 mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-accent-red rounded-full" />
                    </div>
                    <p className="font-paragraph text-base text-gray-800 leading-relaxed">
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
