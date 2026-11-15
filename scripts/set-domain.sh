#!/usr/bin/env bash
# Point every absolute URL on the site at the real domain.
# Usage (from the repository folder):   bash scripts/set-domain.sh yourdomain.com
# Rewrites canonical, Open Graph and structured-data URLs in every page, plus
# sitemap.xml and robots.txt, refreshes the sitemap dates and writes CNAME.
# Works on macOS, Linux and Git Bash for Windows. Safe to run more than once.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: bash scripts/set-domain.sh yourdomain.com" >&2
  exit 1
fi

DOMAIN="$(printf '%s' "$1" | sed -E 's#^https?://##; s#/.*$##' | tr 'A-Z' 'a-z')"
if ! printf '%s' "$DOMAIN" | grep -Eq '^[a-z0-9-]+(\.[a-z0-9-]+)+$'; then
  echo "That doesn't look like a domain name: $1" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
NEW="https://$DOMAIN"

# Whatever site URL is in use now (the placeholder, or an earlier domain)
OLD="$(grep -o '<link rel="canonical" href="[^"]*"' index.html | sed -E 's/.*href="([^"]*)"/\1/' | sed -E 's#/$##')"
if [ -z "$OLD" ]; then echo "Could not find the current site URL in index.html" >&2; exit 1; fi
if [ "$OLD" = "$NEW" ]; then echo "The site already points to $NEW"; exit 0; fi

FILES=$(find . -name '*.html' -not -path './tests/*' -not -path './node_modules/*' | sort)
for f in $FILES sitemap.xml robots.txt; do
  OLD="$OLD" NEW="$NEW" perl -pi -e 's/\Q$ENV{OLD}\E/$ENV{NEW}/g' "$f"
done

TODAY="$(date +%Y-%m-%d)"
perl -pi -e "s#<lastmod>[^<]*</lastmod>#<lastmod>$TODAY</lastmod>#g" sitemap.xml

# GitHub Pages reads this file to serve the custom domain (other hosts ignore it)
printf '%s\n' "$DOMAIN" > CNAME

echo "Done. The site now points to $NEW (was $OLD)"
echo "Changed:" $FILES sitemap.xml robots.txt CNAME
