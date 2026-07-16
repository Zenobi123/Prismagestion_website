// Canaux "temps réel" locaux : reproduisent l'API channel().on('postgres_changes', ...)
// de supabase-js en s'appuyant sur les événements émis par le store local.

import { onTableChange } from './store';
import type { RealtimePayload } from './types';

interface ChannelBinding {
  event: string; // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  table?: string;
  callback: (payload: RealtimePayload) => void;
}

export class LocalChannel {
  readonly name: string;
  private bindings: ChannelBinding[] = [];
  private detach: (() => void) | null = null;

  constructor(name: string) {
    this.name = name;
  }

  on(
    _type: string,
    filter: { event?: string; schema?: string; table?: string },
    callback: (payload: RealtimePayload) => void
  ) {
    this.bindings.push({
      event: filter?.event ?? '*',
      table: filter?.table,
      callback,
    });
    return this;
  }

  subscribe(statusCallback?: (status: string) => void) {
    if (!this.detach) {
      this.detach = onTableChange((payload) => {
        this.bindings.forEach((binding) => {
          const eventMatches = binding.event === '*' || binding.event === payload.eventType;
          const tableMatches = !binding.table || binding.table === payload.table;
          if (eventMatches && tableMatches) {
            binding.callback(payload);
          }
        });
      });
    }
    statusCallback?.('SUBSCRIBED');
    return this;
  }

  unsubscribe() {
    this.detach?.();
    this.detach = null;
    return Promise.resolve('ok');
  }
}
