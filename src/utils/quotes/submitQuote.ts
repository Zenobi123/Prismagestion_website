import { supabase } from '@/integrations/supabase/client';
import { QuoteRequest } from './types';
import { sendQuoteEmail } from '@/utils/email/sendEmail';

// Soumettre une nouvelle demande de devis
export const submitQuote = async (formData: {
  full_name: string;
  email: string;
  phone: string;
  details: string;
  service: string | null;
}): Promise<{ id?: string; error?: any }> => {
  try {
    // Identifiant généré côté client : avec la RLS, un visiteur anonyme
    // peut insérer une demande mais pas la relire, donc pas de .select().
    const id = crypto.randomUUID();
    const { error } = await supabase
      .from('quote_requests')
      .insert({
        id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        details: formData.details,
        service: formData.service,
        read: false,
        status: 'new'
      });

    if (error) {
      console.error('Erreur lors de la soumission de la demande de devis:', error);
      return { error };
    }

    // Notification email non bloquante
    sendQuoteEmail(formData).catch((err) =>
      console.warn('Notification email non envoyée:', err)
    );

    return { id };
  } catch (error) {
    console.error('Erreur lors de la soumission de la demande de devis:', error);
    return { error };
  }
};

// Alias the function for backward compatibility
export const submitQuoteRequest = submitQuote;
