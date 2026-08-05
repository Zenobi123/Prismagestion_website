
import { useState, useEffect } from 'react';
import FormInput from './form/FormInput';
import FormTextarea from './form/FormTextarea';
import ServiceSelector from './form/ServiceSelector';
import SubmitButton from '../SubmitButton';
import { useContactForm } from '@/hooks/useContactForm';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface ContactFormProps {
  formTitle?: string;
  formDescription?: string;
}

const ContactForm = ({ formTitle = "Envoyez-nous un message", formDescription = "Utilisez ce formulaire pour nous envoyer directement votre demande." }: ContactFormProps) => {
  const { 
    handleSubmit, 
    formData, 
    formErrors, 
    handleChange, 
    handleSelectChange,
    isSubmitting, 
    submitSuccess 
  } = useContactForm();
  
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Afficher le message de succès pendant quelques secondes
  useEffect(() => {
    if (submitSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  return (
    <div className="carte p-6 md:p-8">
      <h3 className="heading-md mb-2 md:mb-3 text-prisma-purple">{formTitle}</h3>
      <p className="text-gray-500 mb-6">{formDescription}</p>
      
      {showSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            id="firstName"
            label="Prénom"
            placeholder="Votre prénom"
            value={formData.firstName}
            onChange={handleChange}
            error={formErrors.firstName}
            required
          />
          <FormInput
            id="lastName"
            label="Nom"
            placeholder="Votre nom"
            value={formData.lastName}
            onChange={handleChange}
            error={formErrors.lastName}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
          />
          <FormInput
            id="whatsapp"
            label="WhatsApp"
            placeholder="+237 6XX XXX XXX"
            value={formData.whatsapp}
            onChange={handleChange}
            error={formErrors.whatsapp}
            required
          />
        </div>
        
        <ServiceSelector
          label="Service concerné"
          value={formData.subject}
          onValueChange={handleSelectChange}
          error={formErrors.subject}
          required
        />
        
        <FormTextarea
          id="message"
          label="Message"
          placeholder="Décrivez votre besoin en détail..."
          value={formData.message}
          onChange={handleChange}
          error={formErrors.message}
          rows={5}
          required
        />
        
        <div className="pt-2">
          <SubmitButton
            text="Envoyer le message"
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
          />
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
