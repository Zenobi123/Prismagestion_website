
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
    <section className="relative fond-banniere overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-44 lg:pb-32">
      <div className="container relative z-10">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl">
          {/*
            Le surtitre situe le cabinet avant que le titre n'annonce la
            promesse. Sur un écran de 375px, où le titre occupe trois lignes,
            il donne au lecteur le « qui » sans lui faire lire le « quoi ».
          */}
          <p className="surtitre text-prisma-chartreuse mb-4 animate-fade-in">
            Cabinet d'expertise · Yaoundé
          </p>
          <h1 className="text-white heading-xl mb-5 sm:mb-6 animate-fade-in">
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
          {/*
            Le chapeau démarre à 16px. Il descendait auparavant à 14px sous
            375px (`text-sm`) : c'est la taille d'une mention légale, pas celle
            du seul paragraphe que la plupart des visiteurs liront.
          */}
          <p className="text-prisma-white/80 text-base sm:text-lg md:text-xl leading-relaxed mb-7 sm:mb-8 measure animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {heroData.description}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <a href={heroData.buttonLink} className="btn-secondary w-full sm:w-auto">
              {heroData.buttonText}
            </a>
            <button
              type="button"
              className="inline-flex items-center justify-center w-full sm:w-auto min-h-[2.75rem] px-5 py-3 rounded-lg font-medium text-white border border-white/40 bg-white/5 backdrop-blur-[2px] transition-colors duration-200 hover:bg-white hover:text-prisma-purple hover:border-white active:translate-y-px"
              style={{ touchAction: 'manipulation' }}
              onClick={() => setAppointmentOpen(true)}
            >
              {heroData.secondaryButtonText}
            </button>
            <AppointmentDialog open={appointmentOpen} onOpenChange={setAppointmentOpen} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
