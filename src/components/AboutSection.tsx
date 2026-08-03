
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSectionContent, AboutSectionContent } from '@/utils/siteSections';
import aboutImage from '@/assets/about-prisma-new.jpg';

const defaultData: AboutSectionContent = {
  title: "À propos de PRISMA GESTION",
  paragraph1: "Fondé à Yaoundé au Cameroun, PRISMA GESTION est un cabinet de conseil pluridisciplinaire offrant des services à haute valeur ajoutée aux entreprises et organisations de toutes tailles.",
  paragraph2: "Notre approche intégrée combinant expertise traditionnelle et solutions digitales innovantes nous permet de répondre efficacement aux défis complexes de nos clients.",
  advantages: [
    "Plus de 10 ans d'expérience",
    "Équipe pluridisciplinaire",
    "Approche personnalisée",
    "Expertise locale et internationale",
  ],
  buttonText: "Découvrir nos services",
  buttonLink: "#services",
  image: aboutImage
};

const AboutSection = () => {
  const [aboutData, setAboutData] = useState<AboutSectionContent>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    getSectionContent<AboutSectionContent>('about').then((content) => {
      if (content) {
        setAboutData(content);
      }
      setIsLoading(false);
    }).catch((error) => {
      console.error("Erreur lors du chargement de la section About:", error);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let mounted = true;
    loadData();
    
    // Listen for content updates
    const handleContentUpdate = () => {
      if (mounted) {
        console.log("About: Mise à jour du contenu détectée");
        loadData();
      }
    };
    
    window.addEventListener('home-content-update', handleContentUpdate);
    
    return () => { 
      mounted = false; 
      window.removeEventListener('home-content-update', handleContentUpdate);
    };
  }, []);

  return (
    <section id="about" className="section py-12 xs:py-16 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="order-2 md:order-1">
          <h2 className="heading-lg mb-4 md:mb-6 text-prisma-purple">
            {aboutData.title.includes("PRISMA GESTION") ? (
              <>
                {aboutData.title.split("PRISMA GESTION")[0]}
                <span className="text-highlight">PRISMA GESTION</span>
                {aboutData.title.split("PRISMA GESTION")[1]}
              </>
            ) : (
              aboutData.title
            )}
          </h2>
          
          <p className="text-gray-700 mb-4 md:mb-6 measure">
            {aboutData.paragraph1}
          </p>

          <p className="text-gray-700 mb-6 md:mb-8 measure">
            {aboutData.paragraph2}
          </p>
          
          <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
            {aboutData.advantages.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="text-prisma-chartreuse mr-2 h-5 md:h-6 w-5 md:w-6 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{item}</span>
              </li>
            ))}
          </ul>

          <a href={aboutData.buttonLink} className="btn-primary inline-block w-full sm:w-auto text-center">
            {aboutData.buttonText}
          </a>
        </div>

        <div className="order-1 md:order-2 relative">
          <div className="relative z-10 rounded-lg overflow-hidden shadow-xl h-64 sm:h-80 md:h-[400px] lg:h-full">
            <img
              src={aboutData.image} 
              alt="PRISMA GESTION Team"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback en cas d'erreur de chargement de l'image
                const target = e.target as HTMLImageElement;
                console.log("Erreur chargement image:", target.src);
                target.onerror = null;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
          <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-40 sm:w-64 h-40 sm:h-64 bg-prisma-chartreuse/20 rounded-lg -z-10"></div>
          <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-24 sm:w-32 h-24 sm:h-32 bg-prisma-purple/10 rounded-lg -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
