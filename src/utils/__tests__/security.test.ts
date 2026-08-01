import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Fonctions de sécurité du site.
 *
 * Les services appelés (journalisation, détection d'intrusion, chiffrement,
 * limitation de débit) sont remplacés par des doubles : on teste ici la
 * décision de sécurité, pas la plomberie qui l'accompagne. Le mock de
 * journalisation sert aussi d'assertion — un refus d'accès qui ne serait pas
 * tracé est un défaut en soi.
 */

const logSecurityEvent = vi.fn();

vi.mock('@/services/securityMonitoringService', () => ({
  SecurityMonitoringService: { logSecurityEvent: (...a: unknown[]) => logSecurityEvent(...a) },
}));
vi.mock('@/services/validationService', () => ({
  rateLimiter: { isAllowed: () => true, reset: () => undefined },
}));
vi.mock('@/services/intrusionDetectionService', () => ({
  IntrusionDetectionService: { analyzeRequest: () => ({ isSuspicious: false }) },
}));
vi.mock('@/services/cryptoService', () => ({
  CryptoService: {
    generateSalt: () => new Uint8Array(16),
    deriveKeyFromPassword: async () => ({}),
    encrypt: async () => ({ encrypted: '', iv: new Uint8Array(12) }),
    decrypt: async () => '',
  },
}));

const {
  hasPermission,
  obfuscateText,
  checkPasswordStrength,
  sanitizeForStorage,
  generateCSRFToken,
} = await import('../security');

beforeEach(() => logSecurityEvent.mockClear());

describe('hasPermission', () => {
  it('accorde l’accès admin au seul rôle admin', () => {
    expect(hasPermission('admin', 'admin')).toBe(true);
    expect(hasPermission('user', 'admin')).toBe(false);
  });

  it('accorde l’accès utilisateur aux rôles admin et user', () => {
    expect(hasPermission('user', 'user')).toBe(true);
    expect(hasPermission('admin', 'user')).toBe(true);
  });

  it('refuse l’accès en l’absence de rôle', () => {
    expect(hasPermission(null, 'user')).toBe(false);
    expect(hasPermission(null, 'admin')).toBe(false);
  });

  it('refuse tout rôle inconnu, sans liste blanche implicite', () => {
    expect(hasPermission('comptable', 'user')).toBe(false);
    expect(hasPermission('', 'user')).toBe(false);
  });

  it('journalise chaque refus, et seulement les refus', () => {
    hasPermission('admin', 'admin');
    expect(logSecurityEvent).not.toHaveBeenCalled();

    hasPermission('user', 'admin');
    expect(logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(logSecurityEvent).toHaveBeenCalledWith(
      'authorization',
      'medium',
      expect.stringContaining('Rôle requis: admin'),
      expect.objectContaining({ requiredRole: 'admin', userRole: 'user' })
    );
  });
});

describe('obfuscateText', () => {
  it('ne laisse voir que les derniers caractères', () => {
    expect(obfuscateText('P123456789', 4)).toBe('******6789');
  });

  it('masque intégralement une chaîne plus courte que la fenêtre visible', () => {
    // Laisser voir « abc » en entier reviendrait à ne rien masquer du tout.
    expect(obfuscateText('abc', 4)).toBe('***');
    expect(obfuscateText('abcd', 4)).toBe('****');
  });

  it('préserve la longueur d’origine', () => {
    const secret = 'NIU-P0489876543X';
    expect(obfuscateText(secret).length).toBe(secret.length);
  });

  it('accepte un autre motif de masquage', () => {
    expect(obfuscateText('123456', 2, '#')).toBe('####56');
  });

  it('gère la chaîne vide', () => {
    expect(obfuscateText('', 4)).toBe('');
  });
});

describe('checkPasswordStrength', () => {
  it('juge fort un mot de passe long et varié', () => {
    const r = checkPasswordStrength('Xk9!мPz@Qw3#Lm7');
    expect(r.isStrong).toBe(true);
    expect(r.feedback).toHaveLength(0);
  });

  it('énumère précisément ce qui manque', () => {
    const r = checkPasswordStrength('abc');
    expect(r.isStrong).toBe(false);
    expect(r.feedback).toEqual(
      expect.arrayContaining([
        expect.stringContaining('8 caractères'),
        expect.stringContaining('majuscules'),
        expect.stringContaining('chiffres'),
        expect.stringContaining('spéciaux'),
      ])
    );
  });

  it('déclasse les mots de passe courants malgré une bonne composition', () => {
    // « Password123! » coche minuscules, majuscules, chiffres et spéciaux :
    // sans la pénalité, il passerait pour fort.
    const r = checkPasswordStrength('Password123!');
    expect(r.feedback).toEqual(expect.arrayContaining([expect.stringContaining('courants')]));
    expect(r.isVeryStrong).toBe(false);
  });

  it('pénalise les répétitions et les séquences évidentes', () => {
    expect(checkPasswordStrength('Aaaa!1bcdef').feedback).toEqual(
      expect.arrayContaining([expect.stringContaining('répétitifs')])
    );
    expect(checkPasswordStrength('Qwe!45xyzLM').feedback).toEqual(
      expect.arrayContaining([expect.stringContaining('séquences')])
    );
  });

  it('ne descend jamais sous zéro', () => {
    expect(checkPasswordStrength('123456').score).toBeGreaterThanOrEqual(0);
    expect(checkPasswordStrength('password').score).toBeGreaterThanOrEqual(0);
  });
});

describe('sanitizeForStorage', () => {
  it('caviarde les champs sensibles quelle que soit la casse', () => {
    const r = sanitizeForStorage({ email: 'a@b.cm', password: 'secret', API_KEY: 'abc' });
    expect(r.email).toBe('a@b.cm');
    expect(r.password).toBe('[REDACTED]');
    expect(r.API_KEY).toBe('[REDACTED]');
  });

  it('descend dans les objets imbriqués et les tableaux', () => {
    const r = sanitizeForStorage({
      user: { nom: 'X', session: 'jwt' },
      comptes: [{ pin: '0000', libelle: 'principal' }],
    });
    expect(r.user.session).toBe('[REDACTED]');
    expect(r.user.nom).toBe('X');
    expect(r.comptes[0].pin).toBe('[REDACTED]');
    expect(r.comptes[0].libelle).toBe('principal');
  });

  it('reconnaît une clé sensible incluse dans un nom composé', () => {
    const r = sanitizeForStorage({ refreshToken: 'x', privateNote: 'y', authHeader: 'z' });
    expect(Object.values(r)).toEqual(['[REDACTED]', '[REDACTED]', '[REDACTED]']);
  });

  it('laisse intact l’objet d’origine', () => {
    const source = { password: 'secret' };
    sanitizeForStorage(source);
    expect(source.password).toBe('secret');
  });

  it('journalise chaque caviardage', () => {
    sanitizeForStorage({ token: 'a', nom: 'b' });
    expect(logSecurityEvent).toHaveBeenCalledTimes(1);
  });
});

describe('generateCSRFToken', () => {
  it('produit un horodatage suivi de 64 caractères hexadécimaux', () => {
    expect(generateCSRFToken()).toMatch(/^\d+-[0-9a-f]{64}$/);
  });

  it('ne produit jamais deux fois le même jeton', () => {
    const jetons = new Set(Array.from({ length: 50 }, () => generateCSRFToken()));
    expect(jetons.size).toBe(50);
  });
});
