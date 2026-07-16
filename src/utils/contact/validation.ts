
import type { ContactFormData } from "./types";

// Constante pour la clé localStorage (utilisée pour la rétrocompatibilité)
export const CONTACT_MESSAGES_KEY = 'contactMessages';

// Bornes alignées sur les contraintes de la base (migration
// website_harden_input_constraints) et la validation de la fonction edge.
export const CONTACT_FIELD_LIMITS = {
  firstName: 200,
  lastName: 200,
  email: 320,
  whatsapp: 50,
  subject: 200,
  message: 5000,
} as const;

export const validateContactForm = (formData: ContactFormData): {
  isValid: boolean, 
  errorMessage?: string,
  errors?: Partial<Record<keyof ContactFormData, string>>
} => {
  const errors: Partial<Record<keyof ContactFormData, string>> = {};
  
  // Validation champ par champ
  if (!formData.firstName) {
    errors.firstName = "Le prénom est requis";
  } else if (formData.firstName.length > CONTACT_FIELD_LIMITS.firstName) {
    errors.firstName = `Le prénom ne peut pas dépasser ${CONTACT_FIELD_LIMITS.firstName} caractères`;
  }

  if (!formData.lastName) {
    errors.lastName = "Le nom est requis";
  } else if (formData.lastName.length > CONTACT_FIELD_LIMITS.lastName) {
    errors.lastName = `Le nom ne peut pas dépasser ${CONTACT_FIELD_LIMITS.lastName} caractères`;
  }

  if (!formData.email) {
    errors.email = "L'email est requis";
  } else {
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Veuillez entrer une adresse email valide";
    } else if (formData.email.length > CONTACT_FIELD_LIMITS.email) {
      errors.email = "L'adresse email est trop longue";
    }
  }
  
  if (!formData.whatsapp) {
    errors.whatsapp = "Le numéro WhatsApp est requis";
  } else {
    // Validation basique de numéro WhatsApp
    const cleanedNumber = formData.whatsapp.replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?\d{9,15}$/;
    if (!phoneRegex.test(cleanedNumber)) {
      errors.whatsapp = "Veuillez entrer un numéro WhatsApp valide (minimum 9 chiffres)";
    }
  }
  
  if (!formData.message) {
    errors.message = "Le message est requis";
  } else if (formData.message.length > CONTACT_FIELD_LIMITS.message) {
    errors.message = `Le message ne peut pas dépasser ${CONTACT_FIELD_LIMITS.message} caractères`;
  }
  
  // Vérifier s'il y a des erreurs
  const hasErrors = Object.keys(errors).length > 0;
  
  if (hasErrors) {
    return {
      isValid: false,
      errorMessage: "Veuillez remplir tous les champs obligatoires correctement.",
      errors
    };
  }

  return { isValid: true };
};

