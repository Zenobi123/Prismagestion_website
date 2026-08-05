// Authentification locale (sans serveur) : les comptes et la session
// sont conservés dans le localStorage du navigateur.
//
// NOTE : un site sans backend ne peut pas offrir de véritable sécurité —
// l'espace admin ne modifie que les données stockées dans le navigateur
// du visiteur. Un compte administrateur par défaut est créé au premier
// chargement (voir DEFAULT_ADMIN ci-dessous).

import { readTable, writeTable, Row } from './store';
import type { AuthChangeEvent, AuthError, Session, User } from './types';

const SESSION_KEY = 'prisma-local-auth:session';
const USERS_TABLE = '_local_users';

export const DEFAULT_ADMIN = {
  email: 'prismagestionsarl@gmail.com',
  password: 'admin123',
};

interface StoredUser extends Row {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

const listeners = new Set<AuthListener>();

function makeAuthError(message: string, status = 400): AuthError {
  return { name: 'AuthError', message, status };
}

function toUser(stored: StoredUser): User {
  return { id: stored.id, email: stored.email, created_at: stored.created_at };
}

function makeSession(user: User): Session {
  return { access_token: `local-${user.id}`, token_type: 'bearer', user };
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function notify(event: AuthChangeEvent, session: Session | null) {
  listeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (error) {
      console.error('Erreur dans un écouteur auth:', error);
    }
  });
}

function ensureRole(userId: string, role: string) {
  const roles = readTable('user_roles');
  if (!roles.some((row) => row.user_id === userId)) {
    roles.push({
      id: `role-${userId}`,
      user_id: userId,
      role,
      created_at: new Date().toISOString(),
    });
    writeTable('user_roles', roles);
  }
}

export function seedDefaultAdmin() {
  const users = readTable(USERS_TABLE) as StoredUser[];
  if (!users.some((user) => user.email === DEFAULT_ADMIN.email)) {
    const admin: StoredUser = {
      id: 'local-admin',
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      created_at: new Date().toISOString(),
    };
    users.push(admin);
    writeTable(USERS_TABLE, users);
  }
  ensureRole('local-admin', 'admin');
}

export const localAuth = {
  async getSession() {
    return { data: { session: readSession() }, error: null as AuthError | null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const users = readTable(USERS_TABLE) as StoredUser[];
    const found = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (!found) {
      return {
        data: { user: null, session: null },
        error: makeAuthError('Email ou mot de passe incorrect.'),
      };
    }

    const session = makeSession(toUser(found));
    writeSession(session);
    notify('SIGNED_IN', session);
    return { data: { user: session.user, session }, error: null };
  },

  async signUp({ email, password }: { email: string; password: string; options?: unknown }) {
    const users = readTable(USERS_TABLE) as StoredUser[];
    if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      return {
        data: { user: null, session: null },
        error: makeAuthError('Un compte existe déjà avec cet email.'),
      };
    }

    const newUser: StoredUser = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      email: email.toLowerCase(),
      password,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    writeTable(USERS_TABLE, users);

    // Les données étant propres à chaque navigateur, tout compte créé
    // localement reçoit le rôle admin pour accéder à l'espace de gestion.
    ensureRole(newUser.id, 'admin');

    const session = makeSession(toUser(newUser));
    writeSession(session);
    notify('SIGNED_IN', session);
    return { data: { user: session.user, session }, error: null };
  },

  async signOut() {
    writeSession(null);
    notify('SIGNED_OUT', null);
    return { error: null as AuthError | null };
  },

  async refreshSession() {
    const session = readSession();
    if (session) {
      notify('TOKEN_REFRESHED', session);
    }
    return { data: { session, user: session?.user ?? null }, error: null as AuthError | null };
  },

  onAuthStateChange(callback: AuthListener) {
    listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => listeners.delete(callback),
        },
      },
    };
  },
};
