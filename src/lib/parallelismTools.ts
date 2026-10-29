/**
 * Herramientas que gestiona `ParallelismTool` (paralelismo y perpendicularidad).
 *
 * No se puede filtrar por prefijo (`plane-`, `line-`): también los usan
 * herramientas que NO son de paralelismo y se colaban en su `useEffect`.
 * Con `plane-3-points` eso significaba que, al segundo clic, la herramienta
 * se reseteaba y el plano nunca llegaba a crearse.
 */
export const PARALLELISM_PERP_TOOLS = [
    'parallel-line-line',
    'parallel-line-plane',
    'plane-parallel-line',
    'perp-line-line',
    'perp-line-plane',
    'perp-plane-line',
    'plane-parallel-plane',
    'plane-perp-2-planes',
    'line-parallel-2-planes',
    'plane-parallel-2-lines',
] as const;

export function isParallelismTool(tool: string | null | undefined): boolean {
    return !!tool && (PARALLELISM_PERP_TOOLS as readonly string[]).includes(tool);
}
