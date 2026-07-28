
import { useState, useCallback } from 'react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const PREDEFINED_RESPONSES = {
  services: `PRISMA GESTION offre plusieurs services :

📊 **Expertise Comptable**
- Tenue de comptabilité
- Établissement des comptes annuels
- Conseils comptables

💰 **Fiscalité**
- Déclarations fiscales
- Optimisation fiscale
- Conseil en fiscalité

📈 **Conseil Financier**
- Analyse financière
- Prévisions budgétaires
- Conseil en gestion

👥 **Ressources Humaines**
- Paie et charges sociales
- Conseil RH

💻 **Génie Logiciel & Intelligence Artificielle**
- Conseil et orientation logicielle
- Développement d'applications métier
- Choix, mise en place et paramétrage des modèles d'IA

Souhaitez-vous plus d'informations sur un service en particulier ?`,

  numerique: `Le pôle **Génie logiciel & Intelligence artificielle** de PRISMA GESTION couvre trois métiers :

🧭 **Conseil & orientation logicielle**
- Audit de vos outils et de vos processus
- Cahier des charges et comparatif des solutions
- Plan de migration et accompagnement au déploiement

💻 **Conception & développement**
- Applications métier web et mobiles
- Automatisation des tâches répétitives
- Intégrations, tableaux de bord et maintenance

🤖 **Intelligence artificielle appliquée**
- Identification des cas d'usage réellement rentables
- Choix du modèle (propriétaire ou open source, cloud ou local)
- Preuve de concept, mise en place et paramétrage sur vos données
- Formation de vos équipes et supervision dans la durée

👉 Détails, méthode et cas d'usage : **/expertise/ia-et-genie-logiciel**
📅 Nous proposons un atelier découverte de 45 minutes, offert et sans engagement.`,

  contact: `Vous pouvez nous contacter de plusieurs façons :

📧 **Email :** obiangtimenathan@gmail.com
📱 **WhatsApp :** +237 694 310 554
📍 **Adresse :** Yaoundé, Cameroun

🕒 **Horaires :**
Lundi - Vendredi : 8h00 - 18h00

Vous pouvez également utiliser notre formulaire de contact sur le site pour nous envoyer un message détaillé.`,

  devis: `Pour obtenir un devis personnalisé :

1. **Utilisez notre formulaire de devis** en cliquant sur "Demander un devis"
2. **Décrivez votre besoin** en détail
3. **Nos experts vous répondront** dans les 24h

Ou contactez-nous directement :
📧 obiangtimenathan@gmail.com
📱 WhatsApp : +237 694 310 554

Quel service vous intéresse le plus ?`,

  default: `Je suis là pour vous aider ! Voici ce que je peux faire :

✅ Vous renseigner sur nos services
✅ Vous présenter notre pôle IA & génie logiciel
✅ Vous donner nos coordonnées
✅ Vous guider pour une demande de devis
✅ Répondre à vos questions générales

N'hésitez pas à me poser une question spécifique !`
};

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateResponse = useCallback((userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Pôle numérique : génie logiciel & intelligence artificielle
    // (testé avant les services pour ne pas être capté par « conseil »)
    if (
      /\bia\b/.test(message) ||
      message.includes('intelligence artificielle') ||
      message.includes('logiciel') ||
      message.includes('application') ||
      message.includes('automatis') ||
      message.includes('numérique') ||
      message.includes('digital') ||
      message.includes('informatique') ||
      message.includes('développement') ||
      message.includes('chatbot')
    ) {
      return PREDEFINED_RESPONSES.numerique;
    }

    // Services
    if (message.includes('service') || message.includes('comptab') || message.includes('fiscal') || message.includes('conseil')) {
      return PREDEFINED_RESPONSES.services;
    }
    
    // Contact
    if (message.includes('contact') || message.includes('téléphone') || message.includes('email') || message.includes('adresse')) {
      return PREDEFINED_RESPONSES.contact;
    }
    
    // Devis
    if (message.includes('devis') || message.includes('prix') || message.includes('tarif') || message.includes('coût')) {
      return PREDEFINED_RESPONSES.devis;
    }
    
    // Salutations
    if (message.includes('bonjour') || message.includes('salut') || message.includes('hello')) {
      return `Bonjour ! Bienvenue chez PRISMA GESTION. ${PREDEFINED_RESPONSES.default}`;
    }
    
    // Horaires
    if (message.includes('horaire') || message.includes('ouvert') || message.includes('heure')) {
      return `Nos horaires d'ouverture :
🕒 Lundi - Vendredi : 8h00 - 18h00
📍 Yaoundé, Cameroun

Nous sommes également joignables par email 24h/7j !`;
    }
    
    // Localisation
    if (message.includes('où') || message.includes('adresse') || message.includes('yaoundé') || message.includes('cameroun')) {
      return `📍 **Notre localisation :**
Yaoundé, Cameroun

Nous servons tout le Cameroun et pouvons travailler à distance pour de nombreux services. Contactez-nous pour discuter de vos besoins spécifiques !`;
    }
    
    return PREDEFINED_RESPONSES.default;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const botResponse: Message = {
      id: `bot-${Date.now()}`,
      text: generateResponse(text),
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
    setIsLoading(false);
  }, [generateResponse]);

  return {
    messages,
    sendMessage,
    isLoading
  };
};
