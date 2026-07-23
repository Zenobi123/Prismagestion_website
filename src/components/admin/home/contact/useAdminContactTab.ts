
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getContactConfig, upsertContactConfig } from "@/utils/contact/config";
import { supabase } from "@/integrations/supabase/client";

const defaultContact = {
  title: "Contactez-nous",
  description: "Prenez contact avec notre équipe pour discuter de vos besoins et objectifs.",
  address: "Yaoundé, Cameroun",
  email: "obiangtimenathan@gmail.com",
  phone: "+237 694 310 554",
  whatsapp: "+237 671 050 546",
  formTitle: "Envoyez-nous un message",
  formDescription: "Utilisez ce formulaire pour nous envoyer directement votre demande."
};

export function useAdminContactTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [contactData, setContactData] = useState(defaultContact);
  const { toast } = useToast();

  const loadContactData = async () => {
    setIsLoading(true);
    try {
      console.log("AdminContactTab: Tentative de chargement des données de contact");
      const content = await getContactConfig();
      console.log("AdminContactTab: Données reçues", content);
      
      if (content) {
        setContactData({
          ...defaultContact,
          ...{
            title: content.title,
            description: content.description,
            address: content.address,
            email: content.email,
            phone: content.phone,
            whatsapp: content.whatsapp,
            formTitle: content.form_title,
            formDescription: content.form_description,
          },
        });
      } else {
        setContactData(defaultContact);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de contact:", error);
      setContactData(defaultContact);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la section contact",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContactData();
    
    // Écouter les changements en temps réel pour les mises à jour de la configuration de contact
    const channel = supabase
      .channel('admin-contact-config-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_config'
        },
        (payload) => {
          console.log('AdminContactTab: Changement détecté dans Supabase:', payload);
          loadContactData();
        }
      )
      .subscribe();
    
    // Écouter l'événement personnalisé
    const handleContentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("AdminContactTab: Événement personnalisé détecté", customEvent.detail);
      if (customEvent.detail?.section === 'contact') {
        loadContactData();
      }
    };
    
    window.addEventListener('home-content-update', handleContentUpdate);
    
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('home-content-update', handleContentUpdate);
    };
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // S'assurer que title est toujours présent (utiliser une valeur par défaut si absent)
      const title = contactData.title || defaultContact.title;
      
      console.log("Saving contact data:", {
        title,
        description: contactData.description,
        address: contactData.address,
        email: contactData.email,
        phone: contactData.phone,
        whatsapp: contactData.whatsapp,
        form_title: contactData.formTitle,
        form_description: contactData.formDescription,
      });
      
      await upsertContactConfig({
        title: title,
        description: contactData.description,
        address: contactData.address,
        email: contactData.email,
        phone: contactData.phone,
        whatsapp: contactData.whatsapp,
        form_title: contactData.formTitle,
        form_description: contactData.formDescription,
      });
      
      toast({
        title: "Modifications enregistrées",
        description: "Les changements de la section 'Contact' ont été sauvegardés.",
      });
      
      // Déclencher un événement pour mettre à jour la page d'accueil
      window.dispatchEvent(new CustomEvent('home-content-update', {
        detail: { 
          section: 'contact',
          timestamp: new Date().getTime() 
        }
      }));
      
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des modifications:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading, contactData, handleChange, handleSave
  };
}

