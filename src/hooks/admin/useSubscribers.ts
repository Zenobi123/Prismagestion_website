import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriberRow {
  id: string;
  email: string;
  source: string;
  context: string | null;
  consent: boolean;
  read: boolean;
  created_at: string;
}

const QUERY_KEY = ['admin-newsletter-subscribers'];

/**
 * Accès admin aux leads captés sur le site (`newsletter_subscribers`).
 * Lecture, marquage lu/non-lu et suppression, avec invalidation du cache.
 */
export const useSubscribers = () => {
  const queryClient = useQueryClient();

  const query = useQuery<SubscriberRow[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, source, context, consent, read, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SubscriberRow[];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const subscribers = useMemo(() => query.data ?? [], [query.data]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const stats = useMemo(() => {
    const bySource = new Map<string, number>();
    let unread = 0;
    for (const s of subscribers) {
      bySource.set(s.source, (bySource.get(s.source) ?? 0) + 1);
      if (!s.read) unread += 1;
    }
    return {
      total: subscribers.length,
      unread,
      sources: Array.from(bySource.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [subscribers]);

  const markRead = async (id: string, read: boolean) => {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ read })
      .eq('id', id);
    if (error) throw error;
    await invalidate();
  };

  const remove = async (id: string) => {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await invalidate();
  };

  return {
    subscribers,
    stats,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
    markRead,
    remove,
  };
};
