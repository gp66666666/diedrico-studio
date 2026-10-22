import { supabase } from './supabase';

/**
 * Eventos de producto (embudo). Se guardan en Supabase porque los eventos
 * personalizados de Vercel son de pago.
 *
 * No se envía IP, email ni contenido: solo el nombre del evento y, como mucho,
 * datos técnicos del propio evento (si era premium, si fue actualización...).
 * Es "fire and forget": si falla, la app sigue como si nada.
 */
export type AnalyticsEvent =
    | 'support_modal_open'
    | 'support_kofi_click'
    | 'ai_daily_limit'
    | 'credits_modal_open'
    | 'credits_checkout_click'
    | 'ai_gate'
    | 'ai_message'
    | 'academy_view'
    | 'guide_view'
    | 'project_saved'
    | 'lamina_saved'
    | 'premium_page_view';

export function trackEvent(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
    try {
        void supabase
            .from('analytics_events')
            .insert({
                name: event,
                props: props ?? null,
                path: typeof window !== 'undefined' ? window.location.pathname : null,
            })
            .then(() => undefined, () => undefined);
    } catch {
        // Sin red o sin tabla: no es crítico
    }
}
