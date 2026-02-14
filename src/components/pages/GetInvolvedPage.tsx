import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserPlus, HandHeart, Mail, Phone, User, MessageSquare, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GetInvolvedPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', interest: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const youngAdultBenefits = [
    'Connect with like-minded young adults across Africa',
    'Develop leadership skills through hands-on programs',
    'Make a tangible impact in your community',
    'Access mentorship and spiritual growth opportunities',
    'Network with leaders across 14 conferences',
    'Participate in life-changing initiatives'
  ];

  const partnerBenefits = [
    'Support sustainable development across Africa',
    'Partner with an established faith-based organization',
    'Create lasting impact in education, health, and environment',
    'Receive regular updates on program outcomes',
    'Join a network of committed partners',
    'Align with UN Sustainable Development Goals'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 bg-gradient-to-br from-accent-red to-accent-red/80">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6">
              Get Involved
            </h1>
            <p className="font-paragraph text-xl md:text-2xl text-white/95 max-w-4xl mx-auto">
              Join Us in Building a Just and Sustainable Future
            </p>
          </motion.div>
        </div>
      </section>

      {/* For Young Adults */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-accent-red/10 p-4 rounded-lg w-fit mb-6">
                <UserPlus className="h-10 w-10 text-accent-red" />
              </div>
              <h2 className="font-heading text-4xl md:text-5xl text-accent-red mb-6">
                For Young Adults
              </h2>
              <p className="font-paragraph text-lg text-gray-800 mb-8 leading-relaxed">
                Are you between 21 and 39? Find your purpose and community with RAYAC. Join us in our mission of discipleship, leadership, and service.
              </p>
              
              <div className="space-y-4 mb-8">
                {youngAdultBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="bg-secondary/20 rounded-full p-1 mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                    </div>
                    <p className="font-paragraph text-base text-gray-800">
                      {benefit}
                    </p>
                  </motion.div>
                ))}
              </div>

              <p className="font-paragraph text-base text-foreground/80 italic">
                "Use your gifts, talents, and resources in service of the Lord and your community."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image
                  src="https://static.wixstatic.com/media/20287c_dafb052020004dbb95942623839c59ed~mv2.png?originWidth=768&originHeight=576"
                  alt="Young adults in community service"
                  className="w-full h-full object-cover"
                  width={800}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Partners & Donors */}
      <section className="w-full py-20 md:py-32 bg-black">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image
                  src="https://static.wixstatic.com/media/20287c_faab30eba923427abbf339668c0d15a6~mv2.png?originWidth=768&originHeight=576"
                  alt="Partnership and collaboration"
                  className="w-full h-full object-cover"
                  width={800}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="bg-secondary/10 p-4 rounded-lg w-fit mb-6">
                <HandHeart className="h-10 w-10 text-secondary" />
              </div>
              <h2 className="font-heading text-4xl md:text-5xl text-accent-red mb-6">
                For Partners & Donors
              </h2>
              <p className="font-paragraph text-lg text-white/90 mb-8 leading-relaxed">
                Support our seven core programs. Your partnership helps us implement life-changing initiatives in education, health, and environmental protection across Africa.
              </p>
              
              <div className="space-y-4 mb-8">
                {partnerBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="bg-accent-red/20 rounded-full p-1 mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-accent-red rounded-full" />
                    </div>
                    <p className="font-paragraph text-base text-white/80">
                      {benefit}
                    </p>
                  </motion.div>
                ))}
              </div>

              <p className="font-paragraph text-base text-white/70 italic">
                "Together, we can create lasting change in communities across the 17th Episcopal District."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="w-full py-20 md:py-32 bg-white">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-accent-red mb-6">
              Get in Touch
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
              Ready to join us or partner with RAYAC? Fill out the form below and we'll get back to you soon.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            {isSubmitted ? (
              <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-8 text-center">
                <CheckCircle className="h-16 w-16 text-accent-red mx-auto mb-4" />
                <h3 className="font-heading text-2xl text-accent-red mb-3">
                  Thank You!
                </h3>
                <p className="font-paragraph text-base text-gray-800">
                  We've received your message and will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-2xl border border-accent-red/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="name" className="font-paragraph text-base text-gray-800 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="font-paragraph"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-paragraph text-base text-gray-800 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="font-paragraph"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="phone" className="font-paragraph text-base text-gray-800 mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="font-paragraph"
                      placeholder="+260 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="interest" className="font-paragraph text-base text-gray-800 mb-2">
                      I'm Interested In *
                    </Label>
                    <Input
                      id="interest"
                      name="interest"
                      type="text"
                      required
                      value={formData.interest}
                      onChange={handleChange}
                      className="font-paragraph"
                      placeholder="e.g., Membership, Partnership, Volunteering"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <Label htmlFor="message" className="font-paragraph text-base text-gray-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="font-paragraph min-h-[150px]"
                    placeholder="Tell us more about your interest in RAYAC..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent-red hover:bg-accent-red/90 text-white font-paragraph font-semibold text-lg py-6 rounded-lg transition-all duration-300"
                >
                  Submit
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
