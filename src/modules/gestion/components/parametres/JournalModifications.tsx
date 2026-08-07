import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@gestion/components/ui/card";
import { Badge } from "@gestion/components/ui/badge";
import { Button } from "@gestion/components/ui/button";
import { Input } from "@gestion/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestion/components/ui/select";
import { History, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import {
  getJournal,
  extraireChangements,
  TABLES_JOURNALISEES,
  LIBELLES_ACTION,
  type AuditAction,
  type EntreeJournal,
} from "@gestion/services/auditService";

const PAR_PAGE = 25;
const TOUTES = "__toutes__";

function variantAction(action: AuditAction): "success" | "secondary" | "destructive" {
  switch (action) {
    case "INSERT":
      return "success";
    case "UPDATE":
      return "secondary";
    case "DELETE":
      return "destructive";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailChangements({ entree }: { entree: EntreeJournal }) {
  const changements = extraireChangements(entree);

  if (changements.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun champ lisible à afficher.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="py-1 pr-3 font-medium">Champ</th>
            <th className="py-1 pr-3 font-medium">Avant</th>
            <th className="py-1 font-medium">Après</th>
          </tr>
        </thead>
        <tbody>
          {changements.map((c) => (
            <tr key={c.colonne} className="border-t align-top">
              <td className="py-1 pr-3 font-mono">{c.colonne}</td>
              <td className="py-1 pr-3 break-all text-muted-foreground">{c.avant}</td>
              <td className="py-1 break-all">{c.apres}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function JournalModifications() {
  const [table, setTable] = useState<string>(TOUTES);
  const [action, setAction] = useState<string>(TOUTES);
  const [depuis, setDepuis] = useState<string>("");
  const [page, setPage] = useState(0);
  const [ouverte, setOuverte] = useState<number | null>(null);

  const filtres = {
    table: table === TOUTES ? undefined : table,
    action: action === TOUTES ? undefined : (action as AuditAction),
    depuis: depuis || undefined,
    limite: PAR_PAGE,
    decalage: page * PAR_PAGE,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["journal-modifications", filtres],
    queryFn: () => getJournal(filtres),
  });

  const entrees = data?.entrees ?? [];
  const total = data?.total ?? 0;
  const dernierePage = Math.max(0, Math.ceil(total / PAR_PAGE) - 1);

  const reinitialiser = (maj: () => void) => {
    maj();
    setPage(0);
    setOuverte(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="w-4 h-4" /> Journal des modifications
        </CardTitle>
        <CardDescription>
          Toute création, modification ou suppression sur les données du cabinet y est
          consignée, avec le détail des champs touchés. Le journal est en lecture seule :
          il ne peut être ni corrigé ni effacé depuis l'application.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1 flex-1">
            <label className="text-sm font-medium">Donnée</label>
            <Select value={table} onValueChange={(v) => reinitialiser(() => setTable(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TOUTES}>Toutes</SelectItem>
                {Object.entries(TABLES_JOURNALISEES).map(([cle, libelle]) => (
                  <SelectItem key={cle} value={cle}>
                    {libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 sm:w-48">
            <label className="text-sm font-medium">Opération</label>
            <Select value={action} onValueChange={(v) => reinitialiser(() => setAction(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TOUTES}>Toutes</SelectItem>
                {(Object.keys(LIBELLES_ACTION) as AuditAction[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {LIBELLES_ACTION[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 sm:w-48">
            <label className="text-sm font-medium">Depuis le</label>
            <Input
              type="date"
              value={depuis}
              onChange={(e) => reinitialiser(() => setDepuis(e.target.value))}
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement du journal…
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive py-6">
            Le journal n'a pas pu être chargé.
          </p>
        )}

        {!isLoading && !isError && entrees.length === 0 && (
          <p className="text-sm text-muted-foreground py-6">
            Aucune écriture enregistrée pour ces critères. Le journal a été mis en service
            le 7 août 2026 : il ne contient rien d'antérieur.
          </p>
        )}

        {entrees.length > 0 && (
          <div className="space-y-2">
            {entrees.map((entree) => {
              const estOuverte = ouverte === entree.id;
              return (
                <div key={entree.id} className="border rounded-md">
                  <button
                    type="button"
                    onClick={() => setOuverte(estOuverte ? null : entree.id)}
                    className="w-full flex items-start gap-2 px-3 py-2 text-left cible-tactile"
                    aria-expanded={estOuverte}
                  >
                    {estOuverte ? (
                      <ChevronDown className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={variantAction(entree.action)}>
                          {LIBELLES_ACTION[entree.action]}
                        </Badge>
                        <span className="text-sm font-medium">
                          {TABLES_JOURNALISEES[entree.table_name] ?? entree.table_name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 break-all">
                        {formatDate(entree.fait_le)}
                        {entree.row_id ? ` — réf. ${entree.row_id}` : ""}
                        {" — "}
                        {entree.acteur_email ?? "hors session applicative"}
                      </p>
                    </div>
                  </button>

                  {estOuverte && (
                    <div className="border-t px-3 py-2 bg-muted/30">
                      <DetailChangements entree={entree} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {total > PAR_PAGE && (
          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-xs text-muted-foreground">
              {page * PAR_PAGE + 1}–{Math.min((page + 1) * PAR_PAGE, total)} sur {total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => {
                  setPage((p) => Math.max(0, p - 1));
                  setOuverte(null);
                }}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= dernierePage}
                onClick={() => {
                  setPage((p) => p + 1);
                  setOuverte(null);
                }}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
