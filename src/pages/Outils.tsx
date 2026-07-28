
import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calculator, FileText, Briefcase, Globe, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteBreadcrumb } from "@/components/ui/SiteBreadcrumb";

const Outils = () => {
  return (
    <>
      <Helmet>
        <title>Outils Pratiques - PRISMA GESTION</title>
        <meta name="description" content="Outils pratiques pour les entrepreneurs et entreprises camerounaises" />
      </Helmet>

      <Navbar />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-prisma-purple pt-24 xs:pt-28 md:pt-36 lg:pt-44 pb-16 text-white">
          <div className="section">
            <div className="mb-8">
              <SiteBreadcrumb items={[{ label: "Outils Pratiques" }]} className="text-white/80 [&_a]:text-white/80 hover:[&_a]:text-white [&_span[aria-current]]:text-white" />
            </div>
            <h1 className="heading-lg mb-4">Outils Pratiques</h1>
            <p className="max-w-2xl text-lg opacity-90">
              Des outils spécialement conçus pour les entrepreneurs et entreprises camerounaises.
            </p>
          </div>
        </section>

        {/* Outils Section */}
        <section className="py-16">
          <div className="section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calculateur d'impôts */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-prisma-purple/10 p-3 rounded-full">
                    <Calculator className="h-6 w-6 text-prisma-purple" />
                  </div>
                  <h3 className="heading-sm">Calculateur d'Impôts</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Estimez facilement vos impôts selon les barèmes camerounais en vigueur. Calcul de l'IRPP, 
                  de la patente, et autres taxes applicables.
                </p>
                <Link to="/outils/calculateur-impots">
                  <Button variant="outline" className="w-full">
                    Accéder au calculateur
                  </Button>
                </Link>
              </div>

              {/* Calculateur des frais sur marché */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-prisma-purple/10 p-3 rounded-full">
                    <Receipt className="h-6 w-6 text-prisma-purple" />
                  </div>
                  <h3 className="heading-sm">Frais sur Marché</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Estimez le coût d'enregistrement d'un bon de commande administratif : droit
                  proportionnel, CAC, timbres, mercuriale, TRESORPAY et certificat de non exclusion
                  (CNE-ARMP).
                </p>
                <Link to="/outils/calculateur-frais-marche">
                  <Button variant="outline" className="w-full">
                    Calculer les frais
                  </Button>
                </Link>
              </div>

              {/* Modèles de documents */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-prisma-purple/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-prisma-purple" />
                  </div>
                  <h3 className="heading-sm">Modèles de Documents</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Téléchargez des modèles de documents adaptés au contexte camerounais : factures, contrats, 
                  bulletins de paie conformes à la législation locale.
                </p>
                <Link to="/outils/modeles-documents">
                  <Button variant="outline" className="w-full">
                    Accéder aux modèles
                  </Button>
                </Link>
              </div>

              {/* Guide création d'entreprise */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-prisma-purple/10 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-prisma-purple" />
                  </div>
                  <h3 className="heading-sm">Création d'Entreprise</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Guide complet pour créer votre entreprise au Cameroun : démarches administratives, 
                  coûts et délais, informations sur le CFCE et les procédures simplifiées.
                </p>
                <Link to="/outils/guide-creation-entreprise">
                  <Button variant="outline" className="w-full">
                    Consulter le guide
                  </Button>
                </Link>
              </div>

              {/* Actualités législatives */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-prisma-purple/10 p-3 rounded-full">
                    <Globe className="h-6 w-6 text-prisma-purple" />
                  </div>
                  <h3 className="heading-sm">Actualités Législatives</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Restez informé des dernières évolutions législatives au Cameroun en matière fiscale, 
                  sociale et juridique impactant votre activité professionnelle.
                </p>
                <Link to="/outils/actualites-legislatives">
                  <Button variant="outline" className="w-full">
                    Voir les actualités
                  </Button>
                </Link>
              </div>
            </div>

            {/* Section supplémentaire : Contacts au besoin */}
            <div className="mt-16 bg-prisma-light-gray p-8 rounded-lg">
              <h2 className="heading-md mb-4 text-prisma-purple">Besoin d'une assistance personnalisée ?</h2>
              <p className="mb-6">
                Nos experts sont à votre disposition pour vous accompagner dans vos démarches et répondre à vos questions 
                spécifiques concernant la fiscalité et la gestion d'entreprise au Cameroun.
              </p>
              <Link to="/#contact">
                <Button variant="purple">Nous contacter</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Outils;
