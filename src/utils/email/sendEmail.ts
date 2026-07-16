// Le site fonctionne désormais sans backend : il n'y a plus de fonction
// serveur pour envoyer des emails de notification. Les demandes (contact,
// devis, rendez-vous) sont enregistrées localement et consultables dans
// l'espace admin. Ces fonctions sont conservées pour compatibilité et se
// contentent de journaliser l'action.

function logEmailSkipped(type: string, data: object): void {
  console.info(
    `[email désactivé] Notification "${type}" non envoyée (aucun backend). Données:`,
    data
  );
}

export async function sendContactEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
}): Promise<void> {
  logEmailSkipped('contact', data);
}

export async function sendQuoteEmail(data: {
  full_name: string;
  email: string;
  phone: string;
  service: string | null;
  details: string;
}): Promise<void> {
  logEmailSkipped('quote', data);
}

export async function sendAppointmentEmail(data: {
  fullName: string;
  phone: string;
  subject: string;
  date: string;
  time: string;
  message: string;
}): Promise<void> {
  logEmailSkipped('appointment', data);
}
