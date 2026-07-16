
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { cacheService } from "@/services/cacheService";

// Durée de validité du cache (en ms) - 2 minutes pour les sections
const CACHE_DURATION = 2 * 60 * 1000;

// Définition des types pour chaque section
export interface HeroSectionContent {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface AboutSectionContent {
  title: string;
  paragraph1: string;
  paragraph2: string;
  advantages: string[];
  buttonText: string;
  buttonLink: string;
  image: string;
}

export interface ContactSectionContent {
  title: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  formTitle: string;
  formDescription: string;
}

export type SectionContent = HeroSectionContent | AboutSectionContent | ContactSectionContent;

function getTypedContent<T>(content: Json | null): T | null {
  if (!content) return null;
  
  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    return content as unknown as T;
  }
  
  console.error("Le contenu récupéré n'est pas du type attendu:", content);
  return null;
}

export async function getSectionContent<T extends SectionContent>(sectionId: string): Promise<T | null> {
  const cacheKey = `section:${sectionId}`;
  
  // Vérifier le cache optimisé
  const cachedSection = cacheService.get<T>(cacheKey);
  if (cachedSection) {
    console.log(`Cache hit pour la section ${sectionId}`);
    return cachedSection;
  }
  
  try {
    console.log(`Récupération des données pour la section ${sectionId} depuis Supabase`);
    const { data, error } = await supabase
      .from("site_sections")
      .select("content")
      .eq("id", sectionId)
      .maybeSingle();

    if (error) {
      console.error(`Erreur récupération section [${sectionId}] :`, error);
      return null;
    }
    
    if (!data) {
      console.log(`Aucune donnée trouvée pour la section ${sectionId}`);
      return null;
    }
    
    const typedContent = getTypedContent<T>(data.content);
    
    // Mettre à jour le cache optimisé
    if (typedContent) {
      console.log(`Mise en cache pour ${sectionId}:`, typedContent);
      cacheService.set(cacheKey, typedContent, CACHE_DURATION);
    }
    
    return typedContent;
  } catch (error) {
    console.error(`Erreur inattendue lors de la récupération de la section [${sectionId}] :`, error);
    throw error;
  }
}

export async function updateSectionContent(sectionId: string, content: SectionContent) {
  try {
    console.log(`Début de la mise à jour pour la section ${sectionId} avec:`, content);
    
    const jsonContent = content as unknown as Json;
    
    // upsert : crée la ligne si elle n'existe pas encore (un simple update
    // serait silencieusement sans effet sur une section jamais enregistrée).
    const { data, error } = await supabase
      .from("site_sections")
      .upsert({ id: sectionId, content: jsonContent })
      .select();
    
    if (error) {
      console.error(`Erreur lors de la mise à jour de la section ${sectionId}:`, error);
      throw error;
    }
    
    console.log(`Mise à jour réussie pour ${sectionId}, résultat:`, data);
    
    // Invalider le cache pour cette section
    const cacheKey = `section:${sectionId}`;
    cacheService.invalidate(cacheKey);
    
    return data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la section ${sectionId}:`, error);
    throw error;
  }
}

export function clearSectionsCache(sectionId?: string) {
  if (sectionId) {
    console.log(`Vidage du cache pour la section ${sectionId}`);
    const cacheKey = `section:${sectionId}`;
    cacheService.invalidate(cacheKey);
  } else {
    console.log("Vidage du cache des sections");
    cacheService.invalidatePattern('section:');
  }
}
