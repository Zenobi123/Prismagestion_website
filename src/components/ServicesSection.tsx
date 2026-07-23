
import { useServices } from '@/hooks/useServices';
import { ServiceTabs } from '@/components/services/ServiceTabs';
import { ServiceTabContent } from '@/components/services/ServiceTabContent';
import { LoadingState } from '@/components/services/LoadingState';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const ServicesSection = () => {
  const { services, activeTab, setActiveTab, loading, error, refreshServices } = useServices();

  // Find the active service
  const activeService = services.find(service => service.id === activeTab);

  return (
    <section id="services" className="section py-12 xs:py-16 md:py-24 bg-prisma-light-gray">
      <div className="container mx-auto px-0 xs:px-2 sm:px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 xs:mb-12 md:mb-16">
          <h2 className="heading-lg mb-4 text-prisma-purple">
            Nos domaines d'<span className="text-gradient">expertise</span>
          </h2>
          <p className="text-gray-600">
            Découvrez notre gamme complète de services destinés à répondre aux besoins
            spécifiques de votre entreprise, quelle que soit sa taille ou son secteur d'activité.
          </p>
          
        </div>

        {loading ? (
          <LoadingState />
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            <ServiceTabs 
              services={services}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            {activeService && (
              <ServiceTabContent service={activeService} />
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Aucun service disponible</h3>
            <p className="text-gray-500 mb-4">
              Les services sont en cours de configuration. Veuillez revenir plus tard.
            </p>
            <Button onClick={refreshServices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
