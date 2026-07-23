import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, FileText, MailOpen, MessageSquare } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';

/**
 * Indicateurs réels du site, calculés depuis Supabase (messages de contact,
 * demandes de devis, rendez-vous, articles) — plus aucune donnée fictive.
 * La variation « ce mois » provient du volume mensuel réel des 6 derniers mois.
 */
export const AnalyticsMetrics = () => {
  const { stats, monthlyActivity, isLoading } = useDashboard();

  const current = monthlyActivity[monthlyActivity.length - 1];
  const thisMonth = {
    contacts: current?.contacts ?? 0,
    devis: current?.devis ?? 0,
    rendezVous: current?.rendezVous ?? 0,
  };

  const cards = [
    {
      title: 'Messages de contact',
      value: stats.contacts.total,
      sub: `${stats.contacts.unread} non lu${stats.contacts.unread > 1 ? 's' : ''}`,
      month: thisMonth.contacts,
      Icon: MessageSquare,
    },
    {
      title: 'Demandes de devis',
      value: stats.quotes.total,
      sub: `${stats.quotes.unread} non traité${stats.quotes.unread > 1 ? 's' : ''}`,
      month: thisMonth.devis,
      Icon: MailOpen,
    },
    {
      title: 'Rendez-vous',
      value: stats.appointments.total,
      sub: `${stats.appointments.pending} en attente`,
      month: thisMonth.rendezVous,
      Icon: CalendarClock,
    },
    {
      title: 'Articles publiés',
      value: stats.articles.published,
      sub: `${stats.articles.drafts} brouillon${stats.articles.drafts > 1 ? 's' : ''}`,
      month: null as number | null,
      Icon: FileText,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(({ title, value, sub, month, Icon }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{value.toLocaleString('fr-FR')}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {month !== null && <span className="text-green-600">+{month} ce mois</span>}
              {month !== null ? ' · ' : ''}
              {sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
