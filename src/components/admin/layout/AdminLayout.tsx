
import { useState, lazy, Suspense, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { AdminTabsLoader } from "./AdminTabsLoader";
import { AdminContent } from "./AdminContent";
import { LogoutDialog } from "./LogoutDialog";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AdminPerformanceMonitor } from "./AdminPerformanceMonitor";
import { RealtimeService } from "@/services/realtimeService";
import { cacheService } from "@/services/cacheService";
import { supabase } from "@/integrations/supabase/client";

// Lazy load components with preloading
const AdminAppSidebar = lazy(() => import("@/components/admin/AdminAppSidebar"));
const AdminHeader = lazy(() => import("@/components/admin/AdminHeader"));

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeMessageTab, setActiveMessageTab] = useState("contacts");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { toast } = useToast();

  // Initialize cache service
  useEffect(() => {
    cacheService.startCleanupInterval();

    return () => {
      RealtimeService.unsubscribeAll();
      cacheService.clear();
    };
  }, []);

  // Navigation entre sections émise par l'en-tête, le tableau de bord ou les
  // raccourcis des panneaux (événement 'admin-navigate').
  useEffect(() => {
    const handleAdminNavigate = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (typeof detail === 'string' && detail) {
        setActiveTab(detail);
      }
    };

    document.addEventListener('admin-navigate', handleAdminNavigate);
    return () => document.removeEventListener('admin-navigate', handleAdminNavigate);
  }, []);

  const handleLogout = useCallback(() => {
    setShowLogoutDialog(true);
  }, []);

  const confirmLogout = useCallback(async (goToHome = false) => {
    // Use Supabase logout instead of localStorage
    await supabase.auth.signOut();
    
    // Complete cleanup
    RealtimeService.unsubscribeAll();
    cacheService.clear();
    
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
    
    // Navigate to home page after logout
    navigate('/');
    setShowLogoutDialog(false);
  }, [navigate, toast]);

  const handleTabChange = useCallback((newTab: string) => {
    if (newTab !== activeTab) {
      console.log('Tab change:', newTab);
      setActiveTab(newTab);
    }
  }, [activeTab]);

  // Memoize props to avoid re-renders
  const adminContentProps = useMemo(() => ({
    activeTab,
    activeMessageTab,
    setActiveMessageTab,
    setActiveTab: handleTabChange
  }), [activeTab, activeMessageTab, handleTabChange]);

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50 transition-colors duration-200">
          <Suspense fallback={
            <div className="w-64 bg-[#2E1A47] animate-pulse">
              <div className="h-16 bg-[#2E1A47]/20 m-4 rounded"></div>
              <div className="space-y-2 px-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 bg-[#2E1A47]/20 rounded"></div>
                ))}
              </div>
            </div>
          }>
            <AdminAppSidebar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange} 
              onLogout={handleLogout} 
            />
          </Suspense>

          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 p-2 bg-white border-b border-gray-200 transition-all duration-200">
              <SidebarTrigger className="transition-transform duration-200 hover:scale-105" />
              <Suspense fallback={
                <div className="h-12 flex-1 bg-gray-100 animate-pulse rounded"></div>
              }>
                <AdminHeader onLogout={handleLogout} />
              </Suspense>
            </div>

            <main className="flex-1 overflow-y-auto bg-gray-50">
              <div className="min-h-full p-4 transition-all duration-300">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full">
                  <div className="h-full">
                    <AdminContent {...adminContentProps} />
                  </div>
                </Tabs>
              </div>
            </main>
          </div>
        </div>

        <LogoutDialog 
          open={showLogoutDialog} 
          onOpenChange={setShowLogoutDialog}
          confirmLogout={confirmLogout}
        />

        <AdminPerformanceMonitor />
      </SidebarProvider>
    </ErrorBoundary>
  );
};
