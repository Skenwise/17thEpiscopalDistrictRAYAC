import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const programs = [
    { name: 'Advocacy for Peace & Justice', acronym: 'APJP' },
    { name: "Let's Go Green", acronym: 'LGG' },
    { name: 'Education for All', acronym: 'EA' },
    { name: 'A Meal for All', acronym: 'AMA' },
    { name: 'Gender Equality for All', acronym: 'GEA' },
    { name: 'Mind Matters Initiative', acronym: 'MMI' },
    { name: 'Temple Restoration & Stewardship', acronym: 'TRSI' }
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Programs', path: '/programs' },
    { name: 'About Us', path: '/about' },
    { name: 'Get Involved', path: '/get-involved' }
  ];

  return (
    <footer className="w-full bg-primary text-white">
      <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-6 tracking-tight">RAYAC</h3>
            <p className="font-paragraph text-sm text-white/85 mb-6 leading-relaxed">
              Richard Allen Young Adults Council of the 17th Episcopal District. Ministering to the mind, body, and soul.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-accent-orange transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-accent-orange transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-accent-orange transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-6 tracking-tight">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-paragraph text-sm text-white/80 hover:text-accent-orange transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Programs */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-6 tracking-tight">Core Programs</h3>
            <ul className="space-y-3">
              {programs.slice(0, 5).map((program) => (
                <li key={program.acronym}>
                  <Link
                    to="/programs"
                    className="font-paragraph text-sm text-white/80 hover:text-accent-orange transition-colors duration-300"
                  >
                    {program.acronym}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-6 tracking-tight">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent-orange flex-shrink-0 mt-0.5" />
                <span className="font-paragraph text-sm text-white/80">
                  17th Episcopal District, AME Church
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent-orange flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info@rayac.org"
                  className="font-paragraph text-sm text-white/80 hover:text-accent-orange transition-colors duration-300"
                >
                  info@rayac.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-accent-orange flex-shrink-0 mt-0.5" />
                <span className="font-paragraph text-sm text-white/80">
                  +260 XXX XXX XXX
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-paragraph text-xs text-white/70 text-center md:text-left">
              © {new Date().getFullYear()} Richard Allen Young Adults Council. All rights reserved.
            </p>
            <p className="font-paragraph text-xs text-white/70 text-center md:text-right">
              17th Episcopal District, African Methodist Episcopal Church
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
