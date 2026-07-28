import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SiteBreadcrumb } from '@/components/ui/SiteBreadcrumb';
import { NewsletterOptIn } from '@/components/shared/NewsletterOptIn';
import FraisMarcheCalculator from '@/components/calculateur/FraisMarcheCalculator';
import { GRILLE_CNE, BAREMES_DATE_ETAT } from '@/constants/baremesEnregistrement';
import { formatFcfa } from '@/utils/fraisMarche';

const CalculateurFraisMarche = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Calculateur des frais sur marché public - PRISMA GESTION</title>
        <meta
          name="description"
          content="Estimez le coût d'enregistrement d'un bon de commande administratif au Cameroun : droit proportionnel, CAC, timbres, mercuriale, TRESORPAY et certificat de non exclusion (CNE-ARMP)."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-white">
        <section className="bg-prisma-purple pt-24 xs:pt-28 md:pt-36 lg:pt-44 pb-12 text-white">
          <div className="section">
            <div className="mb-4">
              <SiteBreadcrumb
                items={[
                  { label: 'Outils Pratiques', href: '/outils' },
                  { label: 'Frais sur marché' },
                ]}
                className="text-white/80 [&_a]:text-white/80 hover:[&_a]:text-white [&_span[aria-current]]:text-white"
              />
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-prisma-purple/20 mb-4 -ml-2 flex items-center"
              onClick={() => navigate('/outils')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour aux outils
            </Button>
            <h1 className="heading-lg mb-4">Calculateur des frais sur marché</h1>
            <p className="max-w-2xl text-lg opacity-90">
              Estimez le coût complet de l'enregistrement d'un bon de commande administratif :
              droit proportionnel, centimes additionnels communaux, timbres, mercuriale, frais de
              télépaiement et certificat de non exclusion.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="section max-w-4xl mx-auto space-y-12">
            <FraisMarcheCalculator />

            <div>
              <h2 className="heading-sm text-prisma-purple mb-4">
                Ce que couvre le calcul
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div className="rounded-lg border border-gray-200 p-5">
                  <h3 className="font-heading font-semibold text-prisma-purple mb-2">
                    Part fiscale
                  </h3>
                  <p>
                    Droit proportionnel de <strong>7 %</strong> assis sur le montant hors taxes,
                    pour un bon de commande strictement inférieur à 5 000 000 F CFA, majoré des
                    centimes additionnels communaux de <strong>5 %</strong> du droit. Au-delà du
                    seuil, le taux ne s'extrapole pas : il doit être revérifié dans le CGI.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-5">
                  <h3 className="font-heading font-semibold text-prisma-purple mb-2">
                    Frais annexes
                  </h3>
                  <p>
                    Timbre de dimension par page, frais d'exploitation de la mercuriale, frais de
                    paiement TRESORPAY, droit de délivrance du CNE-ARMP et frais d'obtention du
                    certificat — sur deux lignes distinctes — puis les attestations DGI.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="heading-sm text-prisma-purple mb-4">Grille CNE-ARMP en vigueur</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[360px] text-sm">
                  <thead className="bg-prisma-light-gray">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-prisma-purple">
                        Tranche du marché (F CFA)
                      </th>
                      <th className="py-3 px-4 text-right font-semibold text-prisma-purple">
                        Droit de délivrance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {GRILLE_CNE.map((tranche) => (
                      <tr key={tranche.libelle} className="border-t border-gray-100">
                        <td className="py-2.5 px-4 text-gray-800">{tranche.libelle}</td>
                        <td className="py-2.5 px-4 text-right font-medium whitespace-nowrap">
                          {formatFcfa(tranche.droit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Résolution n° 0357/ARMP/CA du 21 juillet 2026. Le barème applicable est celui en
                vigueur à la date de signature du bon de commande : pour un marché antérieur, le
                calculateur retient le barème précédent. Barèmes à jour au {BAREMES_DATE_ETAT} —
                base de travail, à confronter aux sources officielles avant diffusion client.
              </p>
            </div>

            <div>
              <h2 className="heading-sm text-prisma-purple mb-4">À vérifier avant de conclure</h2>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {[
                  "Le seuil de 5 000 000 F CFA : un avenant fait basculer à la fois le taux de liquidation et la tranche du CNE.",
                  "La cohérence entre l'objet du bon de commande, l'imputation budgétaire et les désignations — une discordance expose à un refus de visa ou à un redressement.",
                  'Les références mercuriales de chaque ligne, qui conditionnent la recevabilité du dossier.',
                  "Le mode de règlement : en marché public, la TVA et l'IR sont retenus à la source ; le net à payer vaut HT moins l'IR, et non TTC moins les retenues.",
                  "L'identité fiscale du prestataire : le NIU peut être celui d'une personne physique exploitant un nom commercial.",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-prisma-chartreuse" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <NewsletterOptIn
              source="calculateur-frais-marche"
              context="Calculateur des frais sur marché — enregistrement de bon de commande"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CalculateurFraisMarche;
