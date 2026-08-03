
import { ServiceType } from '@/types/services';
import { QuoteDialog } from '../QuoteDialog';
import { useState } from 'react';

interface ServiceInfoProps {
  service: ServiceType;
}

export const ServiceInfo = ({ service }: ServiceInfoProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div>
      <h3 className="heading-md mb-2 md:mb-3 text-prisma-purple">{service.title}</h3>
      <p className="text-gray-700 mb-4 md:mb-6 text-sm md:text-base measure">{service.description}</p>
      <ul className="space-y-1 md:space-y-2">
        {service.items?.map((item, index) => (
          <li key={index} className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-prisma-chartreuse mr-2 md:mr-3"></div>
            <span className="text-sm md:text-base">{item}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="btn-primary mt-6 md:mt-8 inline-block w-full sm:w-auto text-center"
      >
        Demander un devis
      </button>
      <QuoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        serviceTitle={service.title}
      />
    </div>
  );
};
