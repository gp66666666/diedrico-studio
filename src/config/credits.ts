/**
 * Planes de consultas. Se venden con Paddle, que actúa como vendedor (cobra el
 * IVA europeo y emite la factura). Nosotros solo acreditamos lo comprado
 * cuando llega su webhook firmado.
 *
 * La tienda **no aparece** si falta `VITE_PAYMENTS_ENABLED=true` o el token de
 * cliente de Paddle: la web no anuncia nada que no pueda cobrar.
 *
 * Los precios de aquí son solo para enseñarlos: quien cobra es el catálogo del
 * servidor (`PADDLE_CATALOG`). Si un día cambian, hay que cambiar los dos.
 */
export type PlanKind = 'credits' | 'subscription' | 'class';
export type PlanGroup = 'packs' | 'suscripcion' | 'profesor';

export interface CreditPlan {
    /** Clave del catálogo del servidor (pack100, monthly, profe-curso…). */
    id: string;
    group: PlanGroup;
    title: string;
    detail: string;
    price: string;
    kind: PlanKind;
    /** El más recomendado para un alumno suelto. */
    popular?: boolean;
}

export const PLANS: CreditPlan[] = [
    {
        id: 'pack100',
        group: 'packs',
        title: '100 consultas',
        detail: 'Pago único. No caducan y se gastan después de las gratis del día.',
        price: '4,99 €',
        kind: 'credits',
    },
    {
        id: 'pack300',
        group: 'packs',
        title: '300 consultas',
        detail: 'Pago único. No caducan. Salen a 4 céntimos cada una.',
        price: '11,99 €',
        kind: 'credits',
        popular: true,
    },
    {
        id: 'monthly',
        group: 'suscripcion',
        title: 'Plan mensual',
        detail:
            'Consultas de IA mientras esté activo, hasta 1.500 al mes. Se renueva solo y puedes cancelarlo cuando quieras: mantienes el acceso hasta el final del mes pagado.',
        price: '14,99 €/mes',
        kind: 'subscription',
    },
    {
        id: 'profe-semestre',
        group: 'profesor',
        title: 'Pack Profesor · semestre',
        detail:
            'Un código de clase para 40 alumnos durante 6 meses, con 150 consultas por alumno. Cada alumno lo canjea una vez.',
        price: '24,99 €',
        kind: 'class',
    },
    {
        id: 'profe-curso',
        group: 'profesor',
        title: 'Pack Profesor · curso',
        detail:
            'Un código de clase para 40 alumnos durante 12 meses, con 300 consultas por alumno. Cada alumno lo canjea una vez.',
        price: '39,99 €',
        kind: 'class',
    },
];

export const GROUP_TITLES: Record<PlanGroup, string> = {
    packs: 'Packs de consultas',
    suscripcion: 'Suscripción',
    profesor: 'Para profesores',
};

/**
 * ¿Hay tienda configurada? Hacen falta las dos cosas: la bandera y el token de
 * Paddle.js. Si falta una, no se pinta ningún botón de compra.
 */
export const creditsEnabled =
    import.meta.env.VITE_PAYMENTS_ENABLED === 'true' &&
    Boolean(import.meta.env.VITE_PADDLE_CLIENT_TOKEN);

export interface CheckoutResult {
    checkoutUrl: string | null;
    transactionId: string | null;
}

/**
 * Pide al servidor la transacción (el precio lo pone él) y devuelve el ID con el
 * que Paddle.js abre el overlay. Hay que estar con la sesión iniciada: el token
 * va en la cabecera y es lo que identifica al comprador.
 */
export async function startCheckout(
    plan: CreditPlan,
    session: { accessToken: string },
): Promise<CheckoutResult> {
    const base = import.meta.env.VITE_SUPABASE_URL as string;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    const res = await fetch(`${base}/functions/v1/paddle-checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: anon,
            Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ pack: plan.id }),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
        const detail =
            typeof body?.detail === 'string'
                ? body.detail
                : body?.detail?.detail ?? body?.error ?? `HTTP ${res.status}`;
        throw new Error(String(detail));
    }
    if (!body?.transactionId && !body?.checkoutUrl) {
        throw new Error('Paddle no ha devuelto la página de pago');
    }

    return { checkoutUrl: body.checkoutUrl ?? null, transactionId: body.transactionId ?? null };
}
