
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@gestion/components/ui/card";
import { Input } from "@gestion/components/ui/input";
import { Label } from "@gestion/components/ui/label";
import { Button } from "@gestion/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@gestion/components/ui/avatar";
import { useToast } from "@gestion/components/ui/use-toast";
import { supabase } from "@gestion/integrations/supabase/client";
import { Loader2 } from 'lucide-react';

// Ce composant affichait un profil fictif — « Jean Dupont », un numéro de
// téléphone français — et son bouton d'enregistrement se contentait d'un
// message de succès sans rien écrire. Il lit et écrit désormais la table
// `profiles`, sur le compte réellement connecté.
//
// Les champs Téléphone et Poste ont été retirés : `profiles` ne comporte
// que id, email, nom, prenom et role. Mieux vaut un formulaire plus court
// qui enregistre vraiment que des champs qui n'ont nulle part où aller.

const TAILLE_MAX_AVATAR = 2 * 1024 * 1024; // 2 Mo
const TYPES_AVATAR = ['image/jpeg', 'image/png', 'image/webp'];

const ProfileSettings = () => {
  const { toast } = useToast();
  const champFichier = useRef<HTMLInputElement>(null);

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // L'avatar n'a pas de colonne dédiée : son chemin se déduit de
  // l'identifiant du compte, ce qui évite une migration pour le stocker.
  const chargerAvatar = useCallback(async (id: string) => {
    for (const ext of ['jpg', 'png', 'webp']) {
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(`avatars/${id}.${ext}`, 3600);
      if (data?.signedUrl) {
        setAvatarUrl(data.signedUrl);
        return;
      }
    }
    setAvatarUrl(null);
  }, []);

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!actif || !user) {
        if (actif) setChargement(false);
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? '');

      const { data: profil } = await supabase
        .from('profiles')
        .select('prenom, nom, email, role')
        .eq('id', user.id)
        .maybeSingle();

      if (!actif) return;

      if (profil) {
        setPrenom(profil.prenom ?? '');
        setNom(profil.nom ?? '');
        setEmail(profil.email ?? user.email ?? '');
        setRole(profil.role ?? '');
      }

      await chargerAvatar(user.id);
      if (actif) setChargement(false);
    };

    charger();
    return () => { actif = false; };
  }, [chargerAvatar]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setEnregistrement(true);
    // upsert : la ligne de profil n'existe pas forcément, aucun déclencheur
    // ne la crée à l'inscription.
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, prenom, nom, email }, { onConflict: 'id' });
    setEnregistrement(false);

    if (error) {
      toast({
        title: "Enregistrement impossible",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été enregistrées.",
    });
  };

  const handleFichierChoisi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = ''; // permet de resélectionner le même fichier
    if (!fichier || !userId) return;

    if (!TYPES_AVATAR.includes(fichier.type)) {
      toast({
        title: "Format non accepté",
        description: "Choisissez une image JPEG, PNG ou WebP.",
        variant: "destructive",
      });
      return;
    }
    if (fichier.size > TAILLE_MAX_AVATAR) {
      toast({
        title: "Image trop lourde",
        description: "La photo ne doit pas dépasser 2 Mo.",
        variant: "destructive",
      });
      return;
    }

    setEnvoiPhoto(true);
    const ext = fichier.type === 'image/png' ? 'png' : fichier.type === 'image/webp' ? 'webp' : 'jpg';
    const { error } = await supabase.storage
      .from('documents')
      .upload(`avatars/${userId}.${ext}`, fichier, { upsert: true });

    if (error) {
      setEnvoiPhoto(false);
      toast({
        title: "Envoi impossible",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await chargerAvatar(userId);
    setEnvoiPhoto(false);
    toast({ title: "Photo mise à jour" });
  };

  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
    || email.charAt(0).toUpperCase()
    || '?';

  if (chargement) {
    return (
      <Card>
        <CardContent className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil utilisateur</CardTitle>
        <CardDescription>
          Gérez vos informations personnelles et professionnelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Photo de profil" />}
              <AvatarFallback>{initiales}</AvatarFallback>
            </Avatar>
            <input
              ref={champFichier}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFichierChoisi}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={envoiPhoto || !userId}
              onClick={() => champFichier.current?.click()}
            >
              {envoiPhoto && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Changer la photo
            </Button>
          </div>

          <form onSubmit={handleProfileUpdate} className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                {/* Le rôle conditionne les accès : il se change depuis la
                    gestion des utilisateurs, pas depuis son propre profil. */}
                <Input id="role" value={role || '—'} disabled />
              </div>
            </div>

            <Button type="submit" disabled={enregistrement || !userId}>
              {enregistrement && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
