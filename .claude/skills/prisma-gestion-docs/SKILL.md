---
name: prisma-gestion-docs
description: >
  Produit les documents professionnels du cabinet PRISMA GESTION (Yaoundé, Cameroun) en PDF :
  rapports fiscaux/comptables, notes, courriers, analyses, dossiers clients. À utiliser DÈS QUE
  Nathan / PRISMA GESTION demande un rapport, une note, un courrier, une lettre, un dossier, une
  analyse fiscale ou comptable « professionnel(le) », « à l'en-tête PRISMA », « à notre charte »,
  « pour un client », ou tout livrable PDF de marque — même si le mot « PRISMA » n'est pas répété.
  La compétence applique la charte graphique (violet/lavande/olive/gris), l'en-tête officiel en
  première page, le pied de page texte sur les pages courantes et le pied de page officiel
  (siège, BP, RCCM, Tél, Email, NIU) uniquement en dernière page. Embarque également les barèmes
  d'enregistrement des bons de commande administratifs (droits, CAC, timbres, pénalité de retard,
  mercuriale, TRESORPAY, grille CNE-ARMP) dans `references/baremes_enregistrement.md`. Ne PAS utiliser pour des
  fichiers Word/Excel/PowerPoint (utiliser docx/xlsx/pptx) ni pour une réponse purement
  conversationnelle.
---

# PRISMA GESTION — Documents professionnels (PDF)

Génère des livrables PDF de marque pour le cabinet **PRISMA GESTION** via HTML + WeasyPrint.

## 1. Identité du cabinet (à ne jamais inventer)

Ces informations figurent dans le pied de page officiel (image `assets/footer_mb.png`) ; ne pas les
ressaisir en texte sauf demande explicite :

- **Raison sociale :** PRISMA GESTION — Cabinet de Conseil
- **Services :** Comptabilité · Finance · Fiscalité · Gestion des Ressources Humaines · Prestations intellectuelles · Génie logiciel
- **Siège Social :** Yaoundé – Bata Longkak
- **BP :** 35 462 Yaoundé – Cameroun
- **RCCM N° :** RC/YAO/2021/2124
- **Tél :** (237) 656 752 475 / 671 050 546
- **Email :** prismagestionsarl@gmail.com
- **N.I.U :** M052116042979Z
- **Signataire par défaut :** Nathan OBIANG TIME, Directeur Associé

## 2. Charte graphique

| Rôle | Couleur | Hex |
|---|---|---|
| Violet profond (barres de section, titres, totaux) | violet | `#5E4C84` |
| Lavande (accents) | lavande | `#9880B2` |
| Fond lavande très clair (lignes/totaux) | | `#F2EFF8` |
| Olive (liserés d'accent, puces losange) | olive | `#BFC04E` |
| Gris (sous-titres) | gris | `#565258` |
| Texte courant | | `#262229` |

Polices : titres/labels en sans-serif (Helvetica/Arial) ; corps en serif (Georgia/Times).
Page A4, marges : **5 mm haut, 10 mm latéral (1 cm), 5 mm bas** sur les pages courantes ;
sur la **dernière page**, la marge basse passe à **~26 mm** pour loger le bandeau de pied officiel
(largeur de contenu = **190 mm**). Ces valeurs sont centralisées en tête de `scripts/prisma_pdf.py`
(`MARGIN_TOP/SIDE/BOTTOM`, `MARGIN_BOTTOM_LAST`, `CONTENT_W_MM`) et faciles à ajuster.

## 3. Règles de mise en page (NON négociables)

1. **En-tête** (`assets/header_full.png`) : **première page UNIQUEMENT**, **pleine largeur entre les
   marges** (du bord gauche au bord droit de la zone de contenu). Il est placé en flux au sommet du
   corps — il n'apparaît donc jamais sur les pages suivantes.
2. **Pied de page TEXTE** (charte) : sur **toutes les pages SAUF la dernière**. Contient la signature
   institutionnelle + numéro de page (« Page X / Y »).
3. **Pied de page OFFICIEL** (`assets/footer_mb.png`, image avec siège/contacts/NIU) : **dernière page
   UNIQUEMENT**.
4. La sélection « dernière page » est robuste quel que soit le nombre de pages : double passe +
   sélecteur CSS `@page:nth(N)` où N = nombre total de pages (cf. `scripts/prisma_pdf.py`).

## 4. Génération — méthode standard

Toujours passer par le module `scripts/prisma_pdf.py` (ne pas réécrire la logique de pieds de page) :

```python
import sys; sys.path.insert(0, "<chemin>/prisma-gestion-docs/scripts")
from prisma_pdf import build_document

meta = dict(
    ref="PG/.../2026/....",
    dossier="Intitulé court du dossier",
    date="Yaoundé, le <DATE DU JOUR>",     # toujours la date du jour, format « 14 juin 2026 »
    objet="Phrase d'objet complète ...",
    title="Titre Du Document",
    subtitle="Sous-titre · cadre réglementaire",
)
body = "<h2 class='section'>1. ...</h2><p>...</p>"   # cf. briques §5
build_document(meta, body,
               output_path="/mnt/user-data/outputs/<Nom_Fichier>_<AAAA-MM-JJ>.pdf",
               assets_dir="<chemin>/prisma-gestion-docs/assets")
```

Signataire personnalisable via `signature=dict(role=..., name=..., fn=...)`.

**Documents multi-signataires** (conventions, contrats) : passer `auto_signature=False, auto_confid=False` et placer soi-même le bloc de signatures (`.sig3`, trois colonnes) et les mentions finales dans `body_html`.

**Vérifier le rendu** après génération : convertir en images (`pdf2image`, dpi≈110) et inspecter
au moins la page 1 (en-tête + pied texte) et la dernière page (pied officiel).

## 5. Briques HTML du corps (classes prêtes à l'emploi)

- Titre de section : `<h2 class="section">1. Intitulé</h2>` (barre violette, liseré olive).
- Paragraphe : `<p>...</p>` (justifié).
- Liste à puces losange olive :
  `<ul class="rules"><li><b>Terme :</b> texte.</li></ul>`
- Sous-titre de marché/bloc : `<div class="market-head">...</div>` +
  `<div class="market-sub"><span class="lbl">Objet :</span> ...</div>`
- Tableau de liquidation (3 colonnes) :
  ```html
  <table class="liq"><thead><tr><th>Élément</th><th>Formule / Assiette</th><th>Montant (F CFA)</th></tr></thead>
  <tbody>
    <tr><td class="elem">Libellé</td><td class="form">calcul</td><td class="amt">montant</td></tr>
    <tr class="total"><td colspan="2">COÛT TOTAL ...</td><td class="amt">total</td></tr>
  </tbody></table>
  ```
- Tableau de synthèse : `<table class="synth">` avec `td.name` (gauche), `tr.grand` (ligne totale).
- Mise en exergue d'un montant clé : `<span class="hl">… F CFA</span>`.
- Préambule contractuel : `<div class="soussignes">` avec `.lead` (ENTRE LES SOUSSIGNÉS / IL A ÉTÉ CONVENU) et `<p class="party">` par partie.
- Titre d'article juridique : `<div class="art-h">Article N — Intitulé</div>` (liseré olive, violet).
- Liste à puces simple : `<ul class="plain"><li>…</li></ul>`.
- Signatures multiples (3 parties) : `<div class="sig3">` × `<div class="cell"><div class="role">…</div><div class="sub">…</div><div class="line"></div><div class="nm">…</div><div class="fn">…</div></div>`.
- Champs à remplir : ligne de points `&hellip;` répétés.

## 6. Pièges à éviter

- **Entités vs Unicode :** dans le **corps HTML**, les entités (`&eacute;`, `&middot;`, `&mdash;`)
  fonctionnent. Dans une chaîne **CSS `content:`** (pieds de page), elles NE sont PAS décodées —
  utiliser des **caractères Unicode littéraux** (déjà géré dans le module).
- **Date :** toujours la date du jour, pas celle d'un modèle. L'en-tête image ne contient pas de date
  (elle a été retirée) ; la date se met dans `meta['date']`.
- **Exactitude fiscale :** cette compétence gère la FORME, et ne fournit sur le FOND que des
  barèmes de travail (cf. § 7). Vérifier les taux et les bases auprès des sources officielles
  (CGI, MINFI/DGI, ARMP, Loi de Finances en vigueur) avant diffusion client, et signaler tout écart
  au lieu de le propager silencieusement.
- **Barème périmé :** ne jamais recopier les montants d'un rapport antérieur sans les confronter à
  `references/baremes_enregistrement.md`. Un tarif ARMP ou DGI peut avoir changé entre deux dossiers.
- **Délai d'enregistrement oublié :** vérifier l'écart entre la date de signature et la date de
  dépôt avant toute liquidation. Au-delà de 30 jours, les droits sont doublés — omettre la pénalité
  fausse le rapport du simple au double.
- **Tables coupées :** `table.synth` est protégée des coupures ; pour les tableaux longs, vérifier le
  saut de page.

## 7. Barèmes fiscaux (rapports d'enregistrement)

Pour toute évaluation d'enregistrement de bon de commande administratif, **lire d'abord**
`references/baremes_enregistrement.md`. Ce fichier centralise :

- la part fiscale : droit proportionnel de 7 % sur le HT en dessous de 5 000 000 F CFA, CAC de 5 %
  sur le droit, timbre de dimension de 1 500 F CFA par page, et pénalité de retard de 100 % des
  seuls droits — timbre exclu — au-delà du délai d'enregistrement ;
- le délai d'enregistrement : 30 jours à compter de la date de signature du bon de commande ;
- les frais annexes : mercuriale, TRESORPAY, CNE-ARMP, frais d'obtention, attestations DGI ;
- la grille CNE-ARMP issue de la Résolution n° 0357/ARMP/CA du 21 juillet 2026, ainsi que
  l'historique du barème antérieur ;
- les points de contrôle systématiques et la trame recommandée du rapport.

Trois règles à ne pas contourner :

1. **Le droit versé à l'ARMP et les frais d'obtention du CNE se présentent sur deux lignes
   distinctes**, jamais agrégés, par souci de transparence vis-à-vis du client.
2. **Le barème applicable est celui en vigueur à la date de signature du bon de commande.** Ne pas
   appliquer rétroactivement une grille nouvelle à un marché antérieur, ni l'inverse.
3. **Le timbre de dimension est un élément fiscal**, à porter dans le Total Fiscal et non dans les
   frais annexes. En revanche, la pénalité de retard s'assoit sur les **seuls droits** — droit
   proportionnel et CAC — le timbre en étant exclu.

Mettre ce fichier à jour dès qu'une nouvelle résolution ARMP, une note DGI ou une Loi de Finances
modifie un montant, en conservant l'historique du barème précédent.

## 8. Régénérer les visuels (si nécessaire)

- `assets/header_full.png` : en-tête officiel rogné (cadre de capture + date retirés, marges blanches
  latérales supprimées pour occuper toute la largeur).
- `assets/footer_mb.png` : pied officiel redimensionné à 160 mm de large (≈ 605 px @96 dpi) pour le
  rendu en boîte de marge CSS. Source haute définition nettoyée : `assets/footer_source_hires.png`.
- Pour repartir d'une nouvelle capture : recadrer le cadre de capture, retirer les soulignements rouges
  du correcteur Word (pixels rouges → blanc), puis redimensionner le pied à ~605 px de large.

## Dépendances

`weasyprint` et `pdf2image` (Python). Installer si absent :
`pip install weasyprint pdf2image --break-system-packages`.
