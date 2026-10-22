/**
 * Apoyo al proyecto.
 *
 * Ahora mismo **no se vende nada**: la aplicación es gratis y el asistente tiene
 * un límite diario de consultas. Ko-fi es solo para donativos, sin
 * contraprestación: un donativo no es una venta, no lleva IVA y no obliga a
 * darse de alta en nada.
 *
 * Cuando algún día haya pagos de verdad, este es el único sitio que hay que
 * tocar (y el precio no se anuncia hasta que se pueda cobrar).
 */
export const SUPPORT = {
    /** Donativos. No desbloquea nada: no hay nada bloqueado. */
    kofiUrl: 'https://ko-fi.com/eloigperezzds',

    /** Consultas gratuitas al día por cuenta (informativo; manda el servidor). */
    freePerDay: 5,
} as const;
