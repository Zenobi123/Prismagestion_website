// Fonction edge de notification email (contact / devis / rendez-vous).
//
// Durcissement sécurité :
// - CORS restreint à une liste d'origines autorisées (ALLOWED_ORIGINS,
//   par défaut les domaines de production + prévisualisations Lovable +
//   localhost en développement) ; l'en-tête Origin est aussi vérifié
//   côté serveur (défense en profondeur).
// - Validation stricte des entrées : type connu, champs requis, longueurs
//   maximales, format d'email — tout contenu invalide est rejeté en 400.
// - Limitation de débit par IP (best effort, mémoire de l'instance).
// - Taille de requête plafonnée.

const DEFAULT_ALLOWED_ORIGINS = [
  'https://prismagestion.com',
  'https://www.prismagestion.com',
]

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function isOriginAllowed(origin: string): boolean {
  const allowed = ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : DEFAULT_ALLOWED_ORIGINS
  if (allowed.includes(origin)) return true
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false
  }
  // Prévisualisations Lovable et développement local.
  if (url.protocol === 'https:' && (url.hostname.endsWith('.lovable.app') || url.hostname.endsWith('.lovableproject.com'))) {
    return true
  }
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
}

function corsHeadersFor(origin: string | null): Record<string, string> {
  if (!origin || !isOriginAllowed(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

// Limitation de débit par IP : best effort (mémoire propre à l'instance),
// suffisant pour freiner le spam naïf sans dépendance externe.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000
const requestLog = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (timestamps.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  requestLog.set(ip, timestamps)
  // Purge périodique pour borner la mémoire.
  if (requestLog.size > 1000) {
    for (const [key, values] of requestLog) {
      if (values.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) requestLog.delete(key)
    }
  }
  return false
}

const MAX_BODY_BYTES = 20_000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldRule = { maxLength: number; required?: boolean; email?: boolean }

const FIELD_RULES: Record<string, Record<string, FieldRule>> = {
  contact: {
    firstName: { maxLength: 200, required: true },
    lastName: { maxLength: 200, required: true },
    email: { maxLength: 320, required: true, email: true },
    whatsapp: { maxLength: 50 },
    subject: { maxLength: 200, required: true },
    message: { maxLength: 5000, required: true },
  },
  quote: {
    full_name: { maxLength: 200, required: true },
    email: { maxLength: 320, required: true, email: true },
    phone: { maxLength: 50 },
    service: { maxLength: 100 },
    details: { maxLength: 5000, required: true },
  },
  appointment: {
    fullName: { maxLength: 200, required: true },
    phone: { maxLength: 50, required: true },
    subject: { maxLength: 200, required: true },
    date: { maxLength: 40, required: true },
    time: { maxLength: 20, required: true },
    message: { maxLength: 5000 },
  },
  newsletter: {
    email: { maxLength: 320, required: true, email: true },
    source: { maxLength: 100 },
    context: { maxLength: 500 },
  },
}

// Valide et normalise le payload : seuls les champs déclarés dans les règles
// sont conservés (les champs inconnus sont ignorés).
function validatePayload(type: string, data: unknown): { ok: true; data: Record<string, string> } | { ok: false; error: string } {
  const rules = FIELD_RULES[type]
  if (!rules) return { ok: false, error: 'Type de message inconnu' }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'Données invalides' }
  }
  const source = data as Record<string, unknown>
  const cleaned: Record<string, string> = {}
  for (const [field, rule] of Object.entries(rules)) {
    const raw = source[field]
    if (raw === undefined || raw === null || raw === '') {
      if (rule.required) return { ok: false, error: `Champ requis manquant: ${field}` }
      cleaned[field] = ''
      continue
    }
    if (typeof raw !== 'string') return { ok: false, error: `Champ invalide: ${field}` }
    const value = raw.trim()
    if (rule.required && value.length === 0) return { ok: false, error: `Champ requis manquant: ${field}` }
    if (value.length > rule.maxLength) return { ok: false, error: `Champ trop long: ${field}` }
    if (rule.email && value && !EMAIL_REGEX.test(value)) return { ok: false, error: `Email invalide` }
    cleaned[field] = value
  }
  return { ok: true, data: cleaned }
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'PRISMA GESTION <onboarding@resend.dev>'
const TO_EMAIL = Deno.env.get('NOTIFY_EMAIL') ?? 'obiangtimenathan@gmail.com'

// Échappe le contenu fourni par les visiteurs avant insertion dans le HTML
// de l'email (protection contre l'injection HTML).
function esc(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

// Neutralise les sauts de ligne/caractères de contrôle dans les sujets
// d'email (anti header-injection) et borne leur longueur.
function safeSubject(value: string): string {
  // eslint-disable-next-line no-control-regex -- regex sur caractères de contrôle volontaire
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').slice(0, 200)
}

const SERVICE_LABELS: Record<string, string> = {
  comptabilite: 'Comptabilité',
  finance: 'Finance',
  fiscalite: 'Fiscalité',
  'ressources-humaines': 'Ressources Humaines',
  'genie-logiciel': 'Génie Logiciel',
  'intelligence-artificielle': 'Intelligence Artificielle',
}

async function sendViaResend(subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY non configurée')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: safeSubject(subject),
      html,
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? `Resend error ${response.status}`)
  }
}

function buildContactHtml(data: Record<string, string>): { subject: string; html: string } {
  const serviceLabel = SERVICE_LABELS[data.subject] ?? data.subject
  const fullName = esc(`${data.firstName} ${data.lastName}`)
  return {
    subject: `Nouveau message – ${serviceLabel} – ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#2E1A47">Nouveau message de contact</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 12px;font-weight:bold;width:140px">Nom</td><td style="padding:6px 12px">${fullName}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Email</td><td style="padding:6px 12px">${esc(data.email)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">WhatsApp</td><td style="padding:6px 12px">${esc(data.whatsapp)}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Service</td><td style="padding:6px 12px">${esc(serviceLabel)}</td></tr>
        </table>
        <h3 style="color:#2E1A47;margin-top:24px">Message</h3>
        <p style="background:#f9f9f9;padding:16px;border-left:4px solid #2E1A47;white-space:pre-line">${esc(data.message)}</p>
        <hr style="margin-top:32px;border:none;border-top:1px solid #e0e0e0">
        <p style="font-size:12px;color:#999">Envoyé depuis le formulaire de contact · PRISMA GESTION</p>
      </div>`,
  }
}

function buildQuoteHtml(data: Record<string, string>): { subject: string; html: string } {
  const serviceLabel = data.service ? (SERVICE_LABELS[data.service] ?? data.service) : 'Non spécifié'
  return {
    subject: `Demande de devis – ${serviceLabel} – ${data.full_name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#2E1A47">Nouvelle demande de devis</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 12px;font-weight:bold;width:140px">Nom</td><td style="padding:6px 12px">${esc(data.full_name)}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Email</td><td style="padding:6px 12px">${esc(data.email)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">Téléphone</td><td style="padding:6px 12px">${esc(data.phone)}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Service</td><td style="padding:6px 12px">${esc(serviceLabel)}</td></tr>
        </table>
        <h3 style="color:#2E1A47;margin-top:24px">Détails du projet</h3>
        <p style="background:#f9f9f9;padding:16px;border-left:4px solid #D6DD00;white-space:pre-line">${esc(data.details)}</p>
        <hr style="margin-top:32px;border:none;border-top:1px solid #e0e0e0">
        <p style="font-size:12px;color:#999">Envoyé depuis le formulaire de devis · PRISMA GESTION</p>
      </div>`,
  }
}

function buildAppointmentHtml(data: Record<string, string>): { subject: string; html: string } {
  return {
    subject: `Nouveau rendez-vous – ${data.subject} – ${data.fullName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#2E1A47">Nouvelle demande de rendez-vous</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 12px;font-weight:bold;width:140px">Nom</td><td style="padding:6px 12px">${esc(data.fullName)}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Téléphone</td><td style="padding:6px 12px">${esc(data.phone)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">Sujet</td><td style="padding:6px 12px">${esc(data.subject)}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Date</td><td style="padding:6px 12px">${esc(data.date)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">Heure</td><td style="padding:6px 12px">${esc(data.time)}</td></tr>
        </table>
        ${data.message ? `<h3 style="color:#2E1A47;margin-top:24px">Message</h3><p style="background:#f9f9f9;padding:16px;border-left:4px solid #2E1A47;white-space:pre-line">${esc(data.message)}</p>` : ''}
        <hr style="margin-top:32px;border:none;border-top:1px solid #e0e0e0">
        <p style="font-size:12px;color:#999">Envoyé depuis le formulaire de rendez-vous · PRISMA GESTION</p>
      </div>`,
  }
}

const LEAD_SOURCE_LABELS: Record<string, string> = {
  'calculateur-igs': 'Calculateur IGS',
  'guide-creation': 'Guide création d’entreprise',
  footer: 'Pied de page',
  site: 'Site',
}

function buildNewsletterHtml(data: Record<string, string>): { subject: string; html: string } {
  const sourceLabel = data.source ? (LEAD_SOURCE_LABELS[data.source] ?? data.source) : 'Site'
  return {
    subject: `Nouveau lead – ${sourceLabel} – ${data.email}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#2E1A47">Nouveau lead capté sur le site</h2>
        <p style="color:#555">Un visiteur a laissé son email pour être recontacté.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 12px;font-weight:bold;width:140px">Email</td><td style="padding:6px 12px"><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Origine</td><td style="padding:6px 12px">${esc(sourceLabel)}</td></tr>
          ${data.context ? `<tr><td style="padding:6px 12px;font-weight:bold">Contexte</td><td style="padding:6px 12px">${esc(data.context)}</td></tr>` : ''}
        </table>
        <p style="margin-top:20px">Retrouvez ce lead dans l’espace admin, onglet <b>Abonnés &amp; Leads</b>.</p>
        <hr style="margin-top:32px;border:none;border-top:1px solid #e0e0e0">
        <p style="font-size:12px;color:#999">Capté via un aimant à leads (calculateur / outil) · PRISMA GESTION</p>
      </div>`,
  }
}

function jsonResponse(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = corsHeadersFor(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Défense en profondeur : un navigateur qui envoie un Origin non autorisé
  // est rejeté côté serveur (le CORS seul ne bloque que la lecture de la
  // réponse, pas la requête elle-même).
  if (origin && !isOriginAllowed(origin)) {
    return jsonResponse({ error: 'Origine non autorisée' }, 403, {})
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Méthode non autorisée' }, 405, corsHeaders)
  }

  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  if (isRateLimited(ip)) {
    return jsonResponse({ error: 'Trop de requêtes, veuillez réessayer plus tard' }, 429, corsHeaders)
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Requête trop volumineuse' }, 413, corsHeaders)
  }

  try {
    const rawBody = await req.text()
    if (rawBody.length > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Requête trop volumineuse' }, 413, corsHeaders)
    }

    let parsed: { type?: unknown; data?: unknown }
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      return jsonResponse({ error: 'JSON invalide' }, 400, corsHeaders)
    }

    const type = typeof parsed.type === 'string' ? parsed.type : ''
    const validation = validatePayload(type, parsed.data)
    if (!validation.ok) {
      return jsonResponse({ error: validation.error }, 400, corsHeaders)
    }
    const data = validation.data

    let emailContent: { subject: string; html: string }
    switch (type) {
      case 'contact':
        emailContent = buildContactHtml(data)
        break
      case 'quote':
        emailContent = buildQuoteHtml(data)
        break
      case 'newsletter':
        emailContent = buildNewsletterHtml(data)
        break
      default:
        emailContent = buildAppointmentHtml(data)
        break
    }

    // Sans clé Resend configurée, on répond sans erreur : les demandes
    // restent enregistrées en base et visibles dans l'espace admin.
    if (!RESEND_API_KEY) {
      console.log(`Notification "${type}" reçue mais RESEND_API_KEY non configurée — envoi ignoré.`)
      return jsonResponse({ success: true, sent: false, reason: 'RESEND_API_KEY non configurée' }, 200, corsHeaders)
    }

    await sendViaResend(emailContent.subject, emailContent.html)

    return jsonResponse({ success: true, sent: true }, 200, corsHeaders)
  } catch (error) {
    // Log minimal : jamais le payload (PII), uniquement le message d'erreur.
    console.error('Erreur envoi email:', error instanceof Error ? error.message : 'Erreur inconnue')
    return jsonResponse({ error: "L'envoi de la notification a échoué" }, 500, corsHeaders)
  }
})
