
import { Link } from "react-router-dom";
import { Button } from "@gestion/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Anciennement LogoutButton.
//
// Du temps où la console était une application autonome, se déconnecter
// depuis sa barre latérale allait de soi. Devenue un module de l'espace
// d'administration du site, elle partage la session de l'hôte : y couper
// l'authentification faisait doublon avec le bouton de déconnexion de la
// barre latérale admin, et éjectait l'utilisateur des deux applications
// d'un seul geste — y compris lorsqu'il ne cherchait qu'à revenir en
// arrière.
//
// Le bouton ramène donc à l'administration du site, d'où la déconnexion
// reste accessible. Le chemin est absolu et volontairement hors du
// préfixe de la console.
const RetourAdminButton = () => (
  <Button
    asChild
    variant="ghost"
    className="text-neutral-600 hover:text-neutral-900"
  >
    <Link to="/admin">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Administration du site
    </Link>
  </Button>
);

export default RetourAdminButton;
