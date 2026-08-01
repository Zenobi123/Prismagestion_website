#!/bin/bash
# Hook SessionStart — prépare l'environnement des sessions Claude Code on the web
# en installant les dépendances (build / lint / tests / dev).
set -euo pipefail

# Ne s'exécute que dans l'environnement distant (web).
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Dépendances Node (npm install : idempotent et profite du cache de conteneur).
npm install

# Note : ce hook provenait du dépôt prisma-taskmaster-planner, où il installait
# aussi un Chromium pour Playwright. La dépendance @playwright/test y était
# déclarée mais aucun test e2e n'a jamais existé — ni configuration, ni fichier
# .spec. L'installation du navigateur a donc été retirée à la fusion plutôt que
# reportée. À rétablir le jour où des tests e2e sont réellement écrits.
