import { Check } from 'lucide-react';
import type { Offer } from '@/constants/offers';

interface OfferCardProps {
  offer: Offer;
  onCta: (offer: Offer) => void;
}

export const OfferCard = ({ offer, onCta }: OfferCardProps) => {
  const Icon = offer.icon;
  const highlighted = offer.highlighted;

  return (
    <div
      className={`relative flex flex-col rounded-2xl bg-white p-6 lg:p-8 transition-all ${
        highlighted
          ? 'border-2 border-prisma-purple shadow-xl md:-mt-4 md:mb-4'
          : 'border border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      {offer.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-prisma-purple px-4 py-1 text-xs font-semibold text-white">
          {offer.badge}
        </span>
      )}

      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-prisma-purple/10">
        <Icon className="h-6 w-6 text-prisma-purple" />
      </div>

      <h4 className="font-heading text-lg md:text-xl font-bold text-prisma-purple mb-1">
        {offer.name}
      </h4>
      <p className="text-sm text-gray-600 mb-5">{offer.tagline}</p>

      <div className="mb-5">
        <div className="text-xl md:text-2xl font-bold text-prisma-purple">{offer.priceLabel}</div>
        {offer.priceNote && <div className="text-xs text-gray-500 mt-1">{offer.priceNote}</div>}
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {offer.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-prisma-chartreuse" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onCta(offer)}
        className={`w-full rounded-md px-5 py-3 text-center font-medium transition-all ${
          highlighted
            ? 'bg-prisma-purple text-white hover:bg-prisma-purple/90'
            : 'border border-prisma-purple text-prisma-purple hover:bg-prisma-purple hover:text-white'
        }`}
      >
        {offer.ctaLabel}
      </button>
    </div>
  );
};

export default OfferCard;
