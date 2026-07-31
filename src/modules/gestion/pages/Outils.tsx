import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator } from "lucide-react";

import PageLayout from "@gestion/components/layout/PageLayout";
import { Button } from "@gestion/components/ui/button";
import IGSCalculatorCard from "@gestion/components/outils/IGSCalculatorCard";
import IGSInformation from "@gestion/components/outils/IGSInformation";
import { useAuthorization } from "@gestion/hooks/useAuthorization";
import { CollaborateurUnauthorized } from "@gestion/components/collaborateurs/CollaborateurUnauthorized";
import { GESTION_BASE } from "@gestion/routes";

/**
 * Page « Outils » : reprend l'outil pratique du site vitrine PRISMA GESTION
 * (rubrique « Outils Pratiques »), limité à la partie IGS — calculateur
 * d'Impôt Général Synthétique et présentation détaillée du régime.
 */
const Outils = () => {
  const { isAuthorized } = useAuthorization(
    ["admin", "comptable", "gestionnaire", "expert-comptable", "fiscaliste", "assistant"],
    "outils",
    { showToast: true }
  );
  const navigate = useNavigate();

  if (!isAuthorized) {
    return <CollaborateurUnauthorized module="outils" />;
  }

  return (
    <PageLayout>
      <div className="px-4 py-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(GESTION_BASE)}
            className="flex items-center gap-1 sm:gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
        </div>

        <div className="flex items-start gap-3 mb-4 sm:mb-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Calculateur d'Impôt Général Synthétique (IGS)
            </h1>
            <p className="text-neutral-600 mt-1 text-xs sm:text-sm">
              Estimez facilement l'IGS à payer selon les barèmes camerounais en vigueur pour les
              petites et moyennes entreprises.
            </p>
          </div>
        </div>

        <IGSCalculatorCard />
        <IGSInformation />
      </div>
    </PageLayout>
  );
};

export default Outils;
