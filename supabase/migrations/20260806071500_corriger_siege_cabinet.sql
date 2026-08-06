-- Siege social : Bata Longkak devient Etoa - Meki.
--
-- Deux choses a reprendre, et non une seule : la valeur de la ligne existante,
-- et le DEFAULT de la colonne, pose par 20260806064500_creer_cabinet_config.
-- Omettre le DEFAULT laisserait une base recreee a neuf repartir sur l'ancien
-- quartier.
--
-- La migration precedente n'est pas modifiee : elle a deja ete appliquee, et
-- retoucher un fichier deja joue ferait diverger le depot de l'historique
-- reellement execute.

alter table public.cabinet_config
  alter column siege set default 'Yaoundé - Etoa - Méki';

-- Seule la ligne portant encore l'ancienne valeur est touchee : si le cabinet
-- a saisi autre chose entre-temps depuis l'ecran de parametres, sa saisie est
-- conservee.
update public.cabinet_config
   set siege = 'Yaoundé - Etoa - Méki'
 where id = 1
   and siege = 'Yaoundé - Bata Longkak';
