
import { useState, useEffect } from "react";
import ContactInfo from "./contact/ContactInfo";
import ContactForm from "./contact/ContactForm";
import { getContactConfig } from "@/utils/contact/config";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT } from "@/config/social";

// Repli utilisé tant que la table `contact_config` est vide — ce qui est le cas
// aujourd'hui : ces valeurs sont donc bien celles affichées en production.
// Elles viennent de `@/config/social` pour ne plus diverger.
const defaultData = {
  title: "Contactez-nous",
  description: "Prenez contact avec notre équipe pour discuter de vos besoins et objectifs.",
  address: CONTACT.addressLine,
  email: CONTACT.email,
  phone: CONTACT.phone,
  phoneSecondary: CONTACT.phoneSecondary,
  phoneTertiary: CONTACT.phoneTertiary,
  whatsapp: CONTACT.whatsapp,
  formTitle: "Envoyez-nous un message",
  formDescription: "Utilisez ce formulaire pour nous envoyer directement votre demande."
};

const ContactSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [contactData, setContactData] = useState(defaultData);

  const loadContactData = async () => {
    setIsLoading(true);
    try {
      console.log("ContactSection: Chargement des données de contact");
      const content = await getContactConfig();
      console.log("ContactSection: Données reçues", content);
      
      if (content) {
        setContactData({
          ...defaultData,
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
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContactData();

    // Configurer les écouteurs d'événements pour les mises à jour en temps réel de Supabase
    const channel = supabase
      .channel('contact-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_config'
        },
        (payload) => {
          console.log('ContactSection: Changement détecté dans Supabase:', payload);
          loadContactData();
        }
      )
      .subscribe();
    
    // Écouter l'événement personnalisé de mise à jour du contenu
    const handleContentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("ContactSection: Événement de mise à jour du contenu détecté", customEvent.detail);
      loadContactData();
    };
    
    window.addEventListener('home-content-update', handleContentUpdate);
    
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('home-content-update', handleContentUpdate);
    };
  }, []);

  return (
    <section id="contact" className="section py-12 xs:py-16 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
        <ContactInfo contactData={contactData} />
        <ContactForm formTitle={contactData.formTitle} formDescription={contactData.formDescription} />
      </div>
    </section>
  );
};

export default ContactSection;

