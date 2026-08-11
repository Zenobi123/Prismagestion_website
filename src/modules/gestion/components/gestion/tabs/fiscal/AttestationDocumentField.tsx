import React, { useRef, useState } from "react";
import { Button } from "@gestion/components/ui/button";
import { Label } from "@gestion/components/ui/label";
import { Download, Eye, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  telechargerDocument,
  getDocumentUrl,
  useDocumentMutations,
} from "../hooks/useDocumentMutations";
import { nomFichierTelechargement } from "@gestion/lib/spec/documentsClient";

interface AttestationDocumentFieldProps {
  clientId: string;
  /**
   * Libellé du document, à prendre dans les constantes de
   * `@gestion/lib/spec/documentsClient` : c'est lui qui rapproche la pièce
   * téléversée ici de la ligne correspondante de la checklist de l'onglet
   * Dossier.
   */
  documentName: string;
  /** Fin de validité (AAAA-MM-JJ), enregistrée avec le document. */
  expirationDate?: string;
}

/**
 * Téléversement, consultation et téléchargement de la pièce scannée d'une
 * attestation, depuis l'onglet Fiscal.
 *
 * La pièce est écrite immédiatement en base, sans attendre le bouton
 * « Enregistrer » de l'onglet : un fichier téléversé puis abandonné faute
 * d'enregistrement resterait dans le bucket sans qu'aucun écran ne puisse le
 * retrouver.
 *
 * Le stockage est celui de l'onglet Dossier — table `documents_administratifs`
 * et bucket privé `documents` — et non `fiscal_attachments` : c'est le même
 * document, il ne doit exister qu'en un exemplaire.
 */
export function AttestationDocumentField({
  clientId,
  documentName,
  expirationDate,
}: AttestationDocumentFieldProps) {
  const { documents, isLoading, saveDocument, updateDocumentFile } =
    useDocumentMutations(clientId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [ouverture, setOuverture] = useState(false);
  const [telechargement, setTelechargement] = useState(false);

  const piece = documents.find((d) => d.nom === documentName);
  const chemin = piece?.fichier_path;
  const enCoursEnvoi = saveDocument.isPending || updateDocumentFile.isPending;

  // La date de validité n'est enregistrée que lorsqu'elle est connue : passer
  // `null` effacerait une échéance déjà saisie lors d'un simple remplacement.
  const dateExpiration = expirationDate || undefined;

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // L'input est vidé tout de suite : sans cela, re-sélectionner le même
    // fichier après un échec ne déclenche aucun événement `change`.
    e.target.value = "";
    if (!file) return;

    if (piece?.id) {
      updateDocumentFile.mutate({ id: piece.id, file, date_expiration: dateExpiration });
    } else {
      saveDocument.mutate({
        nom: documentName,
        type: "attestation",
        statut: "fourni",
        file,
        date_expiration: dateExpiration,
      });
    }
  };

  const handleView = async () => {
    if (!chemin) return;
    setOuverture(true);
    try {
      const url = await getDocumentUrl(chemin);
      if (!url) throw new Error("Consultation impossible");
      window.open(url, "_blank");
    } catch {
      toast.error("Impossible d'ouvrir le document");
    } finally {
      setOuverture(false);
    }
  };

  const handleDownload = async () => {
    if (!chemin) return;
    setTelechargement(true);
    try {
      await telechargerDocument(documentName, chemin);
    } catch {
      toast.error("Impossible de télécharger le document");
    } finally {
      setTelechargement(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Pièce scannée</Label>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
        onChange={handleFileSelected}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : chemin ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border bg-muted/40 p-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-sm">
              {nomFichierTelechargement(documentName, chemin)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleView}
              disabled={ouverture}
            >
              {ouverture ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-1 h-4 w-4" />
              )}
              Consulter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleDownload}
              disabled={telechargement}
            >
              {telechargement ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1 h-4 w-4" />
              )}
              Télécharger
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => inputRef.current?.click()}
              disabled={enCoursEnvoi}
            >
              {enCoursEnvoi ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-1 h-4 w-4" />
              )}
              Remplacer
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full sm:w-auto"
            onClick={() => inputRef.current?.click()}
            disabled={enCoursEnvoi}
          >
            {enCoursEnvoi ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1 h-4 w-4" />
            )}
            Ajouter la pièce
          </Button>
          <p className="text-xs text-muted-foreground">
            PDF, Word ou image — 10 Mo maximum.
          </p>
        </div>
      )}
    </div>
  );
}
