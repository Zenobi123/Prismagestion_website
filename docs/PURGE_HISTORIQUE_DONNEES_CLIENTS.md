# Purger les données clients de l'historique git

Audit du 18/08/2026, constat 8. Procédure éprouvée sur une copie du dépôt le
19/08/2026 ; **rien n'a été réécrit sur le dépôt réel.**

À exécuter par le propriétaire du dépôt : la réécriture impose un `push --force`
sur `main`, que l'assistant n'est pas autorisé à faire.

---

## Ce qu'il reste à purger

Deux fichiers, et eux seuls :

| Fichier | Contenu |
|---|---|
| `facturation/clients_2026-01-28.csv` | 29 clients réels : nom, NIU, centre, ville, téléphone, e-mail, n° CNPS |
| `facturation/clients_2026-01-28.json` | le même export, en JSON |

Ils sont entrés dans l'historique par un seul commit — `7608d97`, « Fusionner le
dépôt taskplanner dans ce dépôt » (01/08/2026) — et n'ont jamais été modifiés
depuis.

**Le reste de `facturation/` est conservé.** Ses 27 autres fichiers ont été
contrôlés un par un : les NIU qu'ils contiennent (`M052116042979Z`,
`M123456789012Z`, `P098765432109X`) et les e-mails (`dupont@email.cm`,
`contact@exemple.cm`) sont des exemples fabriqués, absents de l'export réel. Le
prototype garde donc la valeur de référence que `CLAUDE.md` lui reconnaît.

**Le fichier de test est déjà traité.** `vanillaTransfer.test.ts` figeait un NIU
réel (`M031912756642Y`), un nom (`NGAH ESSAMA JACQUELINE FLORENCE`) et un
téléphone (`699350141`). Ils sont remplacés par des valeurs fabriquées dans le
commit qui accompagne ce document — donc **avant** la réécriture, pour que
celle-ci n'ait plus qu'à traiter les versions historiques.

---

## Avant de commencer

1. **Fusionner la PR #3.** La réécriture change tous les SHA depuis le
   01/08/2026 : une branche restée ouverte deviendrait impossible à fusionner.
2. **Prévenir tout détenteur d'un clone.** Après l'opération, un `git pull`
   échoue ; il faut recloner.
3. **Sauvegarder** : `git clone --mirror <url> sauvegarde-avant-purge.git`

---

## La procédure

```bash
# 1. Un clone neuf et complet, dédié à l'opération
git clone --mirror https://github.com/Zenobi123/Prismagestion_website.git purge.git
cd purge.git

# 2. L'outil (un seul fichier Python, rien à compiler)
pip install git-filter-repo

# 3. La réécriture — retire les deux fichiers de tous les commits
git filter-repo --force \
  --path facturation/clients_2026-01-28.csv \
  --path facturation/clients_2026-01-28.json \
  --invert-paths

# 4. Contrôle : doit afficher 0
git log --all --oneline -- facturation/clients_2026-01-28.csv \
                           facturation/clients_2026-01-28.json | wc -l

# 5. Contrôle : plus aucun NIU réel dans aucun blob
git rev-list --objects --all | awk '{print $1}' \
  | git cat-file --batch-check='%(objecttype) %(objectname)' \
  | awk '$1=="blob"{print $2}' \
  | while read b; do git cat-file blob "$b" | grep -ohE "\b[PM][0-9]{12}[A-Z]\b"; done \
  | sort -u
# Attendu : uniquement les exemples fabriqués
#   M052116042979Z, M123456789012Z, P098765432109X, M999000000001Z, P999000000002Z

# 6. filter-repo retire le remote par sécurité : on le remet
git remote add origin https://github.com/Zenobi123/Prismagestion_website.git

# 7. Envoi. Irréversible.
git push --force --all origin
git push --force --tags origin
```

Mesuré sur la copie : 60 commits réécrits en 0,3 seconde, les 27 autres fichiers
de `facturation/` intacts.

---

## Après

- **Recloner** partout où le dépôt existe. Un ancien clone repousserait
  l'historique purgé.
- **Vercel** reconstruit sur le nouveau `main` : vérifier que le déploiement
  passe.
- **Le point le plus important, et le plus souvent oublié :** GitHub **conserve
  les objets devenus inaccessibles**. Les anciens commits restent atteignables
  par leur SHA, et le restent tant que le ramasse-miettes n'est pas passé. Tant
  que ce n'est pas fait, la purge est incomplète côté GitHub.

  Il faut **ouvrir un ticket au support GitHub** en demandant explicitement le
  nettoyage des objets inaccessibles et l'invalidation des caches, en citant le
  dépôt. C'est la seule voie ; aucune commande côté client ne l'obtient.

  Alternative radicale : supprimer le dépôt sur GitHub et le recréer depuis
  l'historique purgé. Fait disparaître les *issues*, les PR et leur discussion —
  ici, une PR fusionnée et aucune issue, donc la perte serait faible.

- **Les clés et jetons ne sont pas concernés** : le dépôt n'en a jamais
  contenu, contrôle fait pendant l'audit.

---

## Ce que la purge ne change pas

Le dépôt reste **privé**, et doit le rester. Le prototype `facturation/`
continue d'illustrer des dossiers clients, avec des données fabriquées.
Et la base Supabase, elle, contient les vraies données — c'est sa RLS qui les
protège, pas cette opération.
