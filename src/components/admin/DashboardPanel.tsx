
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  CalendarClock,
  ChevronRight,
  FileText,
  Image,
  Mail,
  PenSquare,
  Briefcase,
  Inbox,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard, ActivityType } from "@/hooks/useDashboard";

// Palette catégorielle du graphique (validée CVD sur fond blanc) :
// violet = messages, ambre = devis, bleu = rendez-vous.
const SERIES_COLORS = {
  contacts: "#7C5CBF",
  devis: "#eda100",
  rendezVous: "#2a78d6",
} as const;

const ACTIVITY_ICONS: Record<ActivityType, { icon: typeof Mail; className: string }> = {
  contact: { icon: Mail, className: "bg-[#7C5CBF]/10 text-[#7C5CBF]" },
  quote: { icon: FileText, className: "bg-[#eda100]/10 text-[#b57b00]" },
  appointment: { icon: Calendar, className: "bg-[#2a78d6]/10 text-[#2a78d6]" },
  blog: { icon: BookOpen, className: "bg-gray-100 text-gray-600" },
};

type DashboardPanelProps = {
  onNavigate?: (tab: string, messageTab?: string) => void;
};

const DashboardPanel = ({ onNavigate }: DashboardPanelProps) => {
  const { stats, monthlyActivity, recentActivities, upcomingAppointments, isLoading } = useDashboard();

  const goTo = (tab: string, messageTab?: string) => {
    onNavigate?.(tab, messageTab);
  };

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statsCards = [
    {
      title: "Messages",
      value: stats.contacts.total,
      sub:
        stats.contacts.unread > 0
          ? `${stats.contacts.unread} non lu${stats.contacts.unread > 1 ? "s" : ""}`
          : "Tout est lu",
      highlight: stats.contacts.unread > 0,
      icon: Mail,
      iconClass: "bg-[#7C5CBF]",
      onClick: () => goTo("messages", "contacts"),
    },
    {
      title: "Devis",
      value: stats.quotes.total,
      sub:
        stats.quotes.unread > 0
          ? `${stats.quotes.unread} non lu${stats.quotes.unread > 1 ? "s" : ""}`
          : "Tout est lu",
      highlight: stats.quotes.unread > 0,
      icon: FileText,
      iconClass: "bg-[#b57b00]",
      onClick: () => goTo("messages", "quotes"),
    },
    {
      title: "Rendez-vous",
      value: stats.appointments.total,
      sub:
        stats.appointments.pending > 0
          ? `${stats.appointments.pending} en attente`
          : "Aucun en attente",
      highlight: stats.appointments.pending > 0,
      icon: Calendar,
      iconClass: "bg-[#2a78d6]",
      onClick: () => goTo("messages", "appointments"),
    },
    {
      title: "Articles",
      value: stats.articles.total,
      sub: `${stats.articles.published} publié${stats.articles.published > 1 ? "s" : ""}${
        stats.articles.drafts > 0 ? `, ${stats.articles.drafts} brouillon${stats.articles.drafts > 1 ? "s" : ""}` : ""
      }`,
      highlight: false,
      icon: BookOpen,
      iconClass: "bg-[#2E1A47]",
      onClick: () => goTo("blog"),
    },
  ];

  const pendingItems = [
    {
      label: "Messages de contact non lus",
      count: stats.contacts.unread,
      onClick: () => goTo("messages", "contacts"),
    },
    {
      label: "Demandes de devis non lues",
      count: stats.quotes.unread,
      onClick: () => goTo("messages", "quotes"),
    },
    {
      label: "Rendez-vous à confirmer",
      count: stats.appointments.pending,
      onClick: () => goTo("messages", "appointments"),
    },
    {
      label: "Articles en brouillon",
      count: stats.articles.drafts,
      onClick: () => goTo("blog"),
    },
  ].filter((item) => item.count > 0);

  const hasChartData = monthlyActivity.some(
    (month) => month.contacts + month.devis + month.rendezVous > 0
  );

  const quickActions = [
    { label: "Nouvel article", icon: PenSquare, onClick: () => goTo("blog") },
    { label: "Messages", icon: Inbox, onClick: () => goTo("messages") },
    { label: "Services", icon: Briefcase, onClick: () => goTo("services") },
    { label: "Médias", icon: Image, onClick: () => goTo("media") },
  ];

  const formatAppointmentDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[#2E1A47]">Tableau de bord</h2>
          <p className="text-gray-500">Bienvenue dans l'administration de PRISMA GESTION</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-prisma-purple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête + actions rapides */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#2E1A47]">Tableau de bord</h2>
          <p className="text-gray-500">
            {today.charAt(0).toUpperCase() + today.slice(1)} — vue d'ensemble de PRISMA GESTION
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="border-gray-200 text-[#2E1A47] hover:bg-[#2E1A47] hover:text-white"
            >
              <action.icon size={16} className="mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-[#2E1A47]/30"
          >
            <button
              type="button"
              onClick={stat.onClick}
              className="w-full text-left focus:outline-none"
              aria-label={`${stat.title} : ${stat.value} — ${stat.sub}`}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-[#2E1A47]">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.highlight ? "font-semibold text-[#b57b00]" : "text-gray-400"}`}>
                    {stat.sub}
                  </p>
                </div>
                <div className={`${stat.iconClass} p-3 rounded-full shrink-0`}>
                  <stat.icon className="text-white" size={22} />
                </div>
              </CardContent>
            </button>
          </Card>
        ))}
      </div>

      {/* Graphique d'activité + éléments à traiter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité des 6 derniers mois</CardTitle>
            <CardDescription>
              Messages, demandes de devis et rendez-vous reçus chaque mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyActivity}>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: "#d1d5db" }}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={32}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: "rgba(46, 26, 71, 0.05)" }} />
                    <Legend iconType="circle" iconSize={9} />
                    <Bar
                      dataKey="contacts"
                      name="Messages"
                      stackId="volume"
                      maxBarSize={36}
                      fill={SERIES_COLORS.contacts}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <Bar
                      dataKey="devis"
                      name="Devis"
                      stackId="volume"
                      maxBarSize={36}
                      fill={SERIES_COLORS.devis}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <Bar
                      dataKey="rendezVous"
                      name="Rendez-vous"
                      stackId="volume"
                      maxBarSize={36}
                      fill={SERIES_COLORS.rendezVous}
                      stroke="#ffffff"
                      strokeWidth={2}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                  <Inbox size={32} className="mb-2 text-gray-300" />
                  <p className="font-medium">Aucune activité sur les 6 derniers mois</p>
                  <p className="text-sm">
                    Les messages, devis et rendez-vous reçus apparaîtront ici.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>À traiter</CardTitle>
            <CardDescription>Éléments en attente d'une action</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingItems.length > 0 ? (
              <ul className="space-y-2">
                {pendingItems.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-100 p-3 text-left text-sm transition-colors hover:border-[#2E1A47]/30 hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{item.label}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Badge className="bg-[#2E1A47] text-white hover:bg-[#2E1A47]">{item.count}</Badge>
                        <ChevronRight size={16} className="text-gray-400" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p className="font-medium text-[#2E1A47]">Tout est à jour</p>
                <p className="text-sm">Aucun message, devis ou rendez-vous en attente.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activités récentes + prochains rendez-vous */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {recentActivities.map((activity) => {
                  const { icon: Icon, className } = ACTIVITY_ICONS[activity.type];
                  return (
                    <li key={activity.id} className="flex items-start gap-3">
                      <span className={`mt-0.5 p-2 rounded-full shrink-0 ${className}`}>
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 break-words">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>Aucune activité récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochains rendez-vous</CardTitle>
            <CardDescription>Rendez-vous à venir, confirmés ou en attente</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <ul className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="p-2 rounded-full bg-[#2a78d6]/10 text-[#2a78d6] shrink-0">
                        <CalendarClock size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{appointment.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {formatAppointmentDate(appointment.date)} à {appointment.time}
                          {appointment.subject ? ` — ${appointment.subject}` : ""}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        appointment.status === "confirmed"
                          ? "border-green-200 bg-green-50 text-green-700 shrink-0"
                          : "border-amber-200 bg-amber-50 text-amber-700 shrink-0"
                      }
                    >
                      {appointment.status === "confirmed" ? "Confirmé" : "En attente"}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>Aucun rendez-vous à venir</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goTo("messages", "appointments")}
              className="mt-4 w-full text-[#2E1A47] hover:bg-gray-50"
            >
              Gérer les rendez-vous
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPanel;
