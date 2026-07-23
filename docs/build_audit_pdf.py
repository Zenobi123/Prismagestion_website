# -*- coding: utf-8 -*-
import sys
SK = "/root/.claude/skills/prisma-gestion-docs"
sys.path.insert(0, SK + "/scripts")
from prisma_pdf import build_document

meta = dict(
    ref="PG/AUDIT-DIGITAL/2026/001",
    dossier="Audit des actifs numériques & stratégie commerciale",
    date="Yaoundé, le 23 juillet 2026",
    objet=("Audit complet des deux plateformes numériques du cabinet (site vitrine et "
           "application métier) et feuille de route pour une stratégie commerciale offensive."),
    title="Audit Numérique & Stratégie Commerciale Offensive",
    subtitle="SITE VITRINE · APPLICATION MÉTIER · PLAN D'ACTION EN 7 AXES",
)

body = r"""
<h2 class="section">1. Synthèse exécutive</h2>
<p>PRISMA GESTION dispose d'une base technique rare pour un cabinet camerounais : un site
vitrine moderne, un blog fiscal alimenté (une dizaine d'articles de fond et des veilles
impôts.cm / CNPS / DGICAM), une batterie de calculateurs d'impôts (IGS, TVA, IRCM, IRPP,
succession, bail), un chatbot et un back-office complet (clients, facturation, missions).</p>
<p>Le constat central est que <b>ces atouts ne sont pas exploités commercialement</b>. Le site
fonctionne comme une plaquette en ligne, non comme un outil de vente : on ne mesure rien, on ne
capte aucun prospect sur les meilleurs contenus, on n'affiche ni offre, ni prix, ni preuve, et la
base clients — le premier actif commercial — reste dormante dans l'application métier.</p>
<p>La thèse de redressement tient en cinq temps : <span class="hl">Instrumenter → Capter →
Convertir → Exploiter la base → Industrialiser le contenu.</span></p>

<h2 class="section">2. Les cinq verrous qui bloquent la croissance</h2>
<table class="liq">
  <thead><tr><th>Verrou</th><th>Constat (étayé par le code)</th><th>Gravité</th></tr></thead>
  <tbody>
    <tr><td class="elem">1. Pilotage à l'aveugle</td><td class="form">Analytics jamais initialisée ; tableau de bord admin alimenté par des chiffres fictifs</td><td class="amt">Critique</td></tr>
    <tr><td class="elem">2. Aimants à leads inertes</td><td class="form">Les calculateurs (trafic le plus qualifié) ne captent aucun email</td><td class="amt">Critique</td></tr>
    <tr><td class="elem">3. Tunnel de conversion faible</td><td class="form">Ni offre packagée, ni prix, ni preuve sociale ; appels à l'action génériques</td><td class="amt">Élevé</td></tr>
    <tr><td class="elem">4. Aucune présence sociale</td><td class="form">Un seul lien WhatsApp ; numéro factice dans le chatbot</td><td class="amt">Élevé</td></tr>
    <tr><td class="elem">5. Base clients dormante</td><td class="form">Le CRM de l'application n'alimente aucune action de vente (upsell, relance)</td><td class="amt">Élevé</td></tr>
  </tbody>
</table>

<h2 class="section">3. Diagnostic du tunnel de conversion</h2>
<p>Le tunnel fuit à chaque étape haute et n'exploite aucune étape basse :</p>
<ul class="rules">
  <li><b>Trafic :</b> non mesuré — impossible de savoir ce qui fonctionne.</li>
  <li><b>Intérêt :</b> aucune capture d'email — le prospect chaud repart anonyme (fuite majeure).</li>
  <li><b>Considération :</b> ni offre, ni prix, ni preuve — rien ne déclenche la décision.</li>
  <li><b>Action :</b> formulaires contact / devis / rendez-vous — fonctionnels.</li>
  <li><b>Client &amp; expansion :</b> gérés dans l'application, mais sans upsell ni fidélisation.</li>
</ul>
<p>La priorité est donc de boucher les fuites <b>de haut en bas, dans cet ordre</b> : d'abord voir,
puis capter, puis convertir, enfin exploiter la base existante.</p>

<h2 class="section">4. La stratégie en sept axes</h2>
<ul class="rules">
  <li><b>Axe 1 — Instrumenter :</b> déployer une vraie analytique (GA4 ou Plausible) et remplacer le tableau de bord fictif par les vraies données.</li>
  <li><b>Axe 2 — Machine à leads :</b> capture d'email sur les calculateurs, lead magnets, newsletter fiscale mensuelle bâtie sur les veilles.</li>
  <li><b>Axe 3 — Convertir :</b> packager des offres à prix d'appel, afficher preuves sociales et appels à l'action offensifs.</li>
  <li><b>Axe 4 — SEO local :</b> plan de site, balisage établissement local, pages par service, profil Google et collecte d'avis.</li>
  <li><b>Axe 5 — Réseaux &amp; acquisition payante :</b> présence Facebook / WhatsApp Business / LinkedIn et retargeting saisonnier.</li>
  <li><b>Axe 6 — Exploiter la base clients :</b> relances déclenchées par les échéances fiscales, scoring d'upsell, parrainage.</li>
  <li><b>Axe 7 — Industrialiser :</b> productiser l'application en marque blanche pour d'autres cabinets (revenus récurrents).</li>
</ul>

<h2 class="section">5. Plan d'action priorisé</h2>
<div class="market-head">Quick wins — 0 à 2 semaines (fort impact, faible effort)</div>
<ul class="rules">
  <li>Activer une vraie analytique + pixel de retargeting.</li>
  <li>Brancher le tableau de bord admin sur les vraies données.</li>
  <li>Corriger le numéro du chatbot et activer les notifications email.</li>
  <li>Ajouter le plan de site, le balisage local et la capture d'email des calculateurs.</li>
</ul>
<div class="market-head">Court terme — 2 à 8 semaines (installer la conversion)</div>
<ul class="rules">
  <li>Bandeau de preuve sociale, trois offres packagées avec prix d'appel.</li>
  <li>Newsletter fiscale, lead magnets, profil Google et avis.</li>
</ul>
<div class="market-head">Moyen terme — 2 à 6 mois (industrialiser la croissance)</div>
<ul class="rules">
  <li>Séquences de relance automatisées, upsell piloté par les échéances, campagnes saisonnières.</li>
  <li>Étude de productisation de l'application en marque blanche.</li>
</ul>

<h2 class="section">6. Correctifs déjà mis en œuvre</h2>
<p>Les correctifs techniques prioritaires ont été implémentés sur la branche de travail du site :</p>
<ul class="rules">
  <li><b>Analytique :</b> activation par variable d'environnement (GA4 / Plausible) et initialisation globale.</li>
  <li><b>Tableau de bord admin :</b> indicateurs et onglets branchés sur les vraies données du site.</li>
  <li><b>Chatbot :</b> numéro WhatsApp réel rétabli.</li>
  <li><b>Référencement :</b> plan de site, directives d'indexation et balisage établissement local.</li>
  <li><b>Capture de leads :</b> table dédiée et bloc d'inscription posé sous le calculateur d'impôts.</li>
  <li><b>Réseaux sociaux :</b> configuration centralisée et liens dans le pied de page.</li>
</ul>

<h2 class="section">7. Cockpit commercial &amp; objectifs</h2>
<table class="synth">
  <thead><tr><th>Étape</th><th>Indicateur clé</th></tr></thead>
  <tbody>
    <tr><td class="name">Acquisition</td><td>Visiteurs, sources, pages d'entrée</td></tr>
    <tr><td class="name">Capture</td><td>Emails collectés, taux de capture par calculateur</td></tr>
    <tr><td class="name">Conversion</td><td>Devis demandés, rendez-vous, taux de transformation</td></tr>
    <tr><td class="name">Expansion</td><td>Taux d'upsell, chiffre d'affaires par client, parrainage</td></tr>
    <tr class="grand"><td class="name">Cible trimestrielle</td><td>+30 leads qualifiés / mois · transformation devis ≥ 25 % · 2 upsells / mois</td></tr>
  </tbody>
</table>
<p>La <b>part du chiffre d'affaires récurrent</b> (abonnements) est l'indicateur de valorisation
prioritaire du cabinet : un revenu prévisible vaut bien davantage qu'un chiffre d'affaires au coup
par coup.</p>

<h2 class="section">8. Recommandation de démarrage</h2>
<p>Commencer par l'axe 1 (instrumenter) et les quick wins : sans radar, tout budget d'acquisition
est aveugle. Une fois la mesure en place, lancer la captation et la conversion (axes 2 et 3) qui
produisent les premiers résultats visibles, puis l'exploitation de la base clients (axe 6), qui
offre la meilleure marge.</p>
"""

out = "/tmp/claude-0/-home-user/4ae13f90-a4a3-5888-8cbd-84d657e17613/scratchpad/Audit_Strategie_Commerciale_PRISMA_2026-07-23.pdf"
build_document(meta, body, output_path=out, assets_dir=SK + "/assets")
print("PDF généré :", out)
