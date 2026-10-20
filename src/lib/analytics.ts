import { track } from '@vercel/analytics';

/**
 * Eventos de producto. Sin cookies y sin datos personales.
 * Se ven en Vercel → Analytics → Events (hay que activar Web Analytics).
 */
export type AnalyticsEvent =
    | 'premium_modal_open'
    | 'premium_kofi_click'
    | 'ai_gate'
    | 'ai_message'
    | 'academy_view'
    | 'guide_view'
    | 'project_saved'
    | 'lamina_saved';

export function trackEvent(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
    try {
        track(event, props);
    } catch {
        // En local o sin analítica activa no hace nada
    }
}
