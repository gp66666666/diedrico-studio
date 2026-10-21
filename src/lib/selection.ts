/**
 * Número de elementos que consume cada herramienta de geometría.
 *
 * Vive fuera del store para poder probarlo sin levantar Supabase.
 * Si añades una herramienta, añádela aquí o se quedará esperando selección
 * para siempre (ya pasó con giros, abatimientos y "plano por 3 puntos").
 */
/**
 * Número de elementos que consume cada herramienta.
 *
 * Antes esto era una cadena de `if` incompleta: giros, distancias entre
 * rectas/planos, abatimientos, cambios de plano o "plano por 3 puntos"
 * se quedaban en 1 selección y no llegaban a ejecutarse nunca.
 */
export function selectionCountForTool(tool: string): number {
    if (tool === 'none') return 0;

    if (tool.startsWith('distance-')) return 2;
    if (tool.startsWith('advanced-intersection')) return 3;
    if (tool.startsWith('intersection')) return 2;
    if (tool.startsWith('rotation-')) return 2;
    if (tool.startsWith('abatir-') || tool.startsWith('desabatir')) return 2;
    if (tool.startsWith('angle-')) return 2;

    if (tool === 'cambio-plano-h' || tool === 'cambio-plano-v') return 2;
    if (tool === 'plane-3-points') return 3;
    if (tool === 'segment-2-points') return 2;
    if (tool === 'create-group' || tool === 'reconstruct-vm') return 50;

    if (tool === 'solid-section' || tool === 'solid-intersection') return 2;
    if (tool === 'line-solid' || tool === 'sphere-tangent' || tool === 'shadows') return 2;

    if (tool.startsWith('poliedro-') || tool.startsWith('solid-') || tool.startsWith('revolucion-')) return 1;
    if (tool === 'true-length') return 1;

    // Paralelismo / perpendicularidad: 3 cuando hay dos planos o dos rectas de referencia
    if (['plane-perp-2-planes', 'line-parallel-2-planes', 'plane-parallel-2-lines'].includes(tool)) return 3;
    if (tool.startsWith('parallel-') || tool.startsWith('perp-') || tool.startsWith('plane-') || tool.startsWith('line-')) return 2;

    return 1;
}

