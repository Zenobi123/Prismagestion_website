import { useState } from 'react';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OFFER_POLES, getOffersByPole, type Offer, type OfferPole } from '@/constants/offers';
import { DIGITAL_EXPERTISE_ROUTE } from '@/constants/digitalExpertise';
import { OfferCard } from '@/components/offers/OfferCard';
import { QuoteDialog } from '@/components/QuoteDialog';
import { AppointmentDialog } from '@/components/AppointmentDialog';

const OffersSection = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [apptOpen, setApptOpen] = useState(false);
  const [quoteService, setQuoteService] = useState<string | undefined>();
  const [activePole, setActivePole] = useState<OfferPole>(OFFER_POLES[0].id);

  const pole = OFFER_POLES.find((p) => p.id === activePole) ?? OFFER_POLES[0];

  const handleCta = (offer: Offer) => {
    if (offer.ctaType === 'appointment') {
      setApptOpen(true);
    } else {
      setQuoteService(offer.name);
      setQuoteOpen(true);
    }
  };

  return (
    <section id="offres" className="py-12 xs:py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="heading-lg mb-4 text-prisma-purple">
            Nos <span className="text-highlight">offres</span>
          </h2>
          <p className="text-gray-600 measure mx-auto">
            Des prestations packagées, au périmètre et au tarif définis à l'avance. Deux pôles,
            un même cabinet : la rigueur du chiffre et la maîtrise du numérique.
          </p>
        </div>

        {/*
          Un seul pôle est affiché à la fois. Empiler les six offres allongeait
          la page de plus de trois écrans sur mobile, où la grille retombe en
          une colonne.
        */}
        <div
          role="tablist"
          aria-label="Pôles d'offres"
          className="flex justify-center mb-8 md:mb-12"
        >
          <div className="inline-flex gap-1 rounded-full bg-prisma-light-gray p-1">
            {OFFER_POLES.map((pole) => (
              <button
                key={pole.id}
                type="button"
                role="tab"
                aria-selected={activePole === pole.id}
                onClick={() => setActivePole(pole.id)}
                className={`rounded-full px-4 py-2 text-sm md:text-base font-medium transition-colors ${
                  activePole === pole.id
                    ? 'bg-prisma-purple text-white shadow-sm'
                    : 'text-prisma-purple hover:bg-white/70'
                }`}
              >
                {pole.shortTitle}
              </button>
            ))}
          </div>
        </div>

        <div key={pole.id}>
          <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-prisma-purple">
              {pole.title}
            </h3>
            <p className="text-sm md:text-base text-gray-600 mt-2">{pole.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
            {getOffersByPole(pole.id).map((offer) => (
              <OfferCard key={offer.id} offer={offer} onCta={handleCta} />
            ))}
          </div>

          {pole.id === 'numerique' && (
            <div className="max-w-5xl mx-auto mt-8 rounded-2xl bg-prisma-light-gray p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h4 className="font-heading text-lg font-bold text-prisma-purple mb-2">
                  Pas encore sûr par où commencer ?
                </h4>
                <p className="text-sm text-gray-600">
                  Réservez un atelier découverte de 45 minutes, offert et sans engagement :
                  nous passons en revue vos outils actuels, repérons les tâches automatisables
                  et identifions le premier cas d'usage d'IA qui vous ferait gagner du temps.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:w-56 md:flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setApptOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-prisma-purple px-5 py-3 font-medium text-white transition-colors hover:bg-prisma-purple/90"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Réserver l'atelier
                </button>
                <Link
                  to={DIGITAL_EXPERTISE_ROUTE}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-prisma-purple px-5 py-3 font-medium text-prisma-purple transition-colors hover:bg-prisma-purple hover:text-white"
                >
                  Notre méthode
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-12">
          Besoin d'une solution sur mesure ?{' '}
          <a href="#contact" className="text-prisma-purple font-medium hover:underline">Parlons-en</a>.
        </p>
      </div>

      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} serviceTitle={quoteService} />
      <AppointmentDialog open={apptOpen} onOpenChange={setApptOpen} />
    </section>
  );
};

export default OffersSection;
