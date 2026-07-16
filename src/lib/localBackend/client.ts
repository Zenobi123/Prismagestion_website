// Client local compatible avec l'API de supabase-js.
// Toutes les données vivent dans le navigateur (localStorage) :
// le site fonctionne intégralement sans backend.

import { localAuth, seedDefaultAdmin } from './auth';
import { LocalQueryBuilder } from './queryBuilder';
import { LocalChannel } from './realtime';
import { readTable } from './store';
import { localStorageApi } from './storage';

export type { User, Session, AuthChangeEvent, AuthError, RealtimePayload } from './types';
export { DEFAULT_ADMIN } from './auth';

// Fonctions RPC répliquées localement.
const rpcHandlers: Record<string, (args: Record<string, unknown>) => unknown> = {
  get_default_image_for_blog_title: (args) => {
    const title = String(args?.title_to_check ?? '').toLowerCase();
    if (!title) return null;

    const mappings = readTable('blog_image_mappings');
    const match = mappings.find((row) => {
      const pattern = String(row.title_pattern ?? '').toLowerCase();
      return pattern && title.includes(pattern);
    });
    return match ? (match.image_path as string) : null;
  },
};

class LocalBackendClient {
  auth = localAuth;
  storage = localStorageApi;
  private channels = new Set<LocalChannel>();

  from(table: string) {
    return new LocalQueryBuilder(table);
  }

  async rpc(fn: string, args: Record<string, unknown> = {}) {
    const handler = rpcHandlers[fn];
    if (!handler) {
      return {
        data: null,
        error: { message: `Fonction RPC locale inconnue: ${fn}`, code: 'LOCAL_RPC_404', details: null, hint: null },
      };
    }
    try {
      return { data: handler(args), error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'LOCAL_RPC_ERROR',
          details: null,
          hint: null,
        },
      };
    }
  }

  channel(name: string) {
    const channel = new LocalChannel(name);
    this.channels.add(channel);
    return channel;
  }

  removeChannel(channel: LocalChannel | null | undefined) {
    if (channel && typeof channel.unsubscribe === 'function') {
      channel.unsubscribe();
    }
    if (channel) {
      this.channels.delete(channel);
    }
    return Promise.resolve('ok');
  }

  removeAllChannels() {
    this.channels.forEach((channel) => channel.unsubscribe());
    this.channels.clear();
    return Promise.resolve(['ok']);
  }
}

seedDefaultAdmin();

export const localBackendClient = new LocalBackendClient();
