// Configuración del plan premium. Un solo sitio para cambiar qué se vende.
// Si mueves el precio, cámbialo también en los tiers de Ko-fi.

export const PREMIUM = {
    /** Enlace de membresías de Ko-fi (el cobro y los tiers viven allí). */
    kofiUrl: 'https://ko-fi.com/eloigperezzds',

    /** Texto libre; vacío = no se muestra precio en la web. */
    priceLabel: '4,99 €/mes',

    /** Lo que desbloquea el plan. Se pinta tal cual en el modal. */
    features: [
        {
            id: 'academy',
            title: 'Academia completa',
            description: 'Todos los temas y ejercicios resueltos, con tu progreso guardado.',
        },
        {
            id: 'ai',
            title: 'Asistente IA',
            description: 'Resuelve el ejercicio paso a paso y lo dibuja en el lienzo.',
        },
    ],

    /**
     * Cómo se activa: el webhook de Ko-fi acredita el mes automáticamente.
     * Si el email de Ko-fi no coincide con el de la cuenta, se revisa a mano.
     */
    activationNote:
        'Se activa sola al pagar. Usa en Ko-fi el mismo email con el que te registraste aquí; si usaste otro, escríbeme y lo arreglo.',
} as const;

export const isPremiumFeature = (id: (typeof PREMIUM.features)[number]['id']): boolean =>
    PREMIUM.features.some((f) => f.id === id);
