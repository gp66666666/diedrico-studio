// Configuración del plan premium. Un solo sitio para cambiar qué se vende.
// Si mueves el precio, cámbialo también en los tiers de Ko-fi.

export const PREMIUM = {
    /** Enlace de membresías de Ko-fi (el cobro y los tiers viven allí). */
    kofiUrl: 'https://ko-fi.com/eloigperezzds',

    /** Texto libre; vacío = no se muestra precio en la web. */
    priceLabel: '',

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

    /** Nota honesta: hoy la activación es manual (Ko-fi no avisa a la app). */
    activationNote:
        'Tras el pago, activo tu cuenta a mano con el email con el que te registraste. Suele tardar menos de 24 h.',
} as const;

export const isPremiumFeature = (id: (typeof PREMIUM.features)[number]['id']): boolean =>
    PREMIUM.features.some((f) => f.id === id);
