
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// La barre de navigation bascule en menu compact sous 1024px (lg) : en dessous,
// les rubriques ne tiennent plus sur une seule ligne à côté du logo et du bouton.
const useCompactNav = () => {
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setIsCompact(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isCompact;
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isCompact = useCompactNav();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  
  // Déterminer si la page actuelle est une page de blog (index ou post)
  const isBlogPage = location.pathname.startsWith('/blog');
  
  // Forcer le mode scrollé pour les pages de blog
  const shouldForceScrolled = isBlogPage;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Forcer l'état scrollé pour certaines pages (blog post)
    if (shouldForceScrolled) {
      setIsScrolled(true);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [shouldForceScrolled]);

  // Close mobile menu when switching to desktop view
  useEffect(() => {
    if (!isCompact && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isCompact, isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'À propos', href: '/#about' },
    { name: 'Offres', href: '/#offres' },
    { name: 'Services', href: '/#services' },
    { name: 'IA & Logiciel', href: '/expertise/ia-et-genie-logiciel' },
    { name: 'Outils', href: '/outils' },
    { name: 'Notre Blog', href: '/blog' },
  ];

  const handleNavLinkClick = (href: string) => {
    if (isCompact) {
      setIsMenuOpen(false);
    }
    
    // Si on est sur une page autre que l'accueil et qu'on clique sur un lien avec ancre vers l'accueil
    if (href.includes('/#') && location.pathname !== '/') {
      navigate('/');
      // Attendre que la navigation soit terminée, puis scroller vers l'ancre
      setTimeout(() => {
        const hash = href.split('#')[1];
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Helper function to determine if a link should use Link or anchor tag
  const renderNavLink = (link: { name: string; href: string }) => {
    // Check if it's an internal link with anchor or just a route path
    if (link.href.includes('/#')) {
      // Si on est sur la page d'accueil, utiliser un lien ancre normal
      if (location.pathname === '/') {
        const hash = link.href.split('/')[1]; // Extract just the hash part
        return (
          <a
            key={link.name}
            href={hash}
            className={cn(
              "font-medium transition-colors text-sm xl:text-base",
              isScrolled || shouldForceScrolled ? "text-prisma-purple hover:text-prisma-chartreuse" : "text-white hover:text-prisma-chartreuse"
            )}
            onClick={() => handleNavLinkClick(link.href)}
          >
            {link.name}
          </a>
        );
      } else {
        // Si on n'est pas sur la page d'accueil, utiliser un bouton qui navigue vers l'accueil puis scroll
        return (
          <button
            key={link.name}
            onClick={() => handleNavLinkClick(link.href)}
            className={cn(
              "font-medium transition-colors text-sm xl:text-base",
              isScrolled || shouldForceScrolled ? "text-prisma-purple hover:text-prisma-chartreuse" : "text-white hover:text-prisma-chartreuse"
            )}
          >
            {link.name}
          </button>
        );
      }
    } else {
      // For separate routes
      return (
        <Link
          key={link.name}
          to={link.href}
          className={cn(
            "font-medium transition-colors text-sm xl:text-base",
            isScrolled || shouldForceScrolled ? "text-prisma-purple hover:text-prisma-chartreuse" : "text-white hover:text-prisma-chartreuse"
          )}
          onClick={() => handleNavLinkClick(link.href)}
        >
          {link.name}
        </Link>
      );
    }
  };

  const handleContactClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('contact');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300',
        isScrolled || shouldForceScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-4 sm:py-5'
      )}
    >
      <div className="container flex justify-between items-center px-4 sm:px-6">
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center">
            <span className="font-heading font-bold text-lg xs:text-xl md:text-2xl">
              <span className={cn(
                isScrolled || shouldForceScrolled ? "text-prisma-purple" : "text-white"
              )}>PRISMA</span>
              <span className="text-prisma-chartreuse">GESTION</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          {navLinks.map(link => renderNavLink(link))}
          
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "flex items-center gap-2",
                    isScrolled || shouldForceScrolled ? "text-prisma-purple hover:text-prisma-chartreuse" : "text-white hover:text-prisma-chartreuse"
                  )}
                >
                  <User className="h-4 w-4" />
                  Mon compte
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {location.pathname === '/' ? (
            <a 
              href="#contact" 
              className="btn-secondary text-sm xl:text-base"
            >
              Nous contacter
            </a>
          ) : (
            <button 
              onClick={handleContactClick}
              className="btn-secondary text-sm xl:text-base"
            >
              Nous contacter
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            // 44×44 : c'est la cible la plus sollicitée du site sur mobile.
            // `p-2` autour d'une icône de 20px n'en donnait que 36.
            "lg:hidden inline-flex items-center justify-center h-11 w-11 -mr-2 focus:outline-none focus:ring-2 focus:ring-prisma-chartreuse rounded-md",
            isScrolled || shouldForceScrolled ? "text-prisma-purple" : "text-white"
          )}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={cn(
          "lg:hidden fixed inset-0 bg-white z-40 overflow-y-auto transition-all",
          isScrolled || shouldForceScrolled ? "top-[57px]" : "top-[64px] sm:top-[77px]"
        )}>
          <div className="container py-6 px-4 flex flex-col space-y-2">
            {navLinks.map(link => {
              // Check if it's an anchor link (contains #)
              if (link.href.includes('/#')) {
                if (location.pathname === '/') {
                  const hash = link.href.split('/')[1]; // Extract just the hash part
                  return (
                    <a
                      key={link.name}
                      href={hash}
                      className="text-prisma-purple hover:text-prisma-chartreuse font-medium py-4 text-lg transition-colors border-b border-gray-100 flex items-center justify-between"
                      onClick={() => handleNavLinkClick(link.href)}
                    >
                      {link.name}
                    </a>
                  );
                } else {
                  return (
                    <button
                      key={link.name}
                      onClick={() => handleNavLinkClick(link.href)}
                      className="text-prisma-purple hover:text-prisma-chartreuse font-medium py-4 text-lg transition-colors border-b border-gray-100 flex items-center justify-between text-left"
                    >
                      {link.name}
                    </button>
                  );
                }
              } else {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-prisma-purple hover:text-prisma-chartreuse font-medium py-4 text-lg transition-colors border-b border-gray-100 flex items-center justify-between"
                    onClick={() => handleNavLinkClick(link.href)}
                  >
                    {link.name}
                  </Link>
                );
              }
            })}
            
            {!loading && user && (
              <>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              </>
            )}
            
            {location.pathname === '/' ? (
              <a 
                href="#contact" 
                className="btn-secondary inline-block text-center w-full mt-4"
                onClick={() => handleNavLinkClick('#contact')}
              >
                Nous contacter
              </a>
            ) : (
              <button 
                onClick={handleContactClick}
                className="btn-secondary inline-block text-center w-full mt-4"
              >
                Nous contacter
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
