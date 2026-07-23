import { useMemo, useState } from 'react';
import {
  Users, Download, RefreshCw, Search, Trash2, MailOpen, Mail, Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useSubscribers, type SubscriberRow } from '@/hooks/admin/useSubscribers';

// Libellés lisibles pour les origines de capture connues.
const SOURCE_LABELS: Record<string, string> = {
  'calculateur-igs': 'Calculateur IGS',
  'guide-creation': 'Guide création',
  footer: 'Pied de page',
  site: 'Site',
};
const sourceLabel = (s: string) => SOURCE_LABELS[s] ?? s;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toCsv = (rows: SubscriberRow[]) => {
  const header = ['Email', 'Source', 'Contexte', 'Consentement', 'Lu', 'Date'];
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.email,
      sourceLabel(r.source),
      r.context ?? '',
      r.consent ? 'oui' : 'non',
      r.read ? 'oui' : 'non',
      formatDate(r.created_at),
    ].map(esc).join(','),
  );
  return [header.map(esc).join(','), ...lines].join('\r\n');
};

const SubscribersPanel = () => {
  const { subscribers, stats, isLoading, isError, refetch, markRead, remove } = useSubscribers();
  const { toast } = useToast();
  const [term, setTerm] = useState('');
  const [source, setSource] = useState('all');

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return subscribers.filter((s) => {
      const matchSource = source === 'all' || s.source === source;
      const matchTerm =
        !t ||
        s.email.toLowerCase().includes(t) ||
        (s.context ?? '').toLowerCase().includes(t);
      return matchSource && matchTerm;
    });
  }, [subscribers, term, source]);

  const handleExport = () => {
    if (filtered.length === 0) {
      toast({ title: 'Rien à exporter', description: 'Aucun abonné dans la sélection.' });
      return;
    }
    const blob = new Blob(['﻿' + toCsv(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abonnes-prisma-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export CSV', description: `${filtered.length} abonné(s) exporté(s).` });
  };

  const handleMarkRead = async (s: SubscriberRow) => {
    try {
      await markRead(s.id, !s.read);
    } catch {
      toast({ title: 'Erreur', description: 'Mise à jour impossible.', variant: 'destructive' });
    }
  };

  const handleRemove = async (s: SubscriberRow) => {
    try {
      await remove(s.id);
      toast({ title: 'Supprimé', description: `${s.email} a été retiré.` });
    } catch {
      toast({ title: 'Erreur', description: 'Suppression impossible.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Abonnés &amp; Leads</h1>
          <p className="text-gray-600">Emails captés sur le site (calculateurs, outils, pied de page)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="purple" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total abonnés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats.total.toLocaleString('fr-FR')}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non lus</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-prisma-purple">{stats.unread}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Origine principale</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-lg font-semibold">
                {stats.sources[0] ? `${sourceLabel(stats.sources[0][0])} (${stats.sources[0][1]})` : '—'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Rechercher un email ou un contexte…"
            className="pl-9"
          />
        </div>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Toutes les origines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les origines</SelectItem>
            {stats.sources.map(([src, count]) => (
              <SelectItem key={src} value={src}>
                {sourceLabel(src)} ({count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste */}
      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-8 text-center text-gray-500">
              Impossible de charger les abonnés.{' '}
              <Button variant="link" onClick={() => refetch()}>Réessayer</Button>
            </div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Inbox className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-700">Aucun abonné pour l'instant</p>
              <p className="text-sm text-gray-500">
                Les emails captés sur les calculateurs et les outils apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Origine</TableHead>
                    <TableHead className="hidden md:table-cell">Contexte</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id} className={s.read ? '' : 'font-medium bg-prisma-purple/5'}>
                      <TableCell className="max-w-[220px] truncate">
                        <a href={`mailto:${s.email}`} className="text-prisma-purple hover:underline">
                          {s.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sourceLabel(s.source)}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[260px] truncate text-gray-600">
                        {s.context || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-600">
                        {formatDate(s.created_at)}
                      </TableCell>
                      <TableCell>
                        {s.read ? (
                          <span className="text-xs text-gray-500">Lu</span>
                        ) : (
                          <Badge className="bg-prisma-purple hover:bg-prisma-purple">Nouveau</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={s.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                          onClick={() => handleMarkRead(s)}
                        >
                          {s.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Supprimer" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cet abonné ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {s.email} sera définitivement retiré de la liste. Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemove(s)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscribersPanel;
