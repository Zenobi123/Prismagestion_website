
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceType } from '@/types/services';
import { services as defaultServiceList } from '@/components/contact/form/ServiceSelector';
import { getServiceImage } from '@/utils/serviceImages';
import { useToast } from "@/hooks/use-toast";

// Générer des services par défaut basés sur la liste complète des services
const defaultServices: ServiceType[] = defaultServiceList.map((service) => ({
  id: service.value,
  title: service.label,
  description: `Services professionnels de ${service.label.toLowerCase()} pour répondre aux besoins spécifiques de votre entreprise.`,
  items: [
    `Conseil en ${service.label.toLowerCase()}`,
    `Analyse et optimisation`,
    `Accompagnement personnalisé`,
    `Suivi et reporting`
  ],
  image: getServiceImage(service.value)
}));

export const useServices = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const { toast } = useToast();
  
  // Référence pour stocker les écouteurs
  const channelRef = useRef<any>(null);
  // Référence pour suivre le dernier temps de rafraîchissement
  const lastRefreshRef = useRef<number>(0);

  const fetchServices = async (forceRefresh = false) => {
    if (!isMounted.current) return;
    
    // Éviter les rafraîchissements trop fréquents (moins de 2 secondes d'intervalle)
    // sauf si forceRefresh est vrai
    const now = Date.now();
    if (!forceRefresh && lastRefreshRef.current > 0 && now - lastRefreshRef.current < 2000) {
      console.log('Skipping refresh - too soon since last refresh');
      return;
    }
    
    lastRefreshRef.current = now;
    setLoading(true);
    setError(null);
    
    try {
      console.log('Chargement des services depuis Supabase...', forceRefresh ? '(force refresh)' : '');
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (!isMounted.current) return;
      
      if (fetchError) {
        console.error('Erreur lors du chargement des services:', fetchError);
        setError(fetchError.message);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les services depuis le serveur. Services par défaut utilisés.",
          variant: "destructive",
        });
        setServices(defaultServices);
        if (!activeTab || !defaultServices.find(service => service.id === activeTab)) {
          setActiveTab(defaultServices[0].id);
        }
      } else if (data && data.length > 0) {
        console.log('Services chargés depuis Supabase:', data.length);
        console.log('Services data:', data);
        const dataWithImages = data.map(s => ({
          ...s,
          image: s.image && s.image !== '/placeholder.svg' ? s.image : getServiceImage(s.id)
        }));
        setServices(dataWithImages);
        // Ne changez l'onglet actif que s'il n'est pas défini ou s'il ne fait plus partie des services disponibles
        if (!activeTab || !dataWithImages.find(service => service.id === activeTab)) {
          setActiveTab(data[0].id);
        }
      } else {
        console.log('Aucun service trouvé dans Supabase, utilisation des services par défaut');
        setServices(defaultServices);
        // Ne changez l'onglet actif que s'il n'est pas défini ou s'il ne fait plus partie des services disponibles
        if (!activeTab || !defaultServices.find(service => service.id === activeTab)) {
          setActiveTab(defaultServices[0].id);
        }
      }
    } catch (err) {
      console.error('Exception lors du chargement des services:', err);
      if (!isMounted.current) return;
      
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur de chargement",
        description: "Une erreur s'est produite lors du chargement des services. Services par défaut utilisés.",
        variant: "destructive",
      });
      setServices(defaultServices);
      // Ne changez l'onglet actif que s'il n'est pas défini ou s'il ne fait plus partie des services disponibles
      if (!activeTab || !defaultServices.find(service => service.id === activeTab)) {
        setActiveTab(defaultServices[0].id);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Function to manually update the services with force refresh
  const refreshServices = () => {
    console.log('Actualisation manuelle des services (force refresh)');
    fetchServices(true);
    toast({
      title: "Actualisation",
      description: "Les services sont en cours d'actualisation...",
    });
  };

  useEffect(() => {
    isMounted.current = true;
    fetchServices();
    
    // Créer un seul canal Supabase et y stocker la référence
    channelRef.current = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        (payload) => {
          console.log('ServicesSection: Changement détecté dans Supabase', payload);
          if (isMounted.current) {
            fetchServices(true); // Force refresh on database changes
          }
        }
      )
      .subscribe((status) => {
        console.log('Statut de la souscription au canal:', status);
      });
    
    const handleContentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('ServicesSection: Événement de mise à jour du contenu détecté', customEvent);
      if (isMounted.current) {
        if (customEvent.detail?.forceRefresh) {
          console.log('Forçage du rafraichissement des services');
          // Utiliser un délai pour laisser le temps à Supabase de mettre à jour les données
          // et pour éviter les problèmes de rafraîchissement simultanés
          setTimeout(() => fetchServices(true), 500);
        } else {
          fetchServices();
        }
      }
    };
    
    window.addEventListener('home-content-update', handleContentUpdate);
    
    return () => {
      isMounted.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      window.removeEventListener('home-content-update', handleContentUpdate);
    };
  }, []);

  return {
    services,
    activeTab,
    setActiveTab,
    loading,
    error,
    refreshServices
  };
};
