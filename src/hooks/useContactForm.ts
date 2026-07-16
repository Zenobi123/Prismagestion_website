
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  ContactFormData, 
} from "@/utils/contact/types";
import { 
  validateContactForm,
  CONTACT_MESSAGES_KEY
} from "@/utils/contact/validation";
import { 
  saveContactMessage,
  setupStorageListener,
  getContactMessages,
  markMessageAsRead,
  deleteContactMessage,
} from "@/utils/contact/supabase";
import {
  triggerContactMessagesUpdated
} from "@/utils/contact/events";

export const defaultFormData: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  whatsapp: "",
  subject: "comptabilite",
  message: ""
};

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Effacer l'erreur lorsque l'utilisateur corrige le champ
    if (formErrors[id as keyof ContactFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: value
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setFormErrors({});
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors || {});
      toast({
        title: "Formulaire incomplet",
        description: validation.errorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const savedMessage = await saveContactMessage(formData);

      // Réinitialiser le formulaire après succès
      resetForm();
      setSubmitSuccess(true);
      
      // Déclencher l'événement de mise à jour
      triggerContactMessagesUpdated([savedMessage]);
      
      toast({
        title: "Message envoyé",
        description: "Nous avons bien reçu votre message. Nous vous répondrons dans les plus brefs délais.",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    formErrors,
    isSubmitting,
    submitSuccess,
    handleChange,
    handleSelectChange,
    handleSubmit,
    resetForm
  };
}
