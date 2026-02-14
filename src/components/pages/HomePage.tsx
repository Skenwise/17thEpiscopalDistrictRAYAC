// HPI 1.7-G
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Church, ChevronRight, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// ... keep existing code (imports) ...

// --- Types ---

// --- Components ---

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 bg-accent-red origin-left z-50"
      style={{ scaleX }}
    />
  );
};

const ParallaxSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

const FadeInUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StaggerContainer = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15
          }
        }
      }}
      className={className}
      className="bg-accent-silver">
      {children}
    </motion.div>
  );
};

const StaggerItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function HomePage() {
  // ... keep existing code (animation hooks and state) ...
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-secondary selection:text-white overflow-x-clip">
      <ScrollProgress />
      <Header />
      <main>
        {/* --- HERO SECTION --- */}
        <section ref={heroRef} className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden bg-black">
          {/* Parallax Background */}
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="absolute inset-0 z-0"
          >
            <Image
              src="https://static.wixstatic.com/media/20287c_11f8cf62c82a4a6997c11a2ea3988758~mv2.png?originWidth=1920&originHeight=1024"
              alt="Young adults working together in community action"
              className="w-full h-full object-cover scale-105"
              width={1920}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 mix-blend-multiply" />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-[120rem] mx-auto px-6 md:px-12 lg:px-24 pt-20">
            <div className="max-w-5xl">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="h-[1px] w-12 bg-accent-red" />
                <span className="text-accent-red font-bold tracking-widest uppercase text-sm">Est. 1937</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="font-heading text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8 drop-shadow-lg font-light"
              >
                A New Generation <br />
                <span className="text-accent-red italic font-normal">of Believers.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="font-paragraph text-lg md:text-xl text-white/90 mb-12 max-w-3xl leading-relaxed border-l-4 border-accent-red pl-6 italic"
              >
                "God has called a new generation of believers to make God known. God is calling for young men and women to serve as God's ambassadors and ministers of reconciliation in the midst of life's transition. Now is the time to take our place in the struggle. Now is the time to serve the present age our callings to fulfill."
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-6"
              >
                <Link to="/programs">
                  <Button
                    size="lg"
                    className="bg-accent-red hover:bg-accent-red/90 text-white font-bold text-lg px-10 py-7 rounded-full transition-all duration-300 shadow-lg hover:shadow-accent-red/30 hover:-translate-y-1"
                  >
                    Explore Our Work
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold text-lg px-10 py-7 rounded-full transition-all duration-300 backdrop-blur-sm"
                  >
                    Our Story
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronRight className="rotate-90 w-5 h-5" />
            </motion.div>
          </motion.div>
        </section>

        {/* --- MISSION STATEMENT (Visual Breather) --- */}
        <section className="relative w-full py-32 md:py-48 bg-white overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 -skew-x-12 translate-x-20 z-0" />
          <div className="absolute top-20 left-10 opacity-5 pointer-events-none">
            <Church className="w-96 h-96 text-primary" />
          </div>

          <div className="relative z-10 max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5">
                <FadeInUp>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-[2px] w-16 bg-secondary" />
                    <span className="text-primary font-bold tracking-widest uppercase">Our Mission</span>
                  </div>
                  <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-8">
                    Ministering to the <span className="text-secondary">Mind, Body, and Soul.</span>
                  </h2>
                  <div className="relative">
                    <Image 
                      src="https://static.wixstatic.com/media/20287c_7efae2277a6f4686b60f0ca9820af79d~mv2.png?originWidth=768&originHeight=384"
                      alt="Community gathering"
                      className="w-full h-[400px] object-cover rounded-2xl shadow-2xl"
                      width={800}
                    />
                    <div className="absolute -bottom-10 -right-10 bg-accent-orange p-8 rounded-tl-3xl rounded-br-3xl shadow-xl hidden md:block">
                      <Heart className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </FadeInUp>
              </div>

              <div className="lg:col-span-7">
                <FadeInUp delay={0.2}>
                  <p className="font-paragraph text-xl md:text-2xl lg:text-3xl text-gray-800 leading-relaxed font-light mb-8">
                    Ministering to the intellectual (mind), physical (body) and spiritual (soul) needs of the members of the body of Christ.
                  </p>
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border-l-2 border-gray-200 pl-6">
                      <h3 className="font-heading text-xl text-primary mb-2">Discipleship</h3>
                      <p className="text-secondary">Bringing young adults into a covenant relationship with Jesus Christ, teaching them how to live Christ-centred lives, and serve as Christian mentors to youths.</p>
                    </div>
                    <div className="border-l-2 border-gray-200 pl-6">
                      <h3 className="font-heading text-xl text-primary mb-2">Leadership Training</h3>
                      <p className="text-secondary">Develop young adults into Christian leaders within the AME church and community at large to effectively represent and voice the concerns of a new generation.</p>
                    </div>
                    <div className="border-l-2 border-gray-200 pl-6">
                      <h3 className="font-heading text-xl text-primary mb-2">Fellowship</h3>
                      <p className="text-secondary">Create and provide opportunities for Christian fellowship among young adults.</p>
                    </div>
                    <div className="border-l-2 border-gray-200 pl-6">
                      <h3 className="font-heading text-xl text-primary mb-2">Networking</h3>
                      <p className="text-secondary">Provide resources for young adult ministries within the AME church and the community at large and provide opportunities for young adults to use their God-given gifts and talents for Kingdom building.</p>
                    </div>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </div>
        </section>



        {/* --- CALL TO ACTION (Parallax & Full Bleed) --- */}
        <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://static.wixstatic.com/media/20287c_af7dbad5068f423da76b5e2b3245857e~mv2.png?originWidth=1920&originHeight=1024"
              alt="Zambian landscape"
              className="w-full h-full object-cover"
              width={1920}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24 text-center">
            <FadeInUp>
              <div className="inline-block mb-8 p-4 border border-white/30 rounded-full backdrop-blur-md bg-white/10">
                <span className="text-white font-bold tracking-widest uppercase px-4">Join The Movement</span>
              </div>
              
              <h2 className="font-heading text-5xl md:text-7xl text-white mb-8 leading-tight">
                Guided by Our <br/>
                <span className="text-accent-red">Fourfold Purpose</span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16 max-w-5xl mx-auto">
                {['Discipleship', 'Leadership', 'Fellowship', 'Networking'].map((item, i) => (
                  <div key={item} className="text-white/90 font-heading text-xl md:text-2xl border-t border-accent-red/50 pt-4">
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/get-involved">
                  <Button
                    size="lg"
                    className="bg-accent-red hover:bg-accent-red/90 text-white font-bold text-xl px-12 py-8 rounded-full transition-all duration-300 shadow-xl hover:shadow-accent-red/40 hover:-translate-y-1"
                  >
                    Join Us Today
                  </Button>
                </Link>
                <Link to="/get-involved">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-black font-bold text-xl px-12 py-8 rounded-full transition-all duration-300"
                  >
                    Partner With Us
                  </Button>
                </Link>
              </div>
            </FadeInUp>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}