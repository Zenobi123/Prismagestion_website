import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DIGITAL_PILLARS,
  AI_METHOD_STEPS,
  DIGITAL_EXPERTISE_ROUTE,
} from '@/constants/digitalExpertise';

const DigitalExpertiseSection = () => {
  return (
    <section id="ia-logiciel" className="py-12 xs:py-16 md:py-24 bg-prisma-purple text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-prisma-chartreuse mb-4">
            Pôle numérique
          </span>
          <h2 className="heading-lg mb-4">
            Génie logiciel &amp; <span className="text-prisma-chartreuse">intelligence artificielle</span>
          </h2>
          <p className="text-white/80">
            C'est un métier à part entière chez PRISMA GESTION : vous conseiller sur les logiciels
            à adopter, développer ceux qui manquent, puis choisir, installer et paramétrer les
            modèles d'intelligence artificielle qui travaillent réellement pour vos équipes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {DIGITAL_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.id}
                className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 transition-colors hover:bg-white/10"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-prisma-chartreuse/15">
                  <Icon className="h-6 w-6 text-prisma-chartreuse" />
                </div>
                <h3 className="font-heading text-lg md:text-xl font-bold mb-1">{pillar.title}</h3>
                <p className="text-sm font-medium text-prisma-chartreuse mb-3">{pillar.promise}</p>
                <p className="text-sm text-white/75 mb-5">{pillar.description}</p>
                <ul className="space-y-2 text-sm text-white/80 mt-auto">
                  {pillar.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-prisma-chartreuse" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto mt-12 md:mt-16">
          <h3 className="font-heading text-lg md:text-xl font-bold text-center mb-8">
            Un projet d'IA chez nous, étape par étape
          </h3>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {AI_METHOD_STEPS.map((step) => (
              <li
                key={step.step}
                className="rounded-xl border border-white/10 bg-white/5 p-5 flex gap-4"
              >
                <span className="font-heading text-xl font-bold text-prisma-chartreuse">
                  {step.step}
                </span>
                <div>
                  <h4 className="font-heading font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-white/70">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="text-center mt-10 md:mt-14">
          <Link
            to={DIGITAL_EXPERTISE_ROUTE}
            className="inline-flex items-center gap-2 rounded-md bg-prisma-chartreuse px-6 py-3 font-medium text-prisma-purple transition-colors hover:bg-prisma-chartreuse/90"
          >
            Découvrir notre expertise IA &amp; logiciel
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-sm text-white/60 mt-4">
            Cas d'usage, critères de choix des modèles, engagements sur vos données et réponses
            aux questions les plus fréquentes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DigitalExpertiseSection;
