import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';

/**
 * Répartition réelle des demandes entrantes (leads) par canal, calculée depuis
 * Supabase. Les taux de transformation « visiteur → lead » nécessitent le
 * nombre de visiteurs (Google Analytics / Plausible).
 */
const ConversionTabComponent = () => {
  const { stats } = useDashboard();

  const totalLeads =
    stats.contacts.total + stats.quotes.total + stats.appointments.total;
  const pct = (n: number) =>
    totalLeads === 0 ? 0 : Math.round((n / totalLeads) * 100);

  const rows = [
    { label: 'Messages de contact', value: stats.contacts.total, color: 'text-prisma-purple' },
    { label: 'Demandes de devis', value: stats.quotes.total, color: 'text-[#6f7d1f]' },
    { label: 'Rendez-vous', value: stats.appointments.total, color: 'text-amber-600' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes entrantes par canal</CardTitle>
        <CardDescription>
          {totalLeads} demande{totalLeads > 1 ? 's' : ''} au total — répartition réelle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.label} className="p-3 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>{r.label}</span>
                <span className={`font-bold ${r.color}`}>
                  {r.value.toLocaleString('fr-FR')} · {pct(r.value)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-prisma-purple"
                  style={{ width: `${pct(r.value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Le taux de transformation « visiteur → demande » sera calculé
            automatiquement dès la connexion de l'analytics de trafic
            (<code className="text-xs">VITE_GA_ID</code>).
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const ConversionTab = memo(ConversionTabComponent);
