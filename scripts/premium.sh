#!/usr/bin/env bash
# Gestión manual del plan premium (Ko-fi no avisa a la app todavía).
#
#   ./scripts/premium.sh --list
#   ./scripts/premium.sh correo@ejemplo.com on          # 1 mes
#   ./scripts/premium.sh correo@ejemplo.com on 12       # 12 meses
#   ./scripts/premium.sh correo@ejemplo.com on 0        # sin caducidad
#   ./scripts/premium.sh correo@ejemplo.com off
#
# Necesita SUPABASE_SERVICE_ROLE_KEY y una URL de proyecto. Las coge de
# ~/.config/opencode/env si no están en el entorno.

set -euo pipefail

ENV_FILE="${OPENCODE_ENV:-$HOME/.config/opencode/env}"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

KEY="${SUPABASE_SERVICE_ROLE_KEY:?falta SUPABASE_SERVICE_ROLE_KEY}"
URL="${VITE_SUPABASE_URL:-${SUPABASE_URL:-https://zrfmltqfunizhudkekdc.supabase.co}}"

api() {
    curl -sS -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
        -H "Content-Type: application/json" -H "Prefer: return=representation" "$@"
}

usage() {
    sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
}

[ $# -ge 1 ] || usage

if [ "$1" = "--list" ]; then
    api "$URL/rest/v1/profiles?select=email,is_premium,premium_until&is_premium=eq.true&order=email" |
        (command -v jq >/dev/null && jq -r '.[] | "\(.email)\t\(.premium_until // "sin caducidad")"' ||
            cat)
    exit 0
fi

EMAIL="$1"
ACTION="${2:-on}"
MONTHS="${3:-1}"

if [ "$ACTION" = "off" ]; then
    BODY='{"is_premium":false,"premium_until":null}'
else
    if [ "$MONTHS" = "0" ]; then
        BODY='{"is_premium":true,"premium_until":null}'
    else
        UNTIL=$(date -u -d "+${MONTHS} months" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null ||
            date -u -v "+${MONTHS}m" +%Y-%m-%dT%H:%M:%SZ)
        BODY="{\"is_premium\":true,\"premium_until\":\"$UNTIL\"}"
    fi
fi

RESULT=$(api -X PATCH "$URL/rest/v1/profiles?email=eq.$EMAIL" -d "$BODY")

if [ "$RESULT" = "[]" ] || [ -z "$RESULT" ]; then
    echo "No hay ningún perfil con el email $EMAIL." >&2
    echo "Ojo: tiene que haber entrado al menos una vez (el perfil lo crea un trigger al registrarse)." >&2
    exit 1
fi

echo "Hecho:"
echo "$RESULT" | (command -v jq >/dev/null && jq -r '.[] | "  \(.email): is_premium=\(.is_premium) hasta=\(.premium_until // "sin caducidad")"' || echo "$RESULT")
