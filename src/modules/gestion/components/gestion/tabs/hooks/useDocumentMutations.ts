import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@gestion/integrations/supabase/client";
import { useToast } from "@gestion/components/ui/use-toast";
import { nomFichierTelechargement } from "@gestion/lib/spec/documentsClient";

const BUCKET = "documents";

export interface DocumentAdministratif {
  id: string;
  client_id: string;
  nom: string;
  type: string;
  statut: string;
  /**
   * Chemin de l'objet dans le bucket privé `documents`, jamais une URL.
   * Une URL signée expire au bout d'une heure : la persister rendait le
   * document définitivement inaccessible. Voir `getDocumentUrl()`.
   */
  fichier_path?: string;
  date_creation: string;
  date_expiration?: string;
}

/**
 * Produit une URL signée à la demande pour un document stocké.
 * Même modèle que `getFiscalAttachmentUrl()` de `fiscalAttachmentService` :
 * la base garde le chemin, l'URL ne vit que le temps de l'usage.
 */
export async function getDocumentUrl(
  path: string,
  options?: { download?: boolean; expiresIn?: number },
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, options?.expiresIn ?? 60, { download: options?.download });

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Télécharge le document sur l'appareil sous un nom lisible.
 *
 * Ouvrir l'URL signée (`window.open`) se contente d'afficher le fichier, et
 * l'enregistrer depuis le navigateur le nomme d'après l'UUID de stockage. Le
 * détour par un blob est ce qui permet d'imposer « Attestation de conformité
 * fiscale.pdf ».
 */
export async function telechargerDocument(nomDocument: string, chemin: string): Promise<void> {
  const url = await getDocumentUrl(chemin, { download: true });
  if (!url) throw new Error("Téléchargement impossible");

  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error("Téléchargement impossible");

  const blob = await reponse.blob();
  const objectUrl = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = objectUrl;
  lien.download = nomFichierTelechargement(nomDocument, chemin);
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(objectUrl);
}

export function useDocumentMutations(clientId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents_administratifs")
        .select("*")
        .eq("client_id", clientId);

      if (error) {
        throw error;
      }
      return data as DocumentAdministratif[];
    },
  });

  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  /** Téléverse le fichier et renvoie son **chemin** dans le bucket. */
  const uploadFile = async (file: File): Promise<string> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Type de fichier non autorisé. Utilisez PDF, Word ou images.");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("La taille du fichier dépasse la limite de 10 MB.");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${clientId}/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    return filePath;
  };

  const saveDocument = useMutation({
    mutationFn: async ({ nom, type, statut, file, date_expiration }: { nom: string, type: string, statut: string, file?: File, date_expiration?: string | null }) => {
      let fichier_path: string | null = null;
      if (file) {
        fichier_path = await uploadFile(file);
      }

      const { data, error } = await supabase
        .from("documents_administratifs")
        .insert([{
          client_id: clientId,
          nom,
          type,
          statut,
          fichier_path,
          ...(date_expiration !== undefined ? { date_expiration } : {}),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
      toast({
        title: "Document ajouté",
        description: "Le document a été enregistré avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer le document.",
        variant: "destructive",
      });
    },
  });

  const updateDocumentStatus = useMutation({
    mutationFn: async ({ id, statut }: { id: string, statut: string }) => {
      const { data, error } = await supabase
        .from("documents_administratifs")
        .update({ statut })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut du document a été mis à jour.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    },
  });

  const updateDocumentFile = useMutation({
    mutationFn: async ({ id, file, date_expiration }: { id: string, file: File, date_expiration?: string | null }) => {
      // Le chemin remplacé est lu avant l'écriture : sans versionnage en base,
      // l'ancien objet ne serait plus atteignable depuis l'application — un
      // fichier client orphelin dans un bucket privé, pas un historique.
      const { data: existant } = await supabase
        .from("documents_administratifs")
        .select("fichier_path")
        .eq("id", id)
        .single();

      const fichier_path = await uploadFile(file);

      const { data, error } = await supabase
        .from("documents_administratifs")
        .update({
          fichier_path,
          ...(date_expiration !== undefined ? { date_expiration } : {}),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const ancienChemin = existant?.fichier_path;
      if (ancienChemin && ancienChemin !== fichier_path) {
        // Best-effort : le remplacement est déjà acquis, un objet resté en
        // place ne doit pas faire échouer l'opération aux yeux de l'utilisateur.
        await supabase.storage.from(BUCKET).remove([ancienChemin]);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
      toast({
        title: "Document mis à jour",
        description: "Le fichier a été enregistré avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le document.",
        variant: "destructive",
      });
    },
  });

  return { documents, isLoading, saveDocument, updateDocumentStatus, updateDocumentFile };
}
