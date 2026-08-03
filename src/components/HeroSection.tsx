
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getSectionContent, HeroSectionContent, clearSectionsCache } from '@/utils/siteSections';
import { AppointmentDialog } from './AppointmentDialog';

const defaultData: HeroSectionContent = {
  title: "Votre partenaire en expertise comptable et numérique",
  description: "PRISMA GESTION vous accompagne avec des solutions sur-mesure en comptabilité, finance, fiscalité et RH — et pilote vos projets de génie logiciel et d'intelligence artificielle, du conseil au paramétrage des modèles.",
  buttonText: "Découvrir nos services",
  buttonLink: "#services",
  secondaryButtonText: "Prendre Rendez-vous",
  secondaryButtonLink: "", // plus de route pour rendez-vous
};

const HeroSection = () => {
  const [heroData, setHeroData] = useState<HeroSectionContent>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentOpen, setAppointmentOpen] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    getSectionContent<HeroSectionContent>('hero').then((content) => {
      if (content) {
        setHeroData(content);
      } else {
        setHeroData(defaultData);
      }
      setIsLoading(false);
    }).catch(() => {
      setHeroData(defaultData);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadData();
    }
    const handleContentUpdate = (e: CustomEvent) => {
      if (!mounted) return;
      const { section, content } = e.detail || {};
      if (section === 'hero' && content) {
        setHeroData(content);
      } 
      else if (section === 'hero' || !section) {
        clearSectionsCache('hero');
        loadData();
      }
    };
    window.addEventListener('home-content-update', handleContentUpdate as EventListener);
    return () => { 
      mounted = false; 
      window.removeEventListener('home-content-update', handleContentUpdate as EventListener);
    };
  }, []);

  return (
    <section className="relative pt-20 xs:pt-24 md:pt-32 lg:pt-44 pb-12 xs:pb-16 md:pb-20 lg:pb-32 bg-gradient-to-br from-prisma-purple via-prisma-purple to-[#4B2D6D] overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-48 md:w-64 h-48 md:h-64 bg-prisma-chartreuse rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-10 w-32 md:w-40 h-32 md:h-40 bg-prisma-chartreuse rounded-full filter blur-3xl opacity-10"></div>
      
      <div className="container relative z-10">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl">
          <h1 className="text-white heading-xl mb-4 sm:mb-6 animate-fade-in">
            {heroData.title.includes("expertise") ? (
              <>
                {heroData.title.split("expertise")[0]}
                <span className="text-prisma-chartreuse">expertise</span>
                {heroData.title.split("expertise")[1]}
              </>
            ) : (
              heroData.title
            )}
          </h1>
          <p className="text-prisma-white/80 text-sm xs:text-base sm:text-lg md:text-xl mb-6 sm:mb-8 measure animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {heroData.description}
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <a href={heroData.buttonLink} className="btn-secondary w-full sm:w-auto text-center">
              {heroData.buttonText}
            </a>
            <button
              type="button"
              className="bg-transparent border border-white text-white hover:bg-white hover:text-prisma-purple px-5 py-3 rounded-md font-medium transition-all duration-300 w-full sm:w-auto text-center"
              onClick={() => setAppointmentOpen(true)}
            >
              {heroData.secondaryButtonText}
            </button>
            <AppointmentDialog open={appointmentOpen} onOpenChange={setAppointmentOpen} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[60px] text-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,130.83,141.14,213.2,56.44Z" className="fill-white"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
