#!/usr/bin/env bash
# Publica el CV en GitHub Pages (https://octapf.github.io/cv-web/) y activa la redirección
# desde los enlaces viejos de miralab.ar/<idioma>/cv. Uso: bash scripts/publicar.sh
set -euo pipefail
CV=~/Escritorio/personal-repos/cv-web
WEB=~/Escritorio/personal-repos/miralab-web
TMP=$(mktemp -d)

cd "$CV"
gh auth switch -u octapf
npm run build:pages
cp -r out/. "$TMP/"
( cd "$TMP" && git init -q -b gh-pages \
  && git -c user.name="Octavio Frangipani" -c user.email="62032399+octapf@users.noreply.github.com" add -A \
  && git -c user.name="Octavio Frangipani" -c user.email="62032399+octapf@users.noreply.github.com" commit -q -m "Publicar CV" \
  && git push -q -f https://github.com/octapf/cv-web.git gh-pages )
gh repo edit octapf/cv-web --visibility public --accept-visibility-change-consequences
gh api -X POST repos/octapf/cv-web/pages -f 'source[branch]=gh-pages' -f 'source[path]=/' --jq '.html_url' \
  || gh api -X PUT repos/octapf/cv-web/pages -f 'source[branch]=gh-pages' -f 'source[path]=/'
gh auth switch -u miralab-ar

echo "Esperando a que GitHub Pages responda..."
for i in $(seq 1 40); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' https://octapf.github.io/cv-web/en/cv/)" = "200" ] && break; sleep 10
done
curl -s -o /dev/null -w 'CV en vivo: %{http_code}\n' https://octapf.github.io/cv-web/en/cv/

cd "$WEB"
git checkout -q master && git merge -q --ff-only redireccion-cv && git push -q origin master
echo "Redirección pusheada: miralab.ar/en/cv -> CV nuevo (Vercel despliega en 1-2 min)."
