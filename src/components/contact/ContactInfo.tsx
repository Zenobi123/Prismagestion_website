
import { MapPin, Mail, Phone, MessageSquare } from 'lucide-react';
import { CONTACT, formatPhone } from '@/config/social';

interface ContactInfoProps {
  contactData?: {
    title: string;
    description: string;
    address: string;
    email: string;
    phone: string;
    whatsapp: string;
    /** Lignes complémentaires du cabinet. Absentes des données administrables. */
    phoneSecondary?: string;
    phoneTertiary?: string;
  };
}

const ContactInfo = ({ contactData }: ContactInfoProps) => {
  // Les coordonnées de repli viennent de `@/config/social`, source unique :
  // elles étaient auparavant recopiées en dur ici, dans `ContactSection` et
  // dans l'onglet d'administration, avec trois valeurs qui avaient divergé.
  const {
    title = "Contactez-nous",
    description = "Prenez contact avec notre équipe pour discuter de vos besoins et objectifs.",
    address = CONTACT.addressLine,
    email = CONTACT.email,
    phone = CONTACT.phone,
    whatsapp = CONTACT.whatsapp,
    phoneSecondary = CONTACT.phoneSecondary,
    phoneTertiary = CONTACT.phoneTertiary,
  } = contactData || {};

  // Les trois lignes, dans l'ordre d'appel. Le filtre couvre le cas où les
  // données administrables n'en fourniraient qu'une.
  const numeros = [phone, phoneSecondary, phoneTertiary].filter(Boolean);

  return (
    <div>
      <h2 className="heading-lg mb-4 md:mb-6 text-prisma-purple">{title}</h2>
      <p className="text-gray-600 mb-8">{description}</p>
      
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start">
          <div className="mt-1 mr-4 bg-prisma-light-gray p-2 rounded-full">
            <MapPin className="h-5 w-5 text-prisma-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-prisma-purple mb-1">Adresse</h3>
            <p className="text-gray-600">{address}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-1 mr-4 bg-prisma-light-gray p-2 rounded-full">
            <Mail className="h-5 w-5 text-prisma-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-prisma-purple mb-1">Email</h3>
            <a 
              href={`mailto:${email}`} 
              className="cible-tactile text-gray-600 hover:text-prisma-purple hover:underline transition-colors"
            >
              {email}
            </a>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-1 mr-4 bg-prisma-light-gray p-2 rounded-full">
            <Phone className="h-5 w-5 text-prisma-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-prisma-purple mb-1">Téléphone</h3>
            {/* Les lignes du cabinet, chacune appelable d'un appui. */}
            <div className="flex flex-col">
              {numeros.map((numero) => (
                <a
                  key={numero}
                  href={`tel:${numero.replace(/[^+0-9]/g, '')}`}
                  className="cible-tactile text-gray-600 hover:text-prisma-purple hover:underline transition-colors"
                >
                  {formatPhone(numero)}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-1 mr-4 bg-prisma-light-gray p-2 rounded-full">
            <MessageSquare className="h-5 w-5 text-prisma-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-prisma-purple mb-1">WhatsApp</h3>
            <a 
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cible-tactile text-gray-600 hover:text-prisma-purple hover:underline transition-colors"
            >
              {formatPhone(whatsapp)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;

