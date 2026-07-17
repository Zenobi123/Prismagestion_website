
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatActivityTime } from "./dashboard/formatActivityTime";
import { useOptimizedQuery } from "./useOptimizedQuery";

interface BlogPostRow {
  id: number;
  title: string;
  status: string;
  created_at: string;
}

interface ContactMessageRow {
  id: string;
  first_name: string;
  last_name: string;
  subject: string;
  read: boolean;
  date: string;
}

interface QuoteRequestRow {
  id: string;
  full_name: string;
  service: string | null;
  read: boolean;
  created_at: string;
}

interface AppointmentRow {
  id: string;
  full_name: string;
  subject: string;
  status: string;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
}

export type ActivityType = "blog" | "contact" | "quote" | "appointment";

export interface RecentActivity {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
  timestamp: number;
}

export interface UpcomingAppointment {
  id: string;
  fullName: string;
  subject: string;
  date: string;
  time: string;
  status: string;
}

export interface MonthlyActivityPoint {
  name: string;
  contacts: number;
  devis: number;
  rendezVous: number;
}

export interface DashboardStats {
  contacts: { total: number; unread: number };
  quotes: { total: number; unread: number };
  appointments: { total: number; pending: number };
  articles: { total: number; published: number; drafts: number };
}

const toTimestamp = (value: string | null | undefined): number => {
  if (!value) return NaN;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? NaN : time;
};

export const useDashboard = () => {
  const postsQuery = useOptimizedQuery<BlogPostRow[]>({
    queryKey: ["dashboard-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlogPostRow[];
    },
    tableName: "blog_posts",
  });

  const contactsQuery = useOptimizedQuery<ContactMessageRow[]>({
    queryKey: ["dashboard-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id, first_name, last_name, subject, read, date")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContactMessageRow[];
    },
    tableName: "contact_messages",
  });

  const quotesQuery = useOptimizedQuery<QuoteRequestRow[]>({
    queryKey: ["dashboard-quote-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("id, full_name, service, read, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QuoteRequestRow[];
    },
    tableName: "quote_requests",
  });

  const appointmentsQuery = useOptimizedQuery<AppointmentRow[]>({
    queryKey: ["dashboard-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, full_name, subject, status, appointment_date, appointment_time, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AppointmentRow[];
    },
    tableName: "appointments",
  });

  const posts = useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
  const contacts = useMemo(() => contactsQuery.data ?? [], [contactsQuery.data]);
  const quotes = useMemo(() => quotesQuery.data ?? [], [quotesQuery.data]);
  const appointments = useMemo(() => appointmentsQuery.data ?? [], [appointmentsQuery.data]);

  const stats: DashboardStats = useMemo(() => {
    const published = posts.filter((post) => post.status === "Publié").length;
    return {
      contacts: {
        total: contacts.length,
        unread: contacts.filter((message) => !message.read).length,
      },
      quotes: {
        total: quotes.length,
        unread: quotes.filter((quote) => !quote.read).length,
      },
      appointments: {
        total: appointments.length,
        pending: appointments.filter((appointment) => appointment.status === "pending").length,
      },
      articles: {
        total: posts.length,
        published,
        drafts: posts.length - published,
      },
    };
  }, [posts, contacts, quotes, appointments]);

  // Volume mensuel réel des 6 derniers mois, calculé depuis les horodatages.
  const monthlyActivity: MonthlyActivityPoint[] = useMemo(() => {
    const now = new Date();
    const months: (MonthlyActivityPoint & { key: string })[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthStart.toLocaleDateString("fr-FR", { month: "short" });
      months.push({
        key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
        name: label.charAt(0).toUpperCase() + label.slice(1),
        contacts: 0,
        devis: 0,
        rendezVous: 0,
      });
    }

    const bump = (dateString: string | null | undefined, field: "contacts" | "devis" | "rendezVous") => {
      const timestamp = toTimestamp(dateString);
      if (Number.isNaN(timestamp)) return;
      const date = new Date(timestamp);
      const month = months.find((m) => m.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (month) month[field] += 1;
    };

    contacts.forEach((message) => bump(message.date, "contacts"));
    quotes.forEach((quote) => bump(quote.created_at, "devis"));
    appointments.forEach((appointment) => bump(appointment.created_at, "rendezVous"));

    return months.map(({ key: _key, ...point }) => point);
  }, [contacts, quotes, appointments]);

  const recentActivities: RecentActivity[] = useMemo(() => {
    const activities: RecentActivity[] = [];

    posts.slice(0, 5).forEach((post) => {
      const timestamp = toTimestamp(post.created_at);
      if (Number.isNaN(timestamp)) return;
      const action = post.status === "Publié" ? "publié" : "créé";
      activities.push({
        id: `blog-${post.id}`,
        type: "blog",
        message: `Article « ${post.title} » ${action}`,
        time: formatActivityTime(post.created_at),
        timestamp,
      });
    });

    contacts.slice(0, 5).forEach((message) => {
      const timestamp = toTimestamp(message.date);
      if (Number.isNaN(timestamp)) return;
      activities.push({
        id: `contact-${message.id}`,
        type: "contact",
        message: `Message de ${message.first_name} ${message.last_name}${message.subject ? ` — ${message.subject}` : ""}`,
        time: formatActivityTime(message.date),
        timestamp,
      });
    });

    quotes.slice(0, 5).forEach((quote) => {
      const timestamp = toTimestamp(quote.created_at);
      if (Number.isNaN(timestamp)) return;
      activities.push({
        id: `quote-${quote.id}`,
        type: "quote",
        message: `Demande de devis de ${quote.full_name}${quote.service ? ` (${quote.service})` : ""}`,
        time: formatActivityTime(quote.created_at),
        timestamp,
      });
    });

    appointments.slice(0, 5).forEach((appointment) => {
      const timestamp = toTimestamp(appointment.created_at);
      if (Number.isNaN(timestamp)) return;
      activities.push({
        id: `appointment-${appointment.id}`,
        type: "appointment",
        message: `Rendez-vous demandé par ${appointment.full_name}${appointment.subject ? ` — ${appointment.subject}` : ""}`,
        time: formatActivityTime(appointment.created_at),
        timestamp,
      });
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [posts, contacts, quotes, appointments]);

  const upcomingAppointments: UpcomingAppointment[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments
      .filter((appointment) => appointment.status === "pending" || appointment.status === "confirmed")
      .filter((appointment) => {
        const date = new Date(`${appointment.appointment_date}T00:00:00`);
        return !Number.isNaN(date.getTime()) && date >= today;
      })
      .sort((a, b) => {
        const byDate = a.appointment_date.localeCompare(b.appointment_date);
        return byDate !== 0 ? byDate : a.appointment_time.localeCompare(b.appointment_time);
      })
      .slice(0, 5)
      .map((appointment) => ({
        id: appointment.id,
        fullName: appointment.full_name,
        subject: appointment.subject,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        status: appointment.status,
      }));
  }, [appointments]);

  const isLoading =
    postsQuery.isLoading || contactsQuery.isLoading || quotesQuery.isLoading || appointmentsQuery.isLoading;

  return { stats, monthlyActivity, recentActivities, upcomingAppointments, isLoading };
};
