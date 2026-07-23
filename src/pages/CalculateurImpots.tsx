
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TaxCalculator from "@/components/calculateur/TaxCalculator";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteBreadcrumb } from "@/components/ui/SiteBreadcrumb";
import { NewsletterOptIn } from "@/components/shared/NewsletterOptIn";

const CalculateurImpots = () => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    navigate('/outils');
  };
  
  return (
    <>
      <Helmet>
        <title>Calculateur d'impôts - PRISMA GESTION</title>
        <meta name="description" content="Estimez facilement vos impôts selon les barèmes camerounais en vigueur" />
      </Helmet>

      <Navbar />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-prisma-purple pt-24 xs:pt-28 md:pt-36 lg:pt-44 pb-12 text-white">
          <div className="section">
            <div className="mb-4">
              <SiteBreadcrumb
                items={[
                  { label: "Outils Pratiques", href: "/outils" },
                  { label: "Calculateur IGS" }
                ]}
                className="text-white/80 [&_a]:text-white/80 hover:[&_a]:text-white [&_span[aria-current]]:text-white"
              />
            </div>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-prisma-purple/20 mb-4 -ml-2 flex items-center" 
              onClick={handleBackClick}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour aux outils
            </Button>
            <h1 className="heading-lg mb-4">Calculateur d'Impôt Général Synthétique (IGS)</h1>
            <p className="max-w-2xl text-lg opacity-90">
              Estimez facilement l'IGS à payer selon les barèmes camerounais en vigueur pour les petites et moyennes entreprises.
            </p>
          </div>
        </section>

        {/* Calculateur Section */}
        <section className="py-16">
          <div className="section max-w-4xl mx-auto">
            <TaxCalculator />
            <NewsletterOptIn
              source="calculateur-igs"
              context="Calculateur d'impôts — page IGS"
              className="mt-10"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CalculateurImpots;
