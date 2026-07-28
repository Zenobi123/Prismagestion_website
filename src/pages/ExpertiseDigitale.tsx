import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Check } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SiteBreadcrumb } from '@/components/ui/SiteBreadcrumb';
import { OfferCard } from '@/components/offers/OfferCard';
import { QuoteDialog } from '@/components/QuoteDialog';
import { AppointmentDialog } from '@/components/AppointmentDialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getOffersByPole, OFFERS, type Offer } from '@/constants/offers';
import {
  DIGITAL_PILLARS,
  AI_METHOD_STEPS,
  MODEL_SELECTION_CRITERIA,
  AI_USE_CASES,
  DIGITAL_COMMITMENTS,
  DIGITAL_FAQ,
  DIGITAL_EXPERTISE_ROUTE,
} from '@/constants/digitalExpertise';
import { usePageMetadata } from '@/hooks/usePageMetadata';

const SEO_TITLE = "Génie logiciel & intelligence artificielle | PRISMA GESTION";
const SEO_DESCRIPTION =
  "Conseil en orientation logicielle, développement d'applications métier et intelligence artificielle sur mesure : choix des modèles, mise en place, paramétrage et formation. PRISMA GESTION, Yaoundé.";
const SEO_KEYWORDS = [
  "intelligence artificielle entreprise",
  "conseil logiciel",
  "développement sur mesure",
  "choix modèle IA",
  "automatisation des processus",
  "transformation numérique Cameroun",
  "PRISMA GESTION",
];

const ExpertiseDigitale = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [apptOpen, setApptOpen] = useState(false);
  const [quoteService, setQuoteService] = useState<string | undefined>();

  usePageMetadata({
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    keywords: SEO_KEYWORDS,
    canonicalUrl: window.location.origin + DIGITAL_EXPERTISE_ROUTE,
  });

  const openQuote = (serviceName: string) => {
    setQuoteService(serviceName);
    setQuoteOpen(true);
  };

  const handleOfferCta = (offer: Offer) => {
    if (offer.ctaType === 'appointment') {
      setApptOpen(true);
    } else {
      openQuote(offer.name);
    }
  };

  const offerName = (offerId: string) =>
    OFFERS.find((offer) => offer.id === offerId)?.name ?? offerId;

  return (
    <>
      <SEOHead
        config={{
          title: SEO_TITLE,
          description: SEO_DESCRIPTION,
          keywords: SEO_KEYWORDS,
          canonicalUrl: window.location.origin + DIGITAL_EXPERTISE_ROUTE,
        }}
      />

      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-prisma-purple pt-24 xs:pt-28 md:pt-36 lg:pt-44 pb-16 text-white">
          <div className="section">
            <div className="mb-8">
              <SiteBreadcrumb
                items={[{ label: "Génie logiciel & intelligence artificielle" }]}
                className="text-white/80 [&_a]:text-white/80 hover:[&_a]:text-white [&_span[aria-current]]:text-white"
              />
            </div>
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-prisma-chartreuse mb-4">
              Pôle numérique
            </span>
            <h1 className="heading-lg mb-4 max-w-3xl">
              Génie logiciel &amp;{' '}
              <span className="text-prisma-chartreuse">intelligence artificielle</span>
            </h1>
            <p className="max-w-2xl text-lg text-white/85">
              Vous conseiller sur les logiciels à adopter, développer ceux qui manquent, puis
              choisir, mettre en place et paramétrer les modèles d'intelligence artificielle
              qui travaillent réellement pour vos équipes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setApptOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-prisma-chartreuse px-6 py-3 font-medium text-prisma-purple transition-colors hover:bg-prisma-chartreuse/90"
              >
                <CalendarCheck className="h-4 w-4" />
                Atelier découverte offert (45 min)
              </button>
              <a
                href="#offres-numeriques"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-3 font-medium text-white transition-colors hover:bg-white hover:text-prisma-purple"
              >
                Voir les offres
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Trois métiers */}
        <section className="py-16 md:py-20">
          <div className="section">
            <div className="max-w-3xl mb-10 md:mb-14">
              <h2 className="heading-md text-prisma-purple mb-4">Trois métiers complémentaires</h2>
              <p className="text-gray-600">
                Le conseil oriente, le développement construit, l'intelligence artificielle
                démultiplie. Chacun se pratique séparément — ensemble, ils forment un parcours
                cohérent, du diagnostic à l'outil adopté par vos équipes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {DIGITAL_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article
                    key={pillar.id}
                    className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-prisma-purple/10">
                      <Icon className="h-6 w-6 text-prisma-purple" />
                    </div>
                    <h3 className="heading-sm text-prisma-purple mb-1">{pillar.title}</h3>
                    <p className="text-sm font-medium text-prisma-purple/70 mb-3">{pillar.promise}</p>
                    <p className="text-sm text-gray-600 mb-5">{pillar.description}</p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {pillar.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-prisma-chartreuse" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => openQuote(offerName(pillar.offerId))}
                      className="w-full rounded-md border border-prisma-purple px-5 py-3 text-center font-medium text-prisma-purple transition-colors hover:bg-prisma-purple hover:text-white"
                    >
                      Demander un devis
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Choix du modèle */}
        <section className="py-16 md:py-20 bg-prisma-light-gray">
          <div className="section">
            <div className="max-w-3xl mb-10 md:mb-14">
              <h2 className="heading-md text-prisma-purple mb-4">
                Comment nous choisissons un modèle d'IA
              </h2>
              <p className="text-gray-600">
                Il n'existe pas de « meilleur modèle » : il existe le modèle adapté à un cas
                d'usage, à un budget et à un niveau de confidentialité. Voici les six critères
                que nous instruisons avec vous avant de trancher — et l'arbitrage vous est
                remis par écrit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MODEL_SELECTION_CRITERIA.map((criterion) => {
                const Icon = criterion.icon;
                return (
                  <div
                    key={criterion.title}
                    className="rounded-xl bg-white border border-gray-200 p-6"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-prisma-purple/10">
                      <Icon className="h-5 w-5 text-prisma-purple" />
                    </div>
                    <h3 className="font-heading font-semibold text-prisma-purple mb-2">
                      {criterion.title}
                    </h3>
                    <p className="text-sm text-gray-600">{criterion.question}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Méthode */}
        <section className="py-16 md:py-20">
          <div className="section">
            <div className="max-w-3xl mb-10 md:mb-14">
              <h2 className="heading-md text-prisma-purple mb-4">
                Notre méthode, étape par étape
              </h2>
              <p className="text-gray-600">
                Un projet d'intelligence artificielle se conduit comme un projet de gestion :
                un périmètre, des livrables, des résultats mesurés. Chaque étape se solde par un
                document que vous conservez.
              </p>
            </div>

            <ol className="space-y-6">
              {AI_METHOD_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.step}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-xl border border-gray-200 p-6"
                  >
                    <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:w-24 flex-shrink-0">
                      <span className="font-heading text-2xl font-bold text-prisma-chartreuse">
                        {step.step}
                      </span>
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-prisma-purple/10">
                        <Icon className="h-5 w-5 text-prisma-purple" />
                      </div>
                    </div>
                    <div>
                      <h3 className="heading-sm text-prisma-purple mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <p className="text-sm font-medium text-prisma-purple/80">{step.output}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Cas d'usage */}
        <section className="py-16 md:py-20 bg-prisma-light-gray">
          <div className="section">
            <div className="max-w-3xl mb-10 md:mb-14">
              <h2 className="heading-md text-prisma-purple mb-4">
                Ce que l'IA fait déjà pour une PME
              </h2>
              <p className="text-gray-600">
                Des usages concrets, choisis pour leur retour sur investissement rapide et
                mesurable. Nous commençons toujours par un seul d'entre eux.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AI_USE_CASES.map((useCase) => {
                const Icon = useCase.icon;
                return (
                  <div key={useCase.title} className="rounded-xl bg-white border border-gray-200 p-6">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-prisma-chartreuse/20">
                      <Icon className="h-5 w-5 text-prisma-purple" />
                    </div>
                    <h3 className="font-heading font-semibold text-prisma-purple mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-gray-600">{useCase.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Engagements */}
        <section className="py-16 md:py-20">
          <div className="section">
            <div className="max-w-3xl mb-10 md:mb-14">
              <h2 className="heading-md text-prisma-purple mb-4">Nos engagements</h2>
              <p className="text-gray-600">
                Le numérique se vend beaucoup et se livre parfois mal. Voici ce sur quoi nous
                nous engageons dès la première réunion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DIGITAL_COMMITMENTS.map((commitment) => (
                <div
                  key={commitment.title}
                  className="rounded-xl border-l-4 border-prisma-chartreuse bg-prisma-light-gray p-6"
                >
                  <h3 className="font-heading font-semibold text-prisma-purple mb-2">
                    {commitment.title}
                  </h3>
                  <p className="text-sm text-gray-600">{commitment.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Offres du pôle */}
        <section id="offres-numeriques" className="py-16 md:py-20 bg-prisma-light-gray">
          <div className="section">
            <div className="max-w-3xl mb-10 md:mb-14">
              <h2 className="heading-md text-prisma-purple mb-4">Nos offres du pôle numérique</h2>
              <p className="text-gray-600">
                Trois formats d'intervention, mobilisables séparément ou à la suite. Les
                montants sont établis après cadrage, sur la base d'un périmètre écrit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {getOffersByPole('numerique').map((offer) => (
                <OfferCard key={offer.id} offer={offer} onCta={handleOfferCta} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20">
          <div className="section max-w-3xl">
            <h2 className="heading-md text-prisma-purple mb-8">Questions fréquentes</h2>
            <Accordion type="single" collapsible className="w-full">
              {DIGITAL_FAQ.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left font-heading text-prisma-purple">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA final */}
        <section className="pb-16 md:pb-24">
          <div className="section">
            <div className="rounded-2xl bg-prisma-purple p-8 md:p-12 text-white flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <h2 className="heading-sm mb-3">
                  Parlons de votre premier cas d'usage
                </h2>
                <p className="text-white/80">
                  Quarante-cinq minutes suffisent pour faire le tour de vos outils, repérer les
                  tâches automatisables et vous dire honnêtement si l'IA est la bonne réponse —
                  ou si un simple logiciel bien choisi ferait mieux l'affaire.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:w-64 md:flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setApptOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-prisma-chartreuse px-6 py-3 font-medium text-prisma-purple transition-colors hover:bg-prisma-chartreuse/90"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Réserver l'atelier
                </button>
                <Link
                  to="/#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-3 font-medium text-white transition-colors hover:bg-white hover:text-prisma-purple"
                >
                  Nous écrire
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} serviceTitle={quoteService} />
      <AppointmentDialog open={apptOpen} onOpenChange={setApptOpen} />
    </>
  );
};

export default ExpertiseDigitale;
