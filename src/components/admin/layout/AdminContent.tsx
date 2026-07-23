
import { memo } from 'react';
import DashboardPanel from '../DashboardPanel';
import MessagesPanel from '../MessagesPanel';
import SubscribersPanel from '../SubscribersPanel';
import BlogPanel from '../BlogPanel';
import ServicesPanel from '../ServicesPanel';
import HomePanel from '../HomePanel';
import UsersPanel from '../UsersPanel';
import AnalyticsPanel from '../analytics/AnalyticsPanel';
import MediaPanel from '../MediaPanel';
import SEOPanel from '../SEOPanel';
import SecurityPanel from '../SecurityPanel';
import BackupPanel from '../BackupPanel';

interface AdminContentProps {
  activeTab: string;
  activeMessageTab: string;
  setActiveMessageTab: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
}

const AdminContentComponent = ({
  activeTab,
  activeMessageTab,
  setActiveMessageTab,
  setActiveTab
}: AdminContentProps) => {
  const handleDashboardNavigate = (tab: string, messageTab?: string) => {
    setActiveTab?.(tab);
    if (messageTab) {
      // Laisser le temps au MessagesPanel de se monter avant de cibler son onglet
      // (même mécanisme que les notifications de l'AdminHeader).
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('message-tab-navigate', { detail: messageTab }));
      }, 100);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPanel onNavigate={handleDashboardNavigate} />;
      case "messages":
        return <MessagesPanel />;
      case "leads":
        return <SubscribersPanel />;
      case "blog":
        return <BlogPanel />;
      case "services":
        return <ServicesPanel />;
      case "home":
      case "homepage":
        return <HomePanel />;
      case "users":
        return <UsersPanel />;
      case "analytics":
        return <AnalyticsPanel />;
      case "media":
        return <MediaPanel />;
      case "seo":
        return <SEOPanel />;
      case "security":
        return <SecurityPanel />;
      case "backup":
        return <BackupPanel />;
      default:
        return <DashboardPanel onNavigate={handleDashboardNavigate} />;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-4">
        {renderContent()}
      </div>
    </div>
  );
};

export const AdminContent = memo(AdminContentComponent);
