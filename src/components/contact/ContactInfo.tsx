
import { MapPin, Mail, Phone, MessageSquare } from 'lucide-react';

interface ContactInfoProps {
  contactData?: {
    title: string;
    description: string;
    address: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
}

const ContactInfo = ({ contactData }: ContactInfoProps) => {
  // Default values if contactData is not provided
  const {
    title = "Contactez-nous",
    description = "Prenez contact avec notre équipe pour discuter de vos besoins et objectifs.",
    address = "Yaoundé, Cameroun",
    email = "obiangtimenathan@gmail.com",
    phone = "+237 656 752 475",
    whatsapp = "+237 694 310 554"
  } = contactData || {};

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
              className="text-gray-600 hover:text-prisma-purple hover:underline transition-colors"
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
            <a 
              href={`tel:${phone.replace(/\s+/g, '')}`} 
              className="text-gray-600 hover:text-prisma-purple hover:underline transition-colors"
            >
              {phone}
            </a>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-1 mr-4 bg-prisma-light-gray p-2 rounded-full">
            <MessageSquare className="h-5 w-5 text-prisma-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-prisma-purple mb-1">WhatsApp</h3>
            <a 
              href={`https://wa.me/${whatsapp.replace(/\+|\s+/g, '')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-prisma-purple hover:underline transition-colors"
            >
              {whatsapp}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;

