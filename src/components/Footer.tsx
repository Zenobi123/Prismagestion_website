
import { Mail, Phone, MessageCircle, Facebook, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { CONTACT, SOCIAL } from "@/config/social";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { key: "whatsapp", href: SOCIAL.whatsapp, label: "WhatsApp", Icon: MessageCircle },
    { key: "facebook", href: SOCIAL.facebook, label: "Facebook", Icon: Facebook },
    { key: "linkedin", href: SOCIAL.linkedin, label: "LinkedIn", Icon: Linkedin },
    { key: "instagram", href: SOCIAL.instagram, label: "Instagram", Icon: Instagram },
  ].filter((s) => s.href);

  return (
    <footer className="bg-prisma-purple text-white">
      <div className="section py-10 xs:py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 lg:gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="block mb-4">
              <span className="font-heading font-bold text-2xl">PRISMA<span className="text-prisma-chartreuse">GESTION</span></span>
            </Link>
            <p className="text-white/80 mb-6 max-w-md">
              Votre partenaire en expertise comptable et numérique.
              Des solutions sur-mesure pour répondre aux défis de votre entreprise.
            </p>
            <div className="flex space-x-4 mb-4">
              <a href={`mailto:${CONTACT.email}`} aria-label="Nous écrire par email" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href={`tel:${CONTACT.phone}`} aria-label="Nous appeler" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Phone className="h-5 w-5" />
              </a>
              {socialLinks.map(({ key, href, label, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div>
              <Link to="/outils" className="text-prisma-chartreuse hover:text-white transition-colors">
                Outils pratiques
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4 text-prisma-chartreuse">Services</h3>
            <ul className="space-y-2">
              <li><a href="/#services" className="text-white/80 hover:text-white transition-colors">Comptabilité</a></li>
              <li><a href="/#services" className="text-white/80 hover:text-white transition-colors">Finance</a></li>
              <li><a href="/#services" className="text-white/80 hover:text-white transition-colors">Fiscalité</a></li>
              <li><a href="/#services" className="text-white/80 hover:text-white transition-colors">Ressources Humaines</a></li>
              <li><Link to="/expertise/ia-et-genie-logiciel" className="text-white/80 hover:text-white transition-colors">Génie Logiciel</Link></li>
              <li><Link to="/expertise/ia-et-genie-logiciel" className="text-white/80 hover:text-white transition-colors">Intelligence Artificielle</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4 text-prisma-chartreuse">Liens utiles</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/80 hover:text-white transition-colors">Accueil</Link></li>
              <li><a href="/#about" className="text-white/80 hover:text-white transition-colors">À propos</a></li>
              <li><a href="/#services" className="text-white/80 hover:text-white transition-colors">Services</a></li>
              <li><Link to="/expertise/ia-et-genie-logiciel" className="text-white/80 hover:text-white transition-colors">IA &amp; Génie Logiciel</Link></li>
              <li><Link to="/blog" className="text-white/80 hover:text-white transition-colors">Notre Blog</Link></li>
              <li><a href="/#contact" className="text-white/80 hover:text-white transition-colors">Nous contacter</a></li>
              <li><Link to="/admin" className="text-white/80 hover:text-white transition-colors">Administration</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-sm text-center md:text-left">
            &copy; {currentYear} PRISMA GESTION. Tous droits réservés.
          </p>
          <div className="md:mt-0">
            <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
