#!/usr/bin/env node
/**
 * Enciende o apaga la tienda en producción (Vercel) y redespliega.
 *
 *   node scripts/paddle-shop.mjs off    # apagada (por defecto en el repo)
 *   node scripts/paddle-shop.mjs on     # visible para todo el mundo
 *   node scripts/paddle-shop.mjs status # solo consulta, no toca nada
 *
 * Solo cambia `VITE_PAYMENTS_ENABLED`. El token de Paddle y el entorno (live)
 * ya están puestos en Vercel; sin la bandera, el modal y el botón no existen.
 *
 * Necesita VERCEL_TOKEN en el entorno (está en ~/.config/opencode/env.sh).
 * No imprime el token ni los valores de las variables.
 */
const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT = process.env.VERCEL_PROJECT_ID ?? 'prj_3isfYiyDFJRLJTxcEI05fjepTPRH';
const TEAM = process.env.VERCEL_TEAM_ID ?? 'team_DaJ89zMYdQsxM0uK1QfqpcHn';
const KEY = 'VITE_PAYMENTS_ENABLED';

const action = (process.argv[2] ?? 'status').toLowerCase();
if (!['on', 'off', 'status'].includes(action)) {
    console.error('Uso: node scripts/paddle-shop.mjs on|off|status');
    process.exit(1);
}
if (!TOKEN) {
    console.error('Falta VERCEL_TOKEN (cárgalo con: set -a; . ~/.config/opencode/env.sh; set +a)');
    process.exit(1);
}

const api = async (path, init = {}) => {
    const res = await fetch(`https://api.vercel.com${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
        },
    });
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${text.slice(0, 300)}`);
    return body;
};

/** Busca la variable en el proyecto (production). */
const findEnv = async () => {
    const data = await api(`/v9/projects/${PROJECT}/env?teamId=${TEAM}&decrypt=false`);
    const all = Array.isArray(data) ? data : data.envs ?? data.env ?? [];
    return all.find((e) => e.key === KEY && (e.target ?? []).includes('production'));
};

const latestProductionDeployment = async () => {
    const data = await api(`/v6/deployments?projectId=${PROJECT}&teamId=${TEAM}&target=production&limit=1`);
    return data.deployments?.[0] ?? null;
};

const main = async () => {
    const env = await findEnv();
    const current = env?.value ?? '(no existe)';

    if (action === 'status') {
        console.log(`${KEY} = ${current}`);
        const dep = await latestProductionDeployment();
        console.log(`último despliegue: ${dep?.url ?? '?'} (${dep?.state ?? '?'})`);
        return;
    }

    const wanted = action === 'on' ? 'true' : 'false';
    if (current === wanted) {
        console.log(`${KEY} ya está en ${wanted}; no se toca nada.`);
        return;
    }

    if (!env) {
        await api(`/v10/projects/${PROJECT}/env?teamId=${TEAM}&upsert=true`, {
            method: 'POST',
            body: JSON.stringify([{ key: KEY, value: wanted, type: 'plain', target: ['production'] }]),
        });
    } else {
        await api(`/v9/projects/${PROJECT}/env/${env.id}?teamId=${TEAM}`, {
            method: 'PATCH',
            body: JSON.stringify({ value: wanted }),
        });
    }
    console.log(`${KEY}: ${current} → ${wanted}`);

    const dep = await latestProductionDeployment();
    if (!dep) throw new Error('no hay despliegues de producción para redesplegar');
    const created = await api(`/v13/deployments?teamId=${TEAM}&forceNew=1`, {
        method: 'POST',
        body: JSON.stringify({ name: 'diedrico-studio', deploymentId: dep.id, target: 'production' }),
    });
    console.log(`redesplegando: https://${created.url}`);
    console.log('Espera a que termine y comprueba el bundle antes de fiarte.');
};

main().catch((err) => {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
});
