import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, MailOpen, CalendarClock, Info } from 'lucide-react';
import { useDashboard, type ActivityType } from '@/hooks/useDashboard';

const ICONS: Record<ActivityType, typeof FileText> = {
  blog: FileText,
  contact: MessageSquare,
  quote: MailOpen,
  appointment: CalendarClock,
};

/**
 * Flux d'activité réel du site (dernières demandes et publications), issu de
 * Supabase. Les métriques de navigation (temps sur site, pages/session, rebond)
 * nécessitent une connexion analytics — voir VITE_GA_ID.
 */
const BehaviorTabComponent = () => {
  const { recentActivities, isLoading } = useDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>Dernières interactions réelles des visiteurs</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : recentActivities.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune activité récente pour le moment.</p>
        ) : (
          <ul className="divide-y">
            {recentActivities.map((a) => {
              const Icon = ICONS[a.type];
              return (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 rounded-full bg-prisma-purple/10 p-1.5 text-prisma-purple">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">{a.message}</p>
                    <p className="text-xs text-gray-500">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Le comportement de navigation (temps sur site, pages/session, taux de
            rebond) sera disponible après connexion de l'analytics
            (<code className="text-xs">VITE_GA_ID</code>).
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const BehaviorTab = memo(BehaviorTabComponent);
