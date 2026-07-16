
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentFormData, AppointmentStatus } from './types';
import { sendAppointmentEmail } from '@/utils/email/sendEmail';

export const saveAppointment = async (formData: AppointmentFormData): Promise<Appointment> => {
  try {
    // Identifiant généré côté client : avec la RLS, un visiteur anonyme
    // peut insérer un rendez-vous mais pas le relire, donc pas de .select().
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const appointmentData = {
      id,
      full_name: formData.fullName,
      phone: formData.phone,
      subject: formData.subject,
      appointment_date: formData.date,
      appointment_time: formData.time,
      message: formData.message,
      status: "pending" as AppointmentStatus,
    };

    const { error } = await supabase
      .from('appointments')
      .insert(appointmentData);

    if (error) {
      console.error('Erreur lors de la sauvegarde du rendez-vous dans Supabase:', error);
      throw new Error(error.message);
    }

    console.log('Rendez-vous sauvegardé avec succès');

    // Notification email non bloquante
    sendAppointmentEmail(formData).catch((err) =>
      console.warn('Notification email non envoyée:', err)
    );

    return {
      id,
      fullName: formData.fullName,
      phone: formData.phone,
      subject: formData.subject,
      date: formData.date,
      time: formData.time,
      message: formData.message,
      createdAt,
      status: 'pending',
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du rendez-vous:', error);
    throw new Error('Impossible de sauvegarder le rendez-vous');
  }
};

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des rendez-vous depuis Supabase:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('Aucun rendez-vous trouvé dans Supabase');
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      fullName: item.full_name,
      phone: item.phone,
      subject: item.subject,
      date: item.appointment_date,
      time: item.appointment_time,
      message: item.message,
      createdAt: item.created_at,
      status: item.status as AppointmentStatus,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus): Promise<void> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);
    
    if (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous dans Supabase:', error);
      throw new Error(error.message);
    }
    
    console.log('Statut du rendez-vous mis à jour dans Supabase:', appointmentId, status);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    
    if (error) {
      console.error('Erreur lors de la suppression du rendez-vous dans Supabase:', error);
      throw new Error(error.message);
    }
    
    console.log('Rendez-vous supprimé dans Supabase:', appointmentId);
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    throw error;
  }
};

