import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Wrench } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page introuvable - PRISMA GESTION</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-white">
        <section className="bg-prisma-purple pt-24 xs:pt-28 md:pt-36 lg:pt-44 pb-16 text-white">
          <div className="section">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-prisma-chartreuse mb-4">
              Erreur 404
            </span>
            <h1 className="heading-lg mb-4">Cette page n'existe pas</h1>
            <p className="max-w-2xl text-lg text-white/85">
              L'adresse demandée est introuvable : la page a peut-être été déplacée, ou n'est pas
              encore en ligne. Nos outils et nos services restent accessibles ci-dessous.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-prisma-chartreuse px-6 py-3 font-medium text-prisma-purple transition-colors hover:bg-prisma-chartreuse/90"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Link>
              <Link
                to="/outils"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-3 font-medium text-white transition-colors hover:bg-white hover:text-prisma-purple"
              >
                <Wrench className="h-4 w-4" />
                Voir les outils pratiques
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="section">
            <h2 className="heading-sm text-prisma-purple mb-6">Où souhaitez-vous aller ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { to: '/outils/calculateur-impots', label: "Calculateur d'impôts" },
                { to: '/outils/calculateur-frais-marche', label: 'Frais sur marché' },
                { to: '/expertise/ia-et-genie-logiciel', label: 'IA & génie logiciel' },
                { to: '/blog', label: 'Notre blog' },
              ].map((lien) => (
                <Link
                  key={lien.to}
                  to={lien.to}
                  className="rounded-lg border border-gray-200 p-5 text-prisma-purple font-medium transition-shadow hover:shadow-md"
                >
                  {lien.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default NotFound;
