
import { useNavigate } from "react-router-dom";
import { Button } from "@gestion/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@gestion/components/ui/use-toast";
import { supabase } from "@gestion/integrations/supabase/client";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Nettoyer les données du localStorage
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("lastSelectedGestionClientId");

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      // Retour à l'accueil du site public après déconnexion, comme le fait
      // déjà l'espace d'administration de l'hôte.
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="text-neutral-600 hover:text-neutral-900"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Déconnexion
    </Button>
  );
};

export default LogoutButton;
