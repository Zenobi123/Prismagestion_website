// Types minimaux compatibles avec ceux de @supabase/supabase-js,
// utilisés par le backend local (sans serveur).

export interface User {
  id: string;
  email: string;
  created_at: string;
  [key: string]: unknown;
}

export interface Session {
  access_token: string;
  token_type: string;
  user: User;
}

export type AuthChangeEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED';

export interface AuthError {
  name: string;
  message: string;
  status?: number;
}

export interface PostgrestError {
  message: string;
  code: string;
  details: string | null;
  hint: string | null;
}

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload {
  eventType: RealtimeEvent;
  schema: 'public';
  table: string;
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
  commit_timestamp: string;
}
