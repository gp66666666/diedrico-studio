#!/usr/bin/env bash
# Guarda el Verification Token de Ko-fi en Supabase (secreto de la Edge Function).
#
#   ./scripts/kofi-token.sh            # pide el token sin mostrarlo
#   ./scripts/kofi-token.sh <token>    # pasarlo directamente
#
# El token se copia de https://ko-fi.com/manage/webhooks (botón "Show").
# La URL que hay que pegar en Ko-fi es siempre:
#   https://zrfmltqfunizhudkekdc.supabase.co/functions/v1/kofi-webhook

set -euo pipefail

ENV_FILE="${OPENCODE_ENV:-$HOME/.config/opencode/env}"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

PROJECT_REF="${SUPABASE_PROJECT_REF:-zrfmltqfunizhudkekdc}"
TOKEN="${1:-}"

if [ -z "$TOKEN" ]; then
    printf 'Verification Token de Ko-fi: '
    read -rs TOKEN
    echo
fi

if [ -z "$TOKEN" ]; then
    echo "Falta el token." >&2
    exit 1
fi

: "${SUPABASE_ACCESS_TOKEN:?falta SUPABASE_ACCESS_TOKEN (en $ENV_FILE o en el entorno)}"

SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
    npx supabase secrets set KOFI_VERIFICATION_TOKEN="$TOKEN" \
    --project-ref "$PROJECT_REF"

cat <<EOF

Hecho. Ahora, en Ko-fi → Settings → Webhooks:
  URL:  https://${PROJECT_REF}.supabase.co/functions/v1/kofi-webhook
  Token: (el que acabas de guardar)

Prueba: haz un pago de prueba y mira
  select * from public.kofi_events order by created_at desc limit 5;
EOF
