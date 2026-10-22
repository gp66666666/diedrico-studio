/**
 * Packs de consultas. Se venden a través de Lemon Squeezy, que actúa como
 * vendedor (cobra el IVA europeo y emite la factura); nosotros solo acreditamos
 * las consultas cuando llega su webhook.
 *
 * Si las URLs no están configuradas (variables de entorno vacías), la tienda
 * **no aparece**: la web no anuncia nada que no pueda cobrar.
 */
export interface CreditPack {
    id: string;
    credits: number;
    priceLabel: string;
    /** Enlace de pago de Lemon Squeezy. Vacío = pack oculto. */
    url: string;
}

export const CREDIT_PACKS: CreditPack[] = [
    {
        id: 'p100',
        credits: 100,
        priceLabel: '4,99 €',
        url: import.meta.env.VITE_LEMON_CHECKOUT_100 || '',
    },
    {
        id: 'p300',
        credits: 300,
        priceLabel: '11,99 €',
        url: import.meta.env.VITE_LEMON_CHECKOUT_300 || '',
    },
].filter((p) => p.url !== '');

/** ¿Hay tienda configurada? Si no, no se pinta ningún botón de compra. */
export const creditsEnabled = CREDIT_PACKS.length > 0;

/**
 * Enlace de pago con el comprador identificado. El `user_id` viaja como custom
 * data (por si el email de la cuenta no coincide con el del pago) y el email se
 * rellena en el formulario para no hacerle escribir.
 */
export function checkoutUrl(
    pack: CreditPack,
    buyer: { userId: string; email?: string },
): string {
    const url = new URL(pack.url);
    if (buyer.email) url.searchParams.set('checkout[email]', buyer.email);
    url.searchParams.set('checkout[custom][user_id]', buyer.userId);
    return url.toString();
}
