import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@gestion/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@gestion/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestion/components/ui/select";
import { Checkbox } from "@gestion/components/ui/checkbox";
import { Badge } from "@gestion/components/ui/badge";
import { useToast } from "@gestion/components/ui/use-toast";
import { CalendarClock, Loader2 } from "lucide-react";
import { getCollaborateurs } from "@gestion/services/collaborateurService";
import { chargerPlanification, creerTaches } from "@gestion/services/generationTachesService";
import type { FenetreEcheance, TachePlanifiee } from "@gestion/lib/spec/generationTaches";

const LIBELLES_FENETRE: Record<FenetreEcheance, { titre: string; aide: string }> = {
  a_faire: {
    titre: "À traiter",
    aide: "Échéance dans les 30 jours, ou aujourd'hui.",
  },
  a_venir: {
    titre: "Plus tard dans l'année",
    aide: "Encore au-delà de 30 jours. À générer si vous voulez planifier à l'avance.",
  },
  echue: {
    titre: "Déjà passées",
    aide: "La date légale est dépassée. À générer seulement pour rattraper un retard.",
  },
};

const ORDRE: FenetreEcheance[] = ["a_faire", "a_venir", "echue"];

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

export default function GenerationTachesDialog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const anneeCourante = new Date().getFullYear();
  const [annee, setAnnee] = useState(String(anneeCourante));
  const [collaborateurId, setCollaborateurId] = useState<string>("");
  const [retenues, setRetenues] = useState<Set<FenetreEcheance>>(new Set(["a_faire"]));
  const [enCours, setEnCours] = useState(false);

  const { data: collaborateurs = [] } = useQuery({
    queryKey: ["collaborateurs"],
    queryFn: getCollaborateurs,
    enabled: isOpen,
  });

  const { data: planifiees = [], isLoading, refetch } = useQuery({
    queryKey: ["planification-taches", annee],
    queryFn: () => chargerPlanification({ annee: Number(annee) }),
    enabled: isOpen,
  });

  const parFenetre = useMemo(() => {
    const groupes: Record<FenetreEcheance, TachePlanifiee[]> = {
      a_faire: [],
      a_venir: [],
      echue: [],
    };
    for (const t of planifiees) groupes[t.fenetre].push(t);
    return groupes;
  }, [planifiees]);

  const selection = useMemo(
    () => planifiees.filter((t) => retenues.has(t.fenetre)),
    [planifiees, retenues],
  );

  // Un seul collaborateur en base dans l'usage courant : le présélectionner
  // évite une manipulation sans objet.
  const collaborateurRetenu =
    collaborateurId || (collaborateurs.length === 1 ? collaborateurs[0].id : "");

  const basculer = (fenetre: FenetreEcheance) => {
    setRetenues((prec) => {
      const suivant = new Set(prec);
      if (suivant.has(fenetre)) suivant.delete(fenetre);
      else suivant.add(fenetre);
      return suivant;
    });
  };

  const generer = async () => {
    if (!collaborateurRetenu) {
      toast({
        title: "Collaborateur requis",
        description: "Chaque tâche doit être affectée à quelqu'un.",
        variant: "destructive",
      });
      return;
    }

    setEnCours(true);
    try {
      const creees = await creerTaches(selection, collaborateurRetenu);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["planification-taches"] });
      await refetch();

      toast({
        title: creees > 0 ? `${creees} tâche${creees > 1 ? "s" : ""} créée${creees > 1 ? "s" : ""}` : "Rien à créer",
        description:
          creees > 0
            ? "Elles apparaissent dans le planning et le tableau de bord."
            : "Ces échéances avaient déjà été générées.",
      });

      if (creees > 0) setIsOpen(false);
    } catch {
      toast({
        title: "Erreur",
        description: "La génération a échoué. Aucune tâche n'a été créée.",
        variant: "destructive",
      });
    } finally {
      setEnCours(false);
    }
  };

  const annees = [anneeCourante - 1, anneeCourante, anneeCourante + 1];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cible-tactile">
          <CalendarClock className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Échéances fiscales</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Générer les tâches d'échéances fiscales
          </DialogTitle>
          <DialogDescription>
            Chaque client actif est confronté au calendrier fiscal — IGS et précompte sur
            loyer trimestriels, Patente, DSF, DARP, DBEF — selon son régime et son mode de
            paiement. Les échéances déjà générées ne sont jamais reproposées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="space-y-1 sm:w-40">
              <label className="text-sm font-medium">Exercice</label>
              <Select value={annee} onValueChange={setAnnee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {annees.map((a) => (
                    <SelectItem key={a} value={String(a)}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 flex-1">
              <label className="text-sm font-medium">Affecter à</label>
              <Select value={collaborateurRetenu} onValueChange={setCollaborateurId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un collaborateur" />
                </SelectTrigger>
                <SelectContent>
                  {collaborateurs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.prenom} {c.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Analyse du calendrier…
            </div>
          )}

          {!isLoading && planifiees.length === 0 && (
            <p className="text-sm text-muted-foreground py-6">
              Aucune échéance à générer pour {annee} : toutes ont déjà leur tâche, ou aucun
              client actif n'est assujetti cette année-là.
            </p>
          )}

          {!isLoading && planifiees.length > 0 && (
            <div className="space-y-3">
              {ORDRE.map((fenetre) => {
                const groupe = parFenetre[fenetre];
                if (groupe.length === 0) return null;

                return (
                  <div key={fenetre} className="border rounded-md p-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        checked={retenues.has(fenetre)}
                        onCheckedChange={() => basculer(fenetre)}
                        className="mt-1"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">
                            {LIBELLES_FENETRE[fenetre].titre}
                          </span>
                          <Badge variant="secondary">{groupe.length}</Badge>
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {LIBELLES_FENETRE[fenetre].aide}
                        </span>
                      </span>
                    </label>

                    {retenues.has(fenetre) && (
                      <ul className="mt-3 space-y-1 text-xs border-t pt-2 max-h-48 overflow-y-auto">
                        {groupe.map((t) => (
                          <li key={`${t.clientId}-${t.reference}`} className="flex flex-wrap gap-x-2">
                            <span className="font-medium">{t.clientNom}</span>
                            <span className="text-muted-foreground">{t.titre}</span>
                            <span className="text-muted-foreground">— {formatDate(t.echeance)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {selection.length} tâche{selection.length > 1 ? "s" : ""} sera
              {selection.length > 1 ? "ont" : ""} créée{selection.length > 1 ? "s" : ""}
            </span>
            <Button onClick={generer} disabled={enCours || selection.length === 0}>
              {enCours && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Générer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
