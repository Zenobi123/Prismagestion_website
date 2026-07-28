# Barèmes d'enregistrement des bons de commande administratifs (Cameroun)

État au 28 juillet 2026. Ces montants servent de base de travail, pas de source de droit :
vérifier le CGI, la Loi de Finances en vigueur, les résolutions ARMP et les notes DGI avant
toute diffusion client, et signaler tout écart au lieu de le propager silencieusement.

## 1. Part fiscale

Base d'imposition : la valeur **Hors Taxes (HT)** de la commande publique, jamais le TTC.

| Poste | Assiette | Taux ou montant |
|---|---|---|
| Droit proportionnel | Montant HT, pour un bon de commande strictement inférieur à 5 000 000 F CFA | 7 % |
| Centimes Additionnels Communaux (CAC) | Montant du droit proportionnel | 5 % |
| Timbre de dimension | Chaque page timbrée, soit 3 pages pour les 3 exemplaires originaux exigés | 1 500 F CFA par page |
| Pénalité de retard | Total de la part fiscale, lorsque le dépôt intervient plus de 30 jours après la signature | 100 % |

Le **Total Fiscal** des tableaux de synthèse réunit le droit proportionnel, les CAC et le timbre de
dimension — **le timbre est un élément fiscal, pas un frais annexe** — majorés le cas échéant de la
pénalité de retard. La mercuriale, TRESORPAY, le CNE et les attestations relèvent des
**Frais Annexes**.

Au-delà de 5 000 000 F CFA, le taux applicable doit être revérifié dans le CGI avant liquidation :
ne pas extrapoler le taux de 7 %.

### Délai d'enregistrement et pénalité

Le bon de commande doit être enregistré dans les **30 jours** qui suivent sa **date de signature**.
Au-delà de ce délai, une **pénalité de 100 % de la part fiscale** est due : la part fiscale est donc
doublée. Le décompte s'arrête à la date de dépôt à l'enregistrement.

La date de signature joue ainsi un double rôle : elle ouvre le délai de 30 jours et détermine le
barème CNE applicable (cf. § 3). Lorsque la part fiscale ne peut pas être entièrement liquidée —
montant au-delà du seuil de 5 000 000 F CFA — la pénalité se signale sans être chiffrée, plutôt que
d'être assise sur une base partielle.

## 2. Frais annexes

| Poste | Montant (F CFA) | Nature |
|---|---|---|
| Frais d'exploitation de la mercuriale | 10 000 | Forfait réglementaire par bon de commande |
| Frais de paiement TRESORPAY | 5 000 à 7 500 selon le montant des droits liquidés | Forfait plateforme, confirmé à la liquidation automatique |
| Droit de délivrance du CNE-ARMP | Selon la grille du § 3 | Versé à l'ARMP |
| Frais d'obtention du CNE | 6 500 | Constitution et retrait du certificat, hors grille ARMP |
| Attestation de conformité fiscale et attestation d'immatriculation | 4 200 | Forfait DGI |

**Règle de présentation, non négociable :** le droit versé à l'ARMP et les frais d'obtention du CNE
figurent sur **deux lignes distinctes** du tableau de liquidation. Les agréger en une seule ligne
masque une hausse de tarif au client et fausse toute comparaison entre exercices.

## 3. Grille CNE-ARMP

Certificat de Non Exclusion des marchés publics, Résolution n° 0357/ARMP/CA du 21 juillet 2026,
adoptée en seizième session extraordinaire du Conseil d'Administration.

| Tranche du marché (F CFA) | Droit de délivrance (F CFA) |
|---|---|
| 500 000 à 4 999 999 | 15 000 |
| 5 000 000 à 49 999 999 | 20 000 |
| 50 000 000 à 99 999 999 | 30 000 |
| 100 000 000 à 499 999 999 | 40 000 |
| 500 000 000 et au-delà | 50 000 |

Coût complet du certificat = droit de délivrance + 6 500 F CFA de frais d'obtention.
Pour la première tranche, cela donne 21 500 F CFA.

**Historique à retenir :** avant le 21 juillet 2026, le droit de délivrance s'élevait à
10 000 F CFA pour la tranche 500 000 à 4 999 999, soit un coût complet de 16 500 F CFA. La
résolution de juillet 2026 représente donc un renchérissement de 5 000 F CFA par marché sur cette
tranche. Les rapports antérieurs à cette date qui retiennent 16 500 F CFA ne sont pas erronés, ils
relèvent de l'ancien barème.

Le barème applicable est déterminé par la **date de signature du bon de commande**, pas par la date
de dépôt à l'enregistrement.

## 4. Points de contrôle systématiques

Avant de conclure une évaluation, vérifier :

1. **Le délai de 30 jours depuis la date de signature.** Un dépôt tardif double la part fiscale ;
   c'est le poste qui coûte le plus cher au client et le plus facile à éviter. Le vérifier avant
   toute autre chose, et alerter le client dès que l'échéance approche.
2. **Le seuil de 5 000 000 F CFA.** Un montant proche du seuil doit faire l'objet d'une mention :
   tout avenant fait basculer à la fois le taux de liquidation et la tranche du CNE.
3. **La cohérence entre l'objet du bon de commande, l'imputation budgétaire et les désignations.**
   Une discordance expose le prestataire à un refus de visa du contrôle financier ou à un
   redressement en contrôle a posteriori. Elle se signale en point de vigilance, jamais en silence.
4. **Les références mercuriales** de chaque ligne, qui conditionnent la recevabilité du dossier.
5. **Le mode de règlement**, pour les marchés publics : la TVA et l'IR sont retenus à la source,
   donc le net à payer au prestataire vaut HT moins l'IR, et non TTC moins les retenues.
6. **L'identité fiscale du prestataire.** Le NIU peut être celui d'une personne physique exploitant
   un nom commercial. Mentionner le titulaire, le centre de rattachement et le nom commercial.

## 5. Trame recommandée du rapport d'évaluation fiscale

1. Contexte et cadre réglementaire, sous forme de liste `ul.rules`
2. Identification du marché et du prestataire, plus la décomposition financière de la commande
3. Liquidation des droits, un tableau `table.liq` par marché
4. Synthèse globale, `table.synth` avec les colonnes Montant HT, Total Fiscal, Frais Annexes et
   Coût de la Formalité
5. Points de vigilance
6. Conclusion et processus de télépaiement, avec le montant consolidé en `span.hl`
