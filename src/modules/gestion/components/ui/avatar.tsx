// Ré-export : l'implémentation unique vit dans src/components/ui/avatar.
//
// Ce composant était dupliqué à l'identique entre le site et la console. Une
// seule copie subsiste ; ce fichier ne garde que le chemin d'accès, pour que
// les imports "@gestion/components/ui/..." du module restent inchangés.
//
// Les composants dont le style diverge volontairement entre les deux
// applications ont, eux, gardé leur implémentation propre — voir docs/FUSION.md.
export * from "@/components/ui/avatar";
