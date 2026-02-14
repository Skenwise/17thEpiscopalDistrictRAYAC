import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Programs', path: '/programs' },
    { name: 'About Us', path: '/about' },
    { name: 'Get Involved', path: '/get-involved' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full bg-black border-b border-accent-red sticky top-0 z-50 shadow-lg">
      <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <Image
              src="https://static.wixstatic.com/media/20287c_da5a4e42cac34cadbb88fb8b65cbfea1~mv2.avif"
              className="h-12 w-auto"
              width={48}
              originWidth={368}
              originHeight={356} />
            <div className="font-heading text-2xl md:text-3xl text-accent-red font-bold tracking-tight">
              17th Episcopal District
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-paragraph text-sm font-medium transition-colors duration-300 uppercase tracking-wide ${
                  isActive(link.path)
                    ? 'text-accent-red border-b-2 border-accent-red pb-1'
                    : 'text-foreground hover:text-accent-red'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <Link to="/get-involved">
              <Button
                className="bg-accent-red hover:bg-accent-red/90 text-white font-paragraph font-semibold px-8 py-2 rounded-full transition-all duration-300"
              >
                Get Involved
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-accent-red"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-6 border-t border-accent-red bg-black">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-paragraph text-sm font-medium py-2 transition-colors duration-300 uppercase tracking-wide ${
                    isActive(link.path)
                      ? 'text-accent-red'
                      : 'text-foreground hover:text-accent-red'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/get-involved" onClick={() => setIsMenuOpen(false)}>
                <Button
                  className="w-full bg-accent-red hover:bg-accent-red/90 text-white font-paragraph font-semibold px-6 py-2 rounded-full transition-all duration-300"
                >
                  Get Involved
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
