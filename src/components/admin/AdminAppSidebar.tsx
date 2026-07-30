
import {
  Home,
  Users,
  BookOpen,
  Briefcase,
  MessageSquare,
  Image,
  Search,
  LogOut,
  Globe,
  Shield,
  BarChart3,
  HardDrive,
  UserPlus,
  Building2,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type AdminAppSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
};

const AdminAppSidebar = ({ activeTab, setActiveTab, onLogout }: AdminAppSidebarProps) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: Home },
    { id: "homepage", label: "Page d'accueil", icon: Globe },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "blog", label: "Blog", icon: BookOpen },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "media", label: "Médias", icon: Image },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "leads", label: "Abonnés & Leads", icon: UserPlus },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "backup", label: "Sauvegarde", icon: HardDrive },
    { id: "seo", label: "SEO", icon: Search },
  ];

  return (
    <Sidebar className="border-r border-gray-200 bg-[#2E1A47]">
      <SidebarContent className="bg-[#2E1A47]">
        <div className="p-4 flex items-center justify-center border-b border-[#2E1A47]/30">
          <span className="text-[#D6DD00] font-bold text-2xl">PRISMA</span>
          <span className="text-white font-medium text-xl ml-2">Admin</span>
        </div>

        {/* Placé en tête, avant la navigation du site : la console est
            l'outil de travail quotidien du cabinet, et les douze entrées
            qui suivent débordent de l'écran. En bas de liste, elle n'était
            atteignable qu'en faisant défiler la barre — donc invisible. */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60">Cabinet</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/admin/gestion')}
                  className="group flex items-center w-full p-3 rounded-lg text-sm bg-white/10 text-[#D6DD00] hover:bg-white/20 transition-colors"
                >
                  <Building2 size={18} className="mr-3" />
                  <span className="flex-1 text-left font-medium">Gestion du cabinet</span>
                  <ArrowRight
                    size={14}
                    className="opacity-60 transition-transform group-hover:translate-x-0.5"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      flex items-center w-full p-3 rounded-lg text-sm transition-colors
                      ${activeTab === item.id
                        ? "bg-white/10 text-[#D6DD00]"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    <item.icon size={18} className="mr-3" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-[#2E1A47]/30">
          <SidebarMenuButton
            onClick={onLogout}
            className="flex items-center w-full p-3 rounded-lg text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Déconnexion
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminAppSidebar;
