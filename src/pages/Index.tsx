
import { useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import OffersSection from '@/components/OffersSection';
import DigitalExpertiseSection from '@/components/DigitalExpertiseSection';
import ServicesSection from '@/components/ServicesSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Chatbot from '@/components/chatbot/Chatbot';
import { setupStorageListener } from '@/utils/contact/supabase';
import { useHomeContentManager } from '@/hooks/useHomeContentManager';
import { BlogManagementService } from '@/services/blogManagementService';
import { AnalyticsService } from '@/services/analyticsService';
import { usePageMetadata } from '@/hooks/usePageMetadata';

const Index = () => {
  const { initializeContentManager, cleanup, dispatchUpdateEvent } = useHomeContentManager();

  usePageMetadata({
    title: "PRISMA GESTION | Cabinet de services professionnels",
    description: "PRISMA GESTION accompagne entreprises et indépendants en comptabilité, fiscalité et finance, et pilote leurs projets de génie logiciel et d'intelligence artificielle : conseil, développement sur mesure, choix et paramétrage des modèles d'IA.",
    keywords: ["expertise comptable", "fiscalité", "conseil financier", "génie logiciel", "intelligence artificielle", "PRISMA", "services professionnels"],
    canonicalUrl: window.location.origin + "/"
  });

  useEffect(() => {
    // Initialize analytics
    AnalyticsService.initialize();

    const cleanupStorage = setupStorageListener();

    const initializeApp = async () => {
      // Perform blog maintenance tasks
      await BlogManagementService.performMaintenanceTasks();
      
      // Ensure required articles exist
      const articleCreated = await BlogManagementService.ensureRequiredArticles();
      
      // Initialize content manager
      initializeContentManager();
      
      // If new article was created, trigger immediate update
      if (articleCreated) {
        dispatchUpdateEvent();
      }
    };

    initializeApp();

    return () => {
      cleanupStorage();
      cleanup();
    };
  }, [initializeContentManager, cleanup, dispatchUpdateEvent]);

  return (
    <div className="min-h-screen">
      <SEOHead
        config={{
          title: "PRISMA GESTION | Cabinet de services professionnels",
          description: "PRISMA GESTION accompagne entreprises et indépendants en comptabilité, fiscalité et finance, et pilote leurs projets de génie logiciel et d'intelligence artificielle : conseil, développement sur mesure, choix et paramétrage des modèles d'IA.",
          keywords: ["expertise comptable", "fiscalité", "conseil financier", "génie logiciel", "intelligence artificielle", "PRISMA", "services professionnels"],
          canonicalUrl: window.location.origin + "/"
        }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <OffersSection />
        <DigitalExpertiseSection />
        <ServicesSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
