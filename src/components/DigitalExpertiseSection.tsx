import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DIGITAL_PILLARS, DIGITAL_EXPERTISE_ROUTE } from '@/constants/digitalExpertise';

const DigitalExpertiseSection = () => {
  return (
    <section id="ia-logiciel" className="py-12 xs:py-16 md:py-24 bg-prisma-purple text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-prisma-chartreuse mb-4">
            Pôle numérique
          </span>
          <h2 className="heading-lg mb-4">
            Génie logiciel &amp; <span className="text-prisma-chartreuse">intelligence artificielle</span>
          </h2>
          <p className="text-white/80 measure mx-auto">
            C'est un métier à part entière chez PRISMA GESTION : vous conseiller sur les logiciels
            à adopter, développer ceux qui manquent, puis choisir, installer et paramétrer les
            modèles d'intelligence artificielle qui travaillent réellement pour vos équipes.
          </p>
        </div>

        {/*
          Présentation volontairement resserrée : les livrables détaillés, la
          méthode pas à pas, les cas d'usage et la FAQ vivent sur la page dédiée
          (DIGITAL_EXPERTISE_ROUTE). L'accueil ne fait qu'annoncer les trois
          métiers et y renvoyer.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {DIGITAL_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.id}
                className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-5 lg:p-8 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-prisma-chartreuse/15">
                    <Icon className="h-5 w-5 text-prisma-chartreuse" />
                  </span>
                  <h3 className="font-heading text-base md:text-xl font-bold">{pillar.title}</h3>
                </div>
                <p className="text-sm font-medium text-prisma-chartreuse mb-2">{pillar.promise}</p>
                <p className="text-sm text-white/75 line-clamp-4 md:line-clamp-none">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-8 md:mt-14">
          <Link
            to={DIGITAL_EXPERTISE_ROUTE}
            className="inline-flex items-center gap-2 rounded-md bg-prisma-chartreuse px-6 py-3 font-medium text-prisma-purple transition-colors hover:bg-prisma-chartreuse/90"
          >
            Découvrir notre expertise IA &amp; logiciel
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-sm text-white/60 mt-4 measure mx-auto">
            Cas d'usage, critères de choix des modèles, engagements sur vos données et réponses
            aux questions les plus fréquentes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DigitalExpertiseSection;
