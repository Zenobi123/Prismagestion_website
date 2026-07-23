import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';

/**
 * Activité réelle des 6 derniers mois (contacts, devis, rendez-vous), calculée
 * depuis Supabase. Le trafic par page (visiteurs, sessions) nécessite une
 * connexion à Google Analytics / Plausible — voir VITE_GA_ID.
 */
export const TrafficTab = () => {
  const { monthlyActivity, isLoading } = useDashboard();

  const max = Math.max(
    1,
    ...monthlyActivity.map((m) => m.contacts + m.devis + m.rendezVous),
  );

  const series = [
    { key: 'contacts', label: 'Contacts', color: 'bg-prisma-purple' },
    { key: 'devis', label: 'Devis', color: 'bg-[#8a9a2e]' },
    { key: 'rendezVous', label: 'Rendez-vous', color: 'bg-amber-500' },
  ] as const;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Activité entrante — 6 derniers mois</CardTitle>
          <CardDescription>Volume réel de demandes reçues par mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 text-sm">
            {series.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span className={`inline-block h-3 w-3 rounded-sm ${s.color}`} />
                <span className="text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">Chargement…</p>
          ) : (
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-56">
              {monthlyActivity.map((m) => {
                const total = m.contacts + m.devis + m.rendezVous;
                return (
                  <div key={m.name} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full max-w-[54px] flex flex-col-reverse rounded-md overflow-hidden bg-gray-100"
                      style={{ height: `${Math.max(6, (total / max) * 100)}%` }}
                      title={`${m.name} : ${total} demande${total > 1 ? 's' : ''}`}
                    >
                      {series.map((s) => {
                        const v = m[s.key];
                        if (!v) return null;
                        return (
                          <div
                            key={s.key}
                            className={s.color}
                            style={{ height: `${(v / total) * 100}%` }}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs text-gray-500">{m.name}</span>
                    <span className="text-xs font-medium tabular-nums">{total}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Le trafic détaillé par page (visiteurs, sessions, taux de rebond) sera
              disponible dès la connexion de Google Analytics / Plausible
              (<code className="text-xs">VITE_GA_ID</code>).
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
