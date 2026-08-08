import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Date d'un paiement au format `JJ/MM/AAAA`.
 *
 * Les dates arrivent tantôt en `AAAA-MM-JJ` (colonne `date` de PostgREST),
 * tantôt en horodatage complet. Une chaîne illisible est rendue telle quelle
 * plutôt que remplacée par « Invalid Date ».
 */
export function formatDatePaiement(dateString: string): string {
  try {
    return format(
      typeof dateString === 'string' && dateString.includes('-')
        ? parseISO(dateString)
        : new Date(dateString),
      'dd/MM/yyyy',
      { locale: fr }
    );
  } catch {
    return dateString;
  }
}
